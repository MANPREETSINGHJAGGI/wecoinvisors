# backend/app/utils/stock_tracker.py

from pathlib import Path
from dotenv import load_dotenv
import os
import requests
import datetime
import concurrent.futures

# ===== Load .env from backend root =====
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
    r = requests.get(url, params=params, timeout=5)
    r.raise_for_status()
    return r.json()

def try_alpha_vantage(symbol):
    if not ALPHA_KEY:
        return None
    try:
        url = "https://www.alphavantage.co/query"
        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_KEY}
        data = fetch_json(url, params)
        if "Global Quote" in data:
            return {"source": "Alpha Vantage", "data": data["Global Quote"]}
    except Exception as e:
        print(f"[Alpha Vantage Error] {e}")
    return None

def try_twelve_data(symbol):
    if not TWELVE_KEY:
        return None
    try:
        url = "https://api.twelvedata.com/price"
        params = {"symbol": symbol, "apikey": TWELVE_KEY}
        data = fetch_json(url, params)
        if "price" in data:
            return {"source": "Twelve Data", "data": data}
    except Exception as e:
        print(f"[Twelve Data Error] {e}")
    return None

def try_finnhub(symbol):
    if not FINNHUB_KEY:
        return None
    try:
        url = "https://finnhub.io/api/v1/quote"
        params = {"symbol": symbol, "token": FINNHUB_KEY}
        data = fetch_json(url, params)
        if "c" in data:
            return {"source": "Finnhub", "data": data}
    except Exception as e:
        print(f"[Finnhub Error] {e}")
    return None

def get_live_price(symbol: str):
    """Fetch live price using fastest available API."""
    funcs = [try_alpha_vantage, try_twelve_data, try_finnhub]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {executor.submit(func, symbol): func.__name__ for func in funcs}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                return result
    return {"error": "No data from any API"}

def get_historical_data(symbol: str, start_date: str, end_date: str):
    """Fetch historical data from Alpha Vantage (daily)."""
    if not ALPHA_KEY:
        return {"error": "Alpha Vantage API key missing"}

    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "full",
            "apikey": ALPHA_KEY
        }
        data = fetch_json(url, params)
        ts = data.get("Time Series (Daily)", {})
        filtered = {date: price for date, price in ts.items() if start_date <= date <= end_date}
        return {"source": "Alpha Vantage", "data": filtered}
    except Exception as e:
        return {"error": str(e)}

def get_top_gainers_losers():
    """Dummy placeholder — replace with NSE/BSE API if available."""
    return {
        "gainers": ["TCS", "INFY", "RELIANCE"],
        "losers": ["HDFC", "ICICIBANK", "SBIN"]
    }

# ===== CLI Test =====
if __name__ == "__main__":
    stock = "RELIANCE.BSE"
    print(f"📈 Live Price for {stock}:")
    print(get_live_price(stock))

    end = datetime.date.today()
    start = end - datetime.timedelta(days=5)
    print(f"\n📜 Historical Data for {stock} ({start} → {end}):")
    print(get_historical_data(stock, str(start), str(end)))

    print("\n🏆 Top Gainers/Losers:")
    print(get_top_gainers_losers())
