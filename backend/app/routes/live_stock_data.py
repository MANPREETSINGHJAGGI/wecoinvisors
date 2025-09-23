from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import httpx, os
from .google_sheet_data import fetch_from_google_sheet

router = APIRouter()

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")

def is_indian_stock(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")

def parse_float(val, default=None):
    try: return float(val)
    except: return default

def parse_int(val, default=None):
    try: return int(float(val))
    except: return default


@router.get("/api/live-stock-data")
async def live_stock_data(symbols: str = Query(..., description="Comma separated stock symbols")):
    try:
        raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]

        # ✅ 1. Try Google Sheet
        try:
            sheet_data = fetch_from_google_sheet(raw_symbols)
            if sheet_data:
                return {"data": sheet_data}
        except Exception as e:
            print(f"⚠️ Google Sheet fetch failed: {e}")

        results = []
        async with httpx.AsyncClient(timeout=15) as client:
            for symbol in raw_symbols:
                stock_data = None

                # 2️⃣ Alpha Vantage
                if ALPHA_VANTAGE_API_KEY:
                    try:
                        url = "https://www.alphavantage.co/query"
                        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
                        r = await client.get(url, params=params)
                        av_data = r.json().get("Global Quote", {})
                        if av_data:
                            stock_data = {
                                "symbol": symbol,
                                "price": parse_float(av_data.get("05. price")),
                                "change": parse_float(av_data.get("09. change")),
                                "percentChange": parse_float(av_data.get("10. change percent", "0%").replace("%", "")),
                                "volume": parse_int(av_data.get("06. volume")),
                                "sector": "N/A",
                            }
                    except Exception as e:
                        print(f"⚠️ AlphaVantage error: {e}")

                # 3️⃣ Twelve Data
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
                                "symbol": symbol,
                                "price": parse_float(td_data.get("price")),
                                "change": parse_float(td_data.get("change")),
                                "percentChange": parse_float(td_data.get("percent_change")),
                                "volume": parse_int(td_data.get("volume")),
                                "sector": td_data.get("sector", "UNKNOWN"),
                            }
                    except Exception as e:
                        print(f"⚠️ TwelveData error: {e}")

                # 4️⃣ Finnhub
                if not stock_data and FINNHUB_API_KEY:
                    try:
                        url = "https://finnhub.io/api/v1/quote"
                        params = {"symbol": symbol, "token": FINNHUB_API_KEY}
                        r = await client.get(url, params=params)
                        fh_data = r.json()
                        if fh_data.get("c") is not None:
                            stock_data = {
                                "symbol": symbol,
                                "price": parse_float(fh_data.get("c")),
                                "change": parse_float(fh_data.get("d")),
                                "percentChange": parse_float(fh_data.get("dp")),
                                "volume": parse_int(fh_data.get("v")),
                                "sector": "N/A",
                            }
                    except Exception as e:
                        print(f"⚠️ Finnhub error: {e}")

                if not stock_data:
                    stock_data = {"symbol": symbol, "error": "No data found"}

                results.append(stock_data)

        return {"data": results}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
