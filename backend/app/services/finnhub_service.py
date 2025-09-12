# backend/app/services/finnhub_service.py
import os
import httpx

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")

async def quote(client: httpx.AsyncClient, symbol: str):
    if not FINNHUB_API_KEY:
        return {}
    url = "https://finnhub.io/api/v1/quote"
    params = {"symbol": symbol, "token": FINNHUB_API_KEY}
    r = await client.get(url, params=params, timeout=20)
    return r.json()
