import pandas as pd
import httpx
import io
import yfinance as yf
from fastapi import APIRouter, HTTPException

router = APIRouter()

# 🔗 Published Google Sheet CSV
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSADQzePnh_3b1phmeKkHLXg4qw0nqjzToIYDshMNxFyA9Kb2-6eLo3schpyD65EAoDx7GCYB5O0MTT/pub?output=csv"
GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1LkxYQ-eyqGUZurMn-_si5XxbzSQAvyRHVz3jpncd0t4/export?format=csv&gid=0"

@router.get("/live-google-prices")
async def live_google_prices():
    try:
        # 1️⃣ Fetch Google Sheet CSV
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(GOOGLE_SHEET_URL)
            r.raise_for_status()

        df = pd.read_csv(io.StringIO(r.text))

        if "Symbol" not in df.columns:
            raise HTTPException(status_code=400, detail="Google Sheet missing 'Symbol' column")

        results = []
        symbols = df["Symbol"].dropna().astype(str).tolist()

        # 2️⃣ Fetch batch data (fast)
        tickers = yf.Tickers(" ".join(symbols))

        # 3️⃣ Process each row
        for _, row in df.iterrows():
            symbol = str(row.get("Symbol", "")).strip()
            if not symbol:
                continue

            price = float(row.get("Price", 0))
            prev_close = float(row.get("PrevClose", price))

            yf_data = tickers.tickers[symbol]
            fast_info = getattr(yf_data, "fast_info", {})

            change = price - prev_close
            pct = (change / prev_close * 100) if prev_close else 0

            results.append({
                "symbol": symbol,
                "name": getattr(yf_data.info, "longName", "N/A") if hasattr(yf_data, "info") else "N/A",
                "sector": getattr(yf_data.info, "sector", "N/A") if hasattr(yf_data, "info") else "N/A",
                "price": round(price, 2),
                "change": round(change, 2),
                "percentChange": round(pct, 2),
                "marketCap": fast_info.get("market_cap", "N/A") if fast_info else "N/A",
                "currency": fast_info.get("currency", "INR") if fast_info else "INR",
            })

        return {"data": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
