from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os

app = FastAPI()

# CORS setup
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

@app.get("/api/live-stock-data")
async def get_live_stock_data(symbols: str = Query(...)):
    result = []
    symbol_list = symbols.split(",")

    async with httpx.AsyncClient() as client:
        for symbol in symbol_list:
            # Alpha Vantage attempt
            av_url = "https://www.alphavantage.co/query"
            av_params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY,
            }
            av_res = await client.get(av_url, params=av_params)
            av_data = av_res.json()
            quote = av_data.get("Global Quote", {})

            # Finnhub profile
            profile_url = "https://finnhub.io/api/v1/stock/profile2"
            profile_params = {"symbol": symbol, "token": FINNHUB_API_KEY}
            profile_res = await client.get(profile_url, params=profile_params)
            profile_data = profile_res.json()

            if not quote or "05. price" not in quote:
                # Fallback: Twelve Data
                td_url = "https://api.twelvedata.com/quote"
                td_params = {
                    "symbol": symbol,
                    "exchange": "NSE",  # or "NYSE" for US stocks
                    "apikey": TWELVE_DATA_API_KEY,
                }
                td_res = await client.get(td_url, params=td_params)
                td_data = td_res.json()

                if "price" in td_data:
                    result.append({
                        "symbol": symbol,
                        "name": td_data.get("name", symbol),
                        "price": float(td_data.get("price", 0)),
                        "change": float(td_data.get("change", 0)),
                        "percentChange": float(td_data.get("percent_change", 0)),
                        "volume": int(float(td_data.get("volume", 0))),
                        "sector": td_data.get("sector", "UNKNOWN"),
                        "marketCap": float(td_data.get("market_cap", 0)),
                        "peRatio": float(td_data.get("pe", 0)),
                        "eps": float(td_data.get("eps", 0)),
                    })
                continue

            try:
                result.append({
                    "symbol": symbol,
                    "name": profile_data.get("name", symbol),
                    "price": float(quote["05. price"]),
                    "change": float(quote["09. change"]),
                    "percentChange": float(quote["10. change percent"].replace("%", "")),
                    "volume": int(float(quote.get("06. volume", 0))),
                    "sector": profile_data.get("finnhubIndustry", "N/A"),
                    "marketCap": profile_data.get("marketCapitalization", 0) * 1e6,
                    "peRatio": profile_data.get("peBasicExclExtraTTM", 0),
                    "eps": profile_data.get("epsTTM", 0),
                })
            except Exception as e:
                print(f"Error parsing data for {symbol}: {e}")
                continue

    return JSONResponse(content=result)


# --- Sector Heatmap Endpoint ---
@app.get("/api/sector-heatmap")
async def sector_heatmap():
    response = await get_live_stock_data("AAPL,MSFT,AMZN,GOOGL,TSLA,IBM,NFLX,META")
    sector_map = {}

    for stock in response.body:
        stock = stock if isinstance(stock, dict) else eval(stock)
        sector = stock["sector"]
        change = stock["percentChange"]

        if sector not in sector_map:
            sector_map[sector] = []
        sector_map[sector].append(change)

    heatmap_data = []
    for sector, changes in sector_map.items():
        avg = sum(changes) / len(changes)
        heatmap_data.append({"sector": sector, "avgChange": round(avg, 2)})

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
