# backend/app/services/alpha_vantage_service.py
import os
import httpx

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")

async def global_quote(client: httpx.AsyncClient, symbol: str):
    if not ALPHA_VANTAGE_API_KEY:
        return {}
    url = "https://www.alphavantage.co/query"
    params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
    r = await client.get(url, params=params, timeout=20)
    return r.json().get("Global Quote", {})
