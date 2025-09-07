# backend/app/routes/news.py
from fastapi import APIRouter, Query
import httpx
import os
from datetime import datetime

router = APIRouter()

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")  # optional
HN_BASE = "https://hn.algolia.com/api/v1/search"

@router.get("/news")
async def news(symbol: str = Query("AAPL"), limit: int = Query(5, ge=1, le=20)):
    """
    If NEWSAPI_KEY exists, use NewsAPI 'everything' endpoint.
    Otherwise fall back to Hacker News Algolia as a free demo.
    """
    if NEWSAPI_KEY:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": symbol,
            "pageSize": limit,
            "sortBy": "publishedAt",
            "language": "en",
            "apiKey": NEWSAPI_KEY,
        }
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, params=params)
            data = r.json()
        articles = data.get("articles", [])
        items = [
            {
                "title": a.get("title"),
                "url": a.get("url"),
                "source": a.get("source", {}).get("name"),
                "ts": a.get("publishedAt"),
            }
            for a in articles
        ]
        return {"ok": True, "data": items}

    # Fallback: HN Algolia
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(HN_BASE, params={"query": symbol, "tags": "story", "hitsPerPage": limit})
        j = r.json()
    items = [
        {
            "title": h.get("title"),
            "url": h.get("url"),
            "source": "HN",
            "ts": datetime.utcfromtimestamp(h.get("created_at_i", 0)).isoformat() + "Z",
        }
        for h in j.get("hits", [])
    ]
    return {"ok": True, "data": items}
