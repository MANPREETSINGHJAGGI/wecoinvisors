# File: backend/app/main.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

# Import routes + fetcher
from app.routes import live_stock_data, historical_chart, screener, google_prices, google_sheet_data
from app.routes.yfinance_fetcher import fetch_from_yfinance

app = FastAPI()

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.wecoinvisors.com", "https://wecoinvisors.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Register routes -----------------
app.include_router(live_stock_data.router)
app.include_router(historical_chart.router)
app.include_router(screener.router)
app.include_router(google_prices.router, prefix="/api")
app.include_router(google_sheet_data.router, prefix="/api")

# ----------------- Root health check -----------------
@app.get("/")
def root():
    return {"message": "Backend is running"}

# ----------------- API KEYS -----------------
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")

# ----------------- Helpers -----------------
def is_indian_stock(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")

def parse_float(val, default=None):
    try:
        return float(val)
    except (TypeError, ValueError):
        return default

def parse_int(val, default=None):
    try:
        return int(float(val))
    except (TypeError, ValueError):
        return default

# ----------------- Live stock route -----------------
@app.get("/api/live-stock-data")
async def get_live_stock_data(symbols: str = Query(..., description="Comma-separated stock symbols")):
    if not symbols.strip():
        raise HTTPException(status_code=400, detail="No symbols provided")

    raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    symbol_list = [s if "." in s else f"{s}.NS" for s in raw_symbols]

    results = []

    async with httpx.AsyncClient(timeout=15) as client:
        for raw, symbol in zip(raw_symbols, symbol_list):
            # 1️⃣ Primary Yahoo Finance fetch
            stock_data = fetch_from_yfinance(symbol)

            # 2️⃣ Alpha Vantage fallback
            if not stock_data and ALPHA_VANTAGE_API_KEY:
                try:
                    url = "https://www.alphavantage.co/query"
                    params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
                    r = await client.get(url, params=params)
                    av_data = r.json().get("Global Quote", {})
                    if av_data:
                        stock_data = {
                            "symbol": raw,
                            "resolvedSymbol": symbol,
                            "name": symbol,
                            "price": parse_float(av_data.get("05. price")),
                            "change": parse_float(av_data.get("09. change")),
                            "percentChange": parse_float(av_data.get("10. change percent", "0%").replace("%","")),
                            "volume": parse_int(av_data.get("06. volume")),
                            "sector": "N/A",
                            "marketCap": 0,
                            "peRatio": 0,
                            "eps": 0,
                            "currency": "₹" if is_indian_stock(symbol) else "$",
                            "sparkline": [],
                        }
                except Exception as e:
                    print(f"⚠️ AlphaVantage fetch error for {symbol}: {e}")

            # 3️⃣ Twelve Data fallback
            if not stock_data and TWELVE_DATA_API_KEY:
                try:
                    url = "https://api.twelvedata.com/quote"
                    params = {"symbol": symbol, "apikey": TWELVE_DATA_API_KEY}
                    if is_indian_stock(symbol):
                        params["exchange"] = "NSE"
                    r = await client.get(url, params=params)
                    td_data = r.json()
                    if td_data.get("price"):
                        stock_data = {
                            "symbol": raw,
                            "resolvedSymbol": symbol,
                            "name": td_data.get("name", symbol),
                            "price": parse_float(td_data.get("price")),
                            "change": parse_float(td_data.get("change")),
                            "percentChange": parse_float(td_data.get("percent_change")),
                            "volume": parse_int(td_data.get("volume")),
                            "sector": td_data.get("sector", "UNKNOWN"),
                            "marketCap": parse_float(td_data.get("market_cap")),
                            "peRatio": parse_float(td_data.get("pe")),
                            "eps": parse_float(td_data.get("eps")),
                            "currency": "₹" if is_indian_stock(symbol) else "$",
                            "sparkline": [],
                        }
                except Exception as e:
                    print(f"⚠️ TwelveData fetch error for {symbol}: {e}")

            # 4️⃣ Finnhub fallback
            if not stock_data and FINNHUB_API_KEY:
                try:
                    url = "https://finnhub.io/api/v1/quote"
                    params = {"symbol": symbol, "token": FINNHUB_API_KEY}
                    r = await client.get(url, params=params)
                    fh_data = r.json()
                    if fh_data.get("c") is not None:
                        stock_data = {
                            "symbol": raw,
                            "resolvedSymbol": symbol,
                            "name": symbol,
                            "price": parse_float(fh_data.get("c")),
                            "change": parse_float(fh_data.get("d")),
                            "percentChange": parse_float(fh_data.get("dp")),
                            "volume": parse_int(fh_data.get("v")),
                            "sector": "N/A",
                            "marketCap": 0,
                            "peRatio": 0,
                            "eps": 0,
                            "currency": "₹" if is_indian_stock(symbol) else "$",
                            "sparkline": [],
                        }
                except Exception as e:
                    print(f"⚠️ Finnhub fetch error for {symbol}: {e}")

            # 5️⃣ If nothing found
            if not stock_data:
                stock_data = {
                    "symbol": raw,
                    "resolvedSymbol": symbol,
                    "error": "No data found",
                    "currency": "₹" if is_indian_stock(symbol) else "$",
                    "sparkline": [],
                }

            results.append(stock_data)

    return {"data": results}
