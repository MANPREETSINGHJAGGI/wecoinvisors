# backend/routers/stocks.py

from __future__ import annotations

import os
import json
import time
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query, HTTPException
import httpx
import yfinance as yf

# ---------- Router ----------
router = APIRouter(prefix="/stocks", tags=["Stocks"])

# ---------- Config / Env ----------
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "TE8DYXRJ2A8NFOX3")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "abe50c45515a4d489c9cb03de847801e")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d216ms9r01qkduphvddgd216ms9r01qkduphvde0")

# Cache TTL (seconds)
LIVE_CACHE_TTL = int(os.getenv("LIVE_CACHE_TTL", "30"))

# Concurrency limit for “all symbols”
CONCURRENCY_LIMIT = int(os.getenv("LIVE_FETCH_CONCURRENCY", "10"))

# ---------- Load NSE Universe ----------
def _load_nse_universe() -> List[Dict[str, Any]]:
    """
    Load backend/data/nse_all_stocks.json.
    Each entry is expected like:
      {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "sector": "Energy"}
    """
    here = Path(__file__).resolve()
    root = here.parent.parent  # backend/
    data_path = root / "data" / "nse_all_stocks.json"
    if not data_path.exists():
        print(f"⚠️ nse_all_stocks.json not found at {data_path}. Returning empty list.")
        return []
    try:
        with data_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            # Normalize shape
            out = []
            for item in data:
                sym = str(item.get("symbol", "")).strip().upper()
                if sym and not sym.endswith(".NS"):
                    sym = f"{sym}.NS"
                out.append(
                    {
                        "symbol": sym,
                        "name": item.get("name") or sym,
                        "sector": item.get("sector") or "UNKNOWN",
                    }
                )
            return out
    except Exception as e:
        print(f"⚠️ Failed to load NSE universe: {e}")
        return []

NSE_UNIVERSE: List[Dict[str, Any]] = _load_nse_universe()

