# backend/app/routes/screener.py
from fastapi import APIRouter, Query
from typing import List, Dict, Any
import asyncio
import yfinance as yf

router = APIRouter()

def _score(row: Dict[str, Any]) -> float:
    """Simple scoring: blend daily % change and (optional) PE/EPS hints if present."""
    score = 0.0
    score += row.get("percentChange", 0) * 1.0
    # Positive EPS + moderate PE gets a small bump (placeholders if missing)
    pe = row.get("peRatio")
    eps = row.get("eps")
    if eps and eps > 0:
        score += 1.0
    if pe and 5 <= pe <= 25:
        score += 0.5
    return round(score, 2)

async def _fetch_one(symbol: str) -> Dict[str, Any]:
    try:
        t = yf.Ticker(symbol)
        hist = t.history(period="2d")
        info = {}
        try:
            info = t.info or {}
        except Exception:
            # Some tickers block info; ignore silently
            info = {}

        if hist.empty:
            return {"symbol": symbol, "error": "no_data"}

        last = hist.iloc[-1]
        prev = hist.iloc[-2] if len(hist) > 1 else last
        change = float(last["Close"] - prev["Close"])
        pct = float((change / prev["Close"]) * 100) if prev["Close"] else 0.0

        row = {
            "symbol": symbol,
            "name": info.get("shortName", symbol),
            "price": float(last["Close"]),
            "change": round(change, 2),
            "percentChange": round(pct, 2),
            "volume": int(last["Volume"]),
            "sector": info.get("sector", "N/A"),
            "marketCap": float(info.get("marketCap", 0) or 0),
            "peRatio": float(info.get("trailingPE", 0) or 0),
            "eps": float(info.get("trailingEps", 0) or 0),
        }
        row["score"] = _score(row)
        return row
    except Exception as e:
        print(f"⚠️ screener yfinance error {symbol}: {e}")
        return {"symbol": symbol, "error": "exception"}

@router.get("/screener")
async def screener(
    symbols: str = Query(..., description="Comma-separated symbols, e.g. RELIANCE.NS,TCS.NS,INFY.NS"),
    top: int = Query(10, ge=1, le=100),
):
    syms = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    rows = await asyncio.gather(*[_fetch_one(s) for s in syms])
    # Filter successful
    good = [r for r in rows if "error" not in r]
    ranked = sorted(good, key=lambda r: r["score"], reverse=True)[:top]
    return {"count": len(ranked), "results": ranked}
