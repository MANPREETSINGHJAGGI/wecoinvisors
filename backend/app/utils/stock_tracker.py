# backend/app/utils/stock_tracker.py

from pathlib import Path
from dotenv import load_dotenv
import os
import requests
import datetime
import concurrent.futures
import logging

# ===== Logging =====
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stock_tracker")

# ===== Load .env =====
dotenv_path = Path(__file__).resolve().parents[2] / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)

# ===== ENV Variables =====
BASE_URL = os.getenv("NEXT_PUBLIC_API_BASE_URL", "").rstrip("/")
DB_PATH = os.getenv("WECOINVISORS_DB")
ALPHA_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
TWELVE_KEY = os.getenv("TWELVE_DATA_API_KEY")
FINNHUB_KEY = os.getenv("FINNHUB_API_KEY")


# ===== Helper Functions =====
def fetch_json(url, params):
    """Make GET request and return JSON."""
    try:
        r = requests.get(url, params=params, timeout=8)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.error(f"[HTTP ERROR] {url} | {e}")
        return None


def try_alpha_vantage(symbol):
    if not ALPHA_KEY:
        return None
    try:
        url = "https://www.alphavantage.co/query"
        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_KEY}
        data = fetch_json(url, params)
        if data and "Global Quote" in data:
            q = data["Global Quote"]
            return {
                "source": "Alpha Vantage",
                "symbol": symbol,
                "price": float(q.get("05. price", 0)),
                "volume": int(q.get("06. volume", 0)),
                "change": float(q.get("09. change", 0)),
                "percent_change": q.get("10. change percent", "0%"),
                "raw": q,
            }
    except Exception as e:
        logger.error(f"[Alpha Vantage Error] {e}")
    return None


def try_twelve_data(symbol):
    if not TWELVE_KEY:
        return None
    try:
        url = "https://api.twelvedata.com/price"
        params = {"symbol": symbol, "apikey": TWELVE_KEY}
        data = fetch_json(url, params)
        if data and "price" in data:
            return {
                "source": "Twelve Data",
                "symbol": symbol,
                "price": float(data["price"]),
                "raw": data,
            }
    except Exception as e:
        logger.error(f"[Twelve Data Error] {e}")
    return None


def try_finnhub(symbol):
    if not FINNHUB_KEY:
        return None
    try:
        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": symbol, "token": FINNHUB_KEY}
        data = fetch_json(url, params)
        if data and "c" in data:
            return {
                "source": "Finnhub",
                "symbol": symbol,
                "price": float(data["c"]),
                "open": float(data.get("o", 0)),
                "high": float(data.get("h", 0)),
                "low": float(data.get("l", 0)),
                "prev_close": float(data.get("pc", 0)),
                "raw": data,
            }
    except Exception as e:
        logger.error(f"[Finnhub Error] {e}")
    return None


# ===== Core Fetch Functions =====
def get_live_price(symbol: str):
    """Fetch live price using fastest available API."""
    funcs = [try_alpha_vantage, try_twelve_data, try_finnhub]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {executor.submit(func, symbol): func.__name__ for func in funcs}
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                if result:
                    return result
            except Exception as e:
                logger.error(f"[Thread Error] {e}")
    return {"error": "No data from any API"}


def get_historical_data(symbol: str, start_date: str, end_date: str):
    """Fetch historical daily data from Alpha Vantage."""
    if not ALPHA_KEY:
        return {"error": "Alpha Vantage API key missing"}

    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "full",
            "apikey": ALPHA_KEY,
        }
        data = fetch_json(url, params)
        if not data:
            return {"error": "No response from Alpha Vantage"}

        ts = data.get("Time Series (Daily)", {})
        filtered = [
            {
                "date": date,
                "open": float(values["1. open"]),
                "high": float(values["2. high"]),
                "low": float(values["3. low"]),
                "close": float(values["4. close"]),
                "volume": int(values["5. volume"]),
            }
            for date, values in ts.items()
            if start_date <= date <= end_date
        ]
        filtered.sort(key=lambda x: x["date"])
        return {"source": "Alpha Vantage", "symbol": symbol, "data": filtered}
    except Exception as e:
        return {"error": str(e)}


def get_top_gainers_losers():
    """Dummy placeholder — replace with NSE/BSE API if available."""
    return {
        "gainers": ["TCS.NS", "INFY.NS", "RELIANCE.NS"],
        "losers": ["HDFC.NS", "ICICIBANK.NS", "SBIN.NS"],
    }


# ===== CLI Test =====
if __name__ == "__main__":
    stock = "RELIANCE.NS"
    print(f"📈 Live Price for {stock}:")
    print(get_live_price(stock))

    end = datetime.date.today()
    start = end - datetime.timedelta(days=5)
    print(f"\n📜 Historical Data for {stock} ({start} → {end}):")
    print(get_historical_data(stock, str(start), str(end)))

    print("\n🏆 Top Gainers/Losers:")
    print(get_top_gainers_losers())