# ---------- Helpers ----------
def _is_nse_symbol(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")

def _normalize_symbol(symbol: str) -> str:
    s = symbol.strip().upper()
    if not s:
        return s
    if not s.endswith(".NS"):
        s = f"{s}.NS"
    return s

def _now() -> float:
    return time.time()

def _format_live_payload(
    symbol: str,
    name: Optional[str],
    price: Optional[float],
    change: Optional[float],
    pct_change: Optional[float],
    volume: Optional[int],
    sector: Optional[str] = None,
    market_cap: Optional[float] = None,
    pe: Optional[float] = None,
    eps: Optional[float] = None,
) -> Dict[str, Any]:
    return {
        "symbol": symbol,
        "name": name or symbol,
        "price": float(price) if price is not None else None,
        "change": float(change) if change is not None else None,
        "percentChange": float(pct_change) if pct_change is not None else None,
        "volume": int(volume) if volume is not None else None,
        "sector": sector or "UNKNOWN",
        "marketCap": float(market_cap) if market_cap is not None else None,
        "peRatio": float(pe) if pe is not None else None,
        "eps": float(eps) if eps is not None else None,
    }

# ---------- In-Memory Cache ----------
# key: symbol -> value: {"ts": float, "data": dict}
_live_cache: Dict[str, Dict[str, Any]] = {}

def _cache_get(symbol: str) -> Optional[Dict[str, Any]]:
    entry = _live_cache.get(symbol)
    if not entry:
        return None
    if _now() - entry["ts"] <= LIVE_CACHE_TTL:
        return entry["data"]
    # expired
    _live_cache.pop(symbol, None)
    return None

def _cache_set(symbol: str, data: Dict[str, Any]) -> None:
    _live_cache[symbol] = {"ts": _now(), "data": data}

# ---------- Providers ----------
async def _from_alpha_vantage(client: httpx.AsyncClient, symbol: str) -> Optional[Dict[str, Any]]:
    try:
        url = "https://www.alphavantage.co/query"
        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
        r = await client.get(url, params=params, timeout=10)
        j = r.json() or {}
        gq = j.get("Global Quote", {})
        if gq and gq.get("05. price"):
            price = float(gq.get("05. price"))
            change = float(gq.get("09. change", 0) or 0)
            pct = str(gq.get("10. change percent", "0%")).replace("%", "").strip()
            pct_change = float(pct or 0)
            volume = int(float(gq.get("06. volume", 0) or 0))
            return _format_live_payload(symbol, symbol, price, change, pct_change, volume)
    except Exception:
        pass
    return None

async def _from_twelve_data(client: httpx.AsyncClient, symbol: str) -> Optional[Dict[str, Any]]:
    try:
        url = "https://api.twelvedata.com/quote"
        params = {"symbol": symbol, "apikey": TWELVE_DATA_API_KEY}
        if _is_nse_symbol(symbol):
            params["exchange"] = "NSE"
        r = await client.get(url, params=params, timeout=10)
        j = r.json() or {}
        if j.get("price"):
            return _format_live_payload(
                symbol=symbol,
                name=j.get("name") or symbol,
                price=float(j.get("price", 0) or 0),
                change=float(j.get("change", 0) or 0),
                pct_change=float(j.get("percent_change", 0) or 0),
                volume=int(float(j.get("volume", 0) or 0)) if j.get("volume") else None,
                sector=j.get("sector") or "UNKNOWN",
                market_cap=float(j.get("market_cap", 0) or 0),
                pe=float(j.get("pe", 0) or 0) if j.get("pe") else None,
                eps=float(j.get("eps", 0) or 0) if j.get("eps") else None,
            )
    except Exception:
        pass
    return None

async def _from_finnhub(client: httpx.AsyncClient, symbol: str) -> Optional[Dict[str, Any]]:
    try:
        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": symbol, "token": FINNHUB_API_KEY}
        r = await client.get(url, params=params, timeout=10)
        j = r.json() or {}
        if j.get("c"):
            return _format_live_payload(
                symbol=symbol,
                name=symbol,
                price=float(j.get("c", 0) or 0),
                change=float(j.get("d", 0) or 0),
                pct_change=float(j.get("dp", 0) or 0),
                volume=None,
            )
    except Exception:
        pass
    return None

async def _from_yfinance(symbol: str) -> Optional[Dict[str, Any]]:
    """
    yfinance fallback with defensive guards against empty history:
      - try last 2 days; if empty, try 5d; if still empty, return None
    """
    if not _is_nse_symbol(symbol):
        return None
    try:
        ticker = yf.Ticker(symbol)
        # Try increasing windows
        for period in ("2d", "5d", "10d"):
            hist = ticker.history(period=period, interval="1d")
            if hist is None or hist.empty:
                continue
            # use last available close
            last = hist.iloc[-1]
            # handle single-row history safely
            prev_close = hist.iloc[-2]["Close"] if len(hist) >= 2 else last["Close"]
            price = float(last["Close"])
            change = float(price - float(prev_close))
            pct_change = (change / float(prev_close)) * 100 if prev_close else 0.0
            volume = int(last["Volume"]) if "Volume" in last and not (last["Volume"] is None) else None
            return _format_live_payload(symbol, symbol, price, change, pct_change, volume)
    except Exception:
        # swallow and return None
        return None
    return None

# ---------- Core fetch with fallback + cache ----------
async def _fetch_live_for_symbol(symbol: str, *, name: Optional[str] = None, sector: Optional[str] = None) -> Dict[str, Any]:
    sym = _normalize_symbol(symbol)
    # cache
    cached = _cache_get(sym)
    if cached:
        # inject name/sector if we have them
        cached2 = {**cached}
        if name and not cached2.get("name"):
            cached2["name"] = name
        if sector and (not cached2.get("sector") or cached2.get("sector") == "UNKNOWN"):
            cached2["sector"] = sector
        return cached2

    async with httpx.AsyncClient() as client:
        # Fallback order: Alpha Vantage → Twelve Data → Finnhub → yfinance
        for provider in (
            lambda: _from_alpha_vantage(client, sym),
            lambda: _from_twelve_data(client, sym),
            lambda: _from_finnhub(client, sym),
            lambda: _from_yfinance(sym),
        ):
            data = await provider()
            if data and data.get("price") is not None:
                # prefer provided name/sector if available
                if name:
                    data["name"] = name
                if sector and (not data.get("sector") or data.get("sector") == "UNKNOWN"):
                    data["sector"] = sector
                _cache_set(sym, data)
                return data

    # If absolutely nothing worked, return a consistent shape with None price
    empty_payload = _format_live_payload(sym, name or sym, None, None, None, None, sector or "UNKNOWN")
    _cache_set(sym, empty_payload)
    return empty_payload

# ---------- Endpoints ----------

@router.get("/live")
async def get_live_price(
    symbol: str = Query(..., description="Stock symbol (e.g., RELIANCE or RELIANCE.NS)")
):
    """
    Live data for a single symbol.
    Automatically normalizes to NSE (.NS) unless already provided.
    """
    data = await _fetch_live_for_symbol(symbol)
    return data

@router.get("/live/batch")
async def get_live_price_batch(
    symbols: str = Query(..., description="Comma-separated symbols (e.g., RELIANCE,TCS,INFY.NS)")
):
    """
    Live data for a list of comma-separated symbols.
    """
    syms = [_normalize_symbol(s) for s in symbols.split(",") if s.strip()]
    if not syms:
        raise HTTPException(status_code=400, detail="No valid symbols provided.")
    tasks = [asyncio.create_task(_fetch_live_for_symbol(s)) for s in syms]
    results = await asyncio.gather(*tasks)
    return results

@router.get("/live/all")
async def get_all_live_stocks(
    sector: Optional[str] = Query(None, description="Filter by sector (exact match; case-insensitive)"),
    limit: int = Query(50, ge=1, le=2000, description="Max number of stocks to return"),
    include_unknown_sector: bool = Query(True, description="Include stocks with unknown/missing sector")
):
    """
    Live data for NSE universe loaded from backend/data/nse_all_stocks.json.
    - Filter by sector
    - Limit results
    - Cached for ~30s per symbol
    """
    if not NSE_UNIVERSE:
        return []

    # Filter by sector if requested
    filtered = []
    if sector:
        wanted = sector.strip().lower()
        for s in NSE_UNIVERSE:
            sec = (s.get("sector") or "UNKNOWN").lower()
            if sec == wanted:
                filtered.append(s)
        if include_unknown_sector:
            # Optionally include UNKNOWNs too
            filtered.extend([s for s in NSE_UNIVERSE if (s.get("sector") or "UNKNOWN").lower() == "unknown"])
    else:
        filtered = list(NSE_UNIVERSE)
        if not include_unknown_sector:
            filtered = [s for s in filtered if (s.get("sector") or "UNKNOWN").upper() != "UNKNOWN"]

    # Apply limit
    filtered = filtered[:limit]

    # Concurrency control
    sem = asyncio.Semaphore(CONCURRENCY_LIMIT)

    async def _guarded_fetch(stock: Dict[str, Any]) -> Dict[str, Any]:
        async with sem:
            return await _fetch_live_for_symbol(
                stock["symbol"],
                name=stock.get("name"),
                sector=stock.get("sector"),
            )

    tasks = [asyncio.create_task(_guarded_fetch(s)) for s in filtered]
    results = await asyncio.gather(*tasks)
    return results

@router.get("/history")
async def get_historical_data(
    symbol: str = Query(..., description="Stock symbol (e.g., RELIANCE or RELIANCE.NS)"),
    period: str = Query("6mo", description="yfinance period (e.g., 1mo, 3mo, 6mo, 1y, 2y, 5y, max)"),
    interval: str = Query("1d", description="yfinance interval (e.g., 1d, 1wk, 1mo)")
):
    """
    Historical OHLC using yfinance with guards if empty.
    """
    sym = _normalize_symbol(symbol)
    try:
        ticker = yf.Ticker(sym)
        hist = ticker.history(period=period, interval=interval)
        if hist is None or hist.empty:
            # try a safer fallback
            hist = ticker.history(period="1y", interval="1d")
        if hist is None or hist.empty:
            return {"symbol": sym, "data": []}
        hist = hist.reset_index()
        rows = []
        for _, row in hist.iterrows():
            rows.append(
                {
                    "date": str(row["Date"]),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]) if not (row["Volume"] is None) else None,
                }
            )
        return {"symbol": sym, "data": rows}
    except Exception as e:
        print(f"⚠️ yfinance history error for {sym}: {e}")
        return {"symbol": sym, "data": []}

@router.get("/gainers-losers")
async def get_gainers_losers():
    """
    Placeholder: returns top gainers/losers from the current cached/all fetched universe
    (You can replace this with official NSE/BSE sources when available.)
    """
    # Try to compute from cache only
    cached_items = []
    for sym, entry in list(_live_cache.items()):
        data = entry.get("data", {})
        if data and data.get("price") is not None and data.get("percentChange") is not None:
            cached_items.append(data)

    if not cached_items:
        return {"gainers": [], "losers": []}

    # Sort by percent change
    sorted_by_change = sorted(cached_items, key=lambda x: x.get("percentChange", 0) or 0, reverse=True)
    gainers = sorted_by_change[:10]
    losers = sorted_by_change[-10:]
    return {"gainers": gainers, "losers": losers}
