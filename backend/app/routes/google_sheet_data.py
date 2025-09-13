import pandas as pd
import httpx
from fastapi import APIRouter
import os, json
from google.oauth2 import service_account

credentials_info = {
    "type": "service_account",
    "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
    "private_key": os.getenv("GOOGLE_PRIVATE_KEY").replace("\\n", "\n"),
    "token_uri": "https://oauth2.googleapis.com/token"
}

creds = service_account.Credentials.from_service_account_info(credentials_info)

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
