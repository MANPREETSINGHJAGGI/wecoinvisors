from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import List

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API keys
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "TE8DYXRJ2A8NFOX3")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "abe50c45515a4d489c9cb03de847801e")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d216ms9r01qkduphvddgd216ms9r01qkduphvde0")

# --- Live Stock Data Endpoint ---
@app.get("/api/live-stock-data")
async def get_live_stock_data(symbols: str = Query(...)):

    result = []
    symbol_list = symbols.split(",")

    async with httpx.AsyncClient() as client:
        for symbol in symbol_list:
            # Alpha Vantage price
            price_url = f"https://www.alphavantage.co/query"
            price_params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY,
            }
            price_response = await client.get(price_url, params=price_params)
            price_data = price_response.json()
            quote = price_data.get("Global Quote", {})

            # Finnhub fundamentals
            profile_url = f"https://finnhub.io/api/v1/stock/profile2"
            profile_params = {"symbol": symbol, "token": FINNHUB_API_KEY}
            profile_response = await client.get(profile_url, params=profile_params)
            profile_data = profile_response.json()

            if not quote or "05. price" not in quote:
                continue

            result.append({
                "symbol": symbol,
                "name": profile_data.get("name", symbol),
                "price": float(quote["05. price"]),
                "change": float(quote["09. change"]),
                "percentChange": float(quote["10. change percent"].replace("%", "")),
                "volume": int(float(quote.get("06. volume", 0))),
                "sector": profile_data.get("finnhubIndustry", "N/A").upper(),
                "marketCap": profile_data.get("marketCapitalization", 0) * 1e6,
                "peRatio": profile_data.get("peBasicExclExtraTTM", 0),
                "eps": profile_data.get("epsTTM", 0),
            })

    return {"data": result}


# --- Sector Heatmap Endpoint ---
@app.get("/api/sector-heatmap")
async def sector_heatmap():
    response = await get_live_stock_data("AAPL,MSFT,AMZN,GOOGL,TSLA,IBM,NFLX,META")
    sector_map = {}

    for stock in response["data"]:
        sector = stock["sector"]
        change = stock["percentChange"]

        if sector not in sector_map:
            sector_map[sector] = []
        sector_map[sector].append(change)

    heatmap_data = []
    for sector, changes in sector_map.items():
        avg_change = sum(changes) / len(changes)
        heatmap_data.append({"sector": sector, "avgChange": round(avg_change, 2)})

    return {"data": heatmap_data}


# --- Historical Chart Endpoint ---
RANGE_MAP = {
    "1D": {"interval": "5min", "outputsize": 78},
    "3D": {"interval": "15min", "outputsize": 78},
    "5D": {"interval": "30min", "outputsize": 78},
    "1M": {"interval": "1day", "outputsize": 30},
    "3M": {"interval": "1day", "outputsize": 90},
    "6M": {"interval": "1day", "outputsize": 180},
    "1Y": {"interval": "1day", "outputsize": 365},
    "2Y": {"interval": "1week", "outputsize": 104},
    "3Y": {"interval": "1week", "outputsize": 156},
    "4Y": {"interval": "1week", "outputsize": 208},
    "5Y": {"interval": "1week", "outputsize": 260},
}

@app.get("/api/historical-chart")
async def historical_chart(symbol: str = Query(...), range: str = Query("1M")):
    range = range.upper()
    if range not in RANGE_MAP:
        return {"error": "Invalid range. Choose from 1D, 3D, 5D, 1M, 3M, 6M, 1Y, 2Y, 3Y, 4Y, 5Y."}

    params = RANGE_MAP[range]
    url = "https://api.twelvedata.com/time_series"

    query_params = {
        "symbol": symbol,
        "interval": params["interval"],
        "outputsize": params["outputsize"],
        "apikey": TWELVE_DATA_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=query_params)
        data = res.json()

    if "values" not in data:
        return {"error": "No chart data found"}

    labels = [v["datetime"] for v in reversed(data["values"])]
    prices = [float(v["close"]) for v in reversed(data["values"])]

    return {
        "symbol": symbol,
        "labels": labels,
        "prices": prices,
        "range": range,
    }
