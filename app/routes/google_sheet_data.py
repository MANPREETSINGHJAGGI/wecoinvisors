import pandas as pd
import httpx
from fastapi import APIRouter

router = APIRouter()

GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSADQzePnh_3b1phmeKkHLXg4qw0nqjzToIYDshMNxFyA9Kb2-6eLo3schpyD65EAoDx7GCYB5O0MTT/pub?output=csv"

@router.get("/google-stock-data")
async def get_google_stock_data():
    async with httpx.AsyncClient() as client:
        r = await client.get(GOOGLE_SHEET_URL)
        df = pd.read_csv(pd.compat.StringIO(r.text))

    # compute Change and %Change if needed
    if "Price" in df.columns and "Previous Close" in df.columns:
        df["Change"] = df["Price"] - df["Previous Close"]
        df["% Change"] = (df["Change"] / df["Previous Close"]) * 100

    return df.to_dict(orient="records")
