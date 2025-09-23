from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import os, httpx
from .google_sheet_data import fetch_from_google_sheet

router = APIRouter()

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")


def is_indian_stock(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")


def parse_float(val, default=None):
    try:
        return float(str(val).replace("%", "").strip())
    except Exception:
        return default


def parse_int(val, default=None):
    try:
        return int(float(val))
    except Exception:
        return default


@router.get("/live-stock-data")
async def live_stock_data(symbols: str = Query(..., description="Comma separated stock symbols")):
    try:
        raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]
        results = []

        # ✅ 1. Try Google Sheet first
        try:
            sheet_data = fetch_from_google_sheet(raw_symbols)
            if sheet_data:
                return {"data": sheet_data}
        except Exception as e:
            print(f"⚠️ Google Sheet fetch failed: {e}")

        # ✅ 2. Fall back to APIs
        async with httpx.AsyncClient(timeout=15) as client:
            for symbol in raw_symbols:
                stock_data = None

                # --- Alpha Vantage ---
                if ALPHA_VANTAGE_API_KEY:
                    try:
                        url = "https://www.alphavantage.co/query"
                        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
                        r = await client.get(url, params=params)
                        try:
                            av_json = r.json()
                        except Exception as je:
                            results.append({"Symbol": symbol, "Error": f"AlphaVantage invalid JSON: {r.text[:200]}"})
                            continue

                        av_data = av_json.get("Global Quote", {})
                        if av_data:
                            stock_data = {
                                "Symbol": symbol,
                                "Price": parse_float(av_data.get("05. price")),
                                "Change": parse_float(av_data.get("09. change")),
                                "PercentChange": parse_float(av_data.get("10. change percent")),
                                "Volume": parse_int(av_data.get("06. volume")),
                                "Sector": "N/A",
                                "Source": "AlphaVantage",
                            }
                    except Exception as e:
                        print(f"⚠️ AlphaVantage error for {symbol}: {e}")

                # --- Twelve Data ---
                if not stock_data and TWELVE_DATA_API_KEY:
                    try:
                        url = "https://api.twelvedata.com/quote"
                        params = {"symbol": symbol, "apikey": TWELVE_DATA_API_KEY}
                        if is_indian_stock(symbol):
                            params["exchange"] = "NSE"
                        r = await client.get(url, params=params)
                        try:
                            td_json = r.json()
                        except Exception:
                            results.append({"Symbol": symbol, "Error": f"TwelveData invalid JSON: {r.text[:200]}"})
                            continue

                        if td_json.get("price"):
                            stock_data = {
                                "Symbol": symbol,
                                "Price": parse_float(td_json.get("price")),
                                "Change": parse_float(td_json.get("change")),
                                "PercentChange": parse_float(td_json.get("percent_change")),
                                "Volume": parse_int(td_json.get("volume")),
                                "Sector": td_json.get("sector", "UNKNOWN"),
                                "Source": "TwelveData",
                            }
                        elif "message" in td_json:
                            stock_data = {"Symbol": symbol, "Error": f"TwelveData: {td_json['message']}"}
                    except Exception as e:
                        print(f"⚠️ TwelveData error for {symbol}: {e}")

                # --- Finnhub ---
                if not stock_data and FINNHUB_API_KEY:
                    try:
                        url = "https://finnhub.io/api/v1/quote"
                        params = {"symbol": symbol, "token": FINNHUB_API_KEY}
                        r = await client.get(url, params=params)
                        try:
                            fh_json = r.json()
                        except Exception:
                            results.append({"Symbol": symbol, "Error": f"Finnhub invalid JSON: {r.text[:200]}"})
                            continue

                        if fh_json.get("c") is not None:
                            stock_data = {
                                "Symbol": symbol,
                                "Price": parse_float(fh_json.get("c")),
                                "Change": parse_float(fh_json.get("d")),
                                "PercentChange": parse_float(fh_json.get("dp")),
                                "Volume": parse_int(fh_json.get("v")),
                                "Sector": "N/A",
                                "Source": "Finnhub",
                            }
                        elif "error" in fh_json:
                            stock_data = {"Symbol": symbol, "Error": f"Finnhub: {fh_json['error']}"}
                    except Exception as e:
                        print(f"⚠️ Finnhub error for {symbol}: {e}")

                if not stock_data:
                    stock_data = {"Symbol": symbol, "Error": "No data found"}

                results.append(stock_data)

        return {"data": results}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
