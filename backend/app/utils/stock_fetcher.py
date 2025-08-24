import os
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
TWELVE_DATA_KEY = os.getenv("TWELVE_DATA_API_KEY")
FINNHUB_KEY = os.getenv("FINNHUB_API_KEY")

# --------------------------
# 1. Live Price Fetch
# --------------------------
async def fetch_live_price(symbol: str):
    async with httpx.AsyncClient(timeout=10) as client:
        # Alpha Vantage
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_KEY}"
        r = await client.get(url)
        if r.status_code == 200 and "Global Quote" in r.json():
            quote = r.json()["Global Quote"]
            if quote and "05. price" in quote:
                return {
                    "symbol": symbol,
                    "price": float(quote["05. price"]),
                    "source": "Alpha Vantage"
                }

        # Twelve Data fallback
        url = f"https://api.twelvedata.com/price?symbol={symbol}&apikey={TWELVE_DATA_KEY}"
        r = await client.get(url)
        if r.status_code == 200 and "price" in r.json():
            return {
                "symbol": symbol,
                "price": float(r.json()["price"]),
                "source": "Twelve Data"
            }

        # Finnhub fallback
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_KEY}"
        r = await client.get(url)
        if r.status_code == 200 and "c" in r.json() and r.json()["c"] != 0:
            return {
                "symbol": symbol,
                "price": float(r.json()["c"]),
                "source": "Finnhub"
            }

    return None


# --------------------------
# 2. Historical Data Fetch
# --------------------------
async def fetch_historical_data(symbol: str, days: int):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    async with httpx.AsyncClient(timeout=10) as client:
        url = (
            f"https://www.alphavantage.co/query"
            f"?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}"
            f"&outputsize=compact&apikey={ALPHA_VANTAGE_KEY}"
        )
        r = await client.get(url)
        if r.status_code == 200 and "Time Series (Daily)" in r.json():
            ts = r.json()["Time Series (Daily)"]
            data = [
                {"date": date, "close": float(values["4. close"])}
                for date, values in ts.items()
                if start_date.strftime("%Y-%m-%d") <= date <= end_date.strftime("%Y-%m-%d")
            ]
            return list(sorted(data, key=lambda x: x["date"]))

    return None


# --------------------------
# 3. NSE/BSE Gainers & Losers
# --------------------------
async def fetch_gainers_losers(exchange: str):
    """Scrape NSE/BSE gainers & losers from Moneycontrol."""
    url_map = {
        "NSE": "https://www.moneycontrol.com/stocks/marketstats/nsegainer/index.php",
        "BSE": "https://www.moneycontrol.com/stocks/marketstats/bsegainer/index.php",
    }
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url_map[exchange])
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "html.parser")

        rows = soup.select("table.tbldata14 tr")[1:6]  # top 5
        gainers = []
        for row in rows:
            cols = row.find_all("td")
            if len(cols) >= 5:
                gainers.append({
                    "symbol": cols[0].get_text(strip=True),
                    "price": cols[1].get_text(strip=True),
                    "change": cols[3].get_text(strip=True),
                    "percent_change": cols[4].get_text(strip=True)
                })

        return {"exchange": exchange, "gainers": gainers}
