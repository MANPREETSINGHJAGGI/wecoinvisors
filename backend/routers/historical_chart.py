# File: backend/routers/historical_chart.py
from fastapi import APIRouter, HTTPException, Query
import yfinance as yf

router = APIRouter()

# Allowed ranges mapping for yfinance
VALID_RANGES = {
    "1D": {"period": "1d", "interval": "5m"},
    "5D": {"period": "5d", "interval": "15m"},
    "1M": {"period": "1mo", "interval": "1d"},
    "3M": {"period": "3mo", "interval": "1d"},
    "6M": {"period": "6mo", "interval": "1d"},
    "1Y": {"period": "1y", "interval": "1d"},
    "5Y": {"period": "5y", "interval": "30d"},
}

@router.get("/historical-chart")
async def historical_chart(
    symbol: str = Query(..., description="Stock symbol, e.g. TCS.NS or AAPL"),
    range: str = Query("1M", description="Allowed values: 1D, 5D, 1M, 3M, 6M, 1Y,5Y")
):
    if range not in VALID_RANGES:
        raise HTTPException(status_code=400, detail=f"Invalid range. Allowed: {list(VALID_RANGES.keys())}")

    config = VALID_RANGES[range]
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=config["period"], interval=config["interval"])

        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No historical data for {symbol}")

        data = []
        for idx, row in hist.iterrows():
            data.append({
                "date": idx.strftime("%Y-%m-%d %H:%M"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })

        return {"symbol": symbol, "range": range, "count": len(data), "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical data: {e}")
