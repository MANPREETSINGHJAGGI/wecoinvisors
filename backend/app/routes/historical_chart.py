# backend/app/routes/historical_chart.py
from fastapi import APIRouter, Query
import yfinance as yf
import httpx
import os

router = APIRouter()

TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")

# Map UI ranges to (yfinance interval, total days)
RANGE_MAP = {
    "1D": ("5m", 1),
    "5D": ("30m", 5),
    "1M": ("1d", 30),
    "3M": ("1d", 90),
    "6M": ("1d", 180),
    "1Y": ("1d", 365),
    "3Y": ("1wk", 1095),
    "5Y": ("1wk", 1825),
}

@router.get("/historical-chart")
async def historical_chart(
    symbol: str = Query(..., description="e.g., RELIANCE.NS"),
    range: str = Query("1M", description="1D,5D,1M,3M,6M,1Y,3Y,5Y")
):
    r = range.upper()
    if r not in RANGE_MAP:
        return {"error": f"Invalid range. Allowed: {list(RANGE_MAP.keys())}"}

    interval, period_days = RANGE_MAP[r]

    # 1) yfinance first
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=f"{period_days}d", interval=interval)
        if not hist.empty:
            hist = hist.reset_index()
            labels = [str(x) for x in hist["Date"]]
            prices = [round(float(x), 2) for x in hist["Close"]]
            ohlc = [
                {
                    "t": str(hist.loc[i, "Date"]),
                    "o": float(hist.loc[i, "Open"]),
                    "h": float(hist.loc[i, "High"]),
                    "l": float(hist.loc[i, "Low"]),
                    "c": float(hist.loc[i, "Close"]),
                    "v": int(hist.loc[i, "Volume"]),
                }
                for i in range(len(hist))
            ]
            return {"symbol": symbol, "range": r, "labels": labels, "prices": prices, "ohlc": ohlc}
    except Exception as e:
        print(f"⚠️ yfinance chart error for {symbol}: {e}")

    # 2) TwelveData fallback
    if not TWELVE_DATA_API_KEY:
        return {"error": "No chart data found and TWELVE_DATA_API_KEY not provided."}

    url = "https://api.twelvedata.com/time_series"
    params = {
        "symbol": symbol,
        "interval": interval,
        "outputsize": period_days,
        "apikey": TWELVE_DATA_API_KEY,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(url, params=params)
        data = res.json()

    if "values" not in data:
        return {"error": "No chart data found"}

    vals = list(reversed(data["values"]))
    labels = [v["datetime"] for v in vals]
    prices = [float(v["close"]) for v in vals]
    ohlc = [
        {
            "t": v["datetime"],
            "o": float(v["open"]),
            "h": float(v["high"]),
            "l": float(v["low"]),
            "c": float(v["close"]),
            "v": int(float(v.get("volume", 0))) if v.get("volume") else 0,
        }
        for v in vals
    ]
    return {"symbol": symbol, "range": r, "labels": labels, "prices": prices, "ohlc": ohlc}
