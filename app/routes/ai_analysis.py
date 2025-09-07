# backend/app/routes/ai_analysis.py
from fastapi import APIRouter, Body
import os
import httpx

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

@router.post("/ai/analyze")
async def ai_analyze(payload: dict = Body(...)):
    """
    Expects: { "prompt": "...", "context": {...optional stock data...} }
    Uses OpenAI Chat Completions (compatible endpoint).
    """
    prompt = payload.get("prompt", "").strip()
    context = payload.get("context", {})

    if not OPENAI_API_KEY:
        return {"error": "OPENAI_API_KEY missing"}
    if not prompt:
        return {"error": "prompt required"}

    # Minimal, model-agnostic call to OpenAI
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    body = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are an analytical, cautious AI for stock education and insights."},
            {"role": "user", "content": f"Context: {context}\n\nTask: {prompt}"},
        ],
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=body)
        j = r.json()

    content = (j.get("choices") or [{}])[0].get("message", {}).get("content", "")
    return {"ok": True, "content": content}
