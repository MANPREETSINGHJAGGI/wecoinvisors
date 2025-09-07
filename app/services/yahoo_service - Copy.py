# backend/app/services/yahoo_service.py
import yfinance as yf
from typing import Any, Dict

def quote(symbol: str) -> Dict[str, Any] | None:
    t = yf.Ticker(symbol)
    hist = t.history(period="2d")
    if hist.empty:
        return None
    last = hist.iloc[-1]
    prev = hist.iloc[-2] if len(hist) > 1 else last
    change = float(last["Close"] - prev["Close"])
    pct = float((change / prev["Close"]) * 100) if prev["Close"] else 0.0
    try:
        info = t.info or {}
    except Exception:
        info = {}
    return {
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
