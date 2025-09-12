# backend/app/services/twelve_data_service.py
import os
import httpx

TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")

async def quote(client: httpx.AsyncClient, symbol: str, exchange: str | None = None):
    if not TWELVE_DATA_API_KEY:
        return {}
    url = "https://api.twelvedata.com/quote"
    params = {"symbol": symbol, "apikey": TWELVE_DATA_API_KEY}
    if exchange:
        params["exchange"] = exchange
    r = await client.get(url, params=params, timeout=20)
    return r.json()

async def time_series(client: httpx.AsyncClient, symbol: str, interval: str, outputsize: int):
    if not TWELVE_DATA_API_KEY:
        return {}
    url = "https://api.twelvedata.com/time_series"
    params = {"symbol": symbol, "interval": interval, "outputsize": outputsize, "apikey": TWELVE_DATA_API_KEY}
    r = await client.get(url, params=params, timeout=20)
    return r.json()
