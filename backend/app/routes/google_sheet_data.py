import os
import pandas as pd
import httpx
from io import StringIO
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from google.oauth2 import service_account
from googleapiclient.discovery import build

router = APIRouter()

# Google Sheets API settings
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
service = None

try:
    # Load credentials from environment variables
    if os.getenv("GOOGLE_PRIVATE_KEY"):
        credentials_info = {
            "type": os.getenv("GOOGLE_TYPE"),
            "project_id": os.getenv("GOOGLE_PROJECT_ID"),
            "private_key_id": os.getenv("GOOGLE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("GOOGLE_PRIVATE_KEY").replace("\\n", "\n"),
            "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "auth_uri": os.getenv("GOOGLE_AUTH_URI"),
            "token_uri": os.getenv("GOOGLE_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL"),
            "client_x509_cert_url": os.getenv("GOOGLE_CLIENT_X509_CERT_URL"),
        }

        creds = service_account.Credentials.from_service_account_info(
            credentials_info, scopes=SCOPES
        )
        service = build("sheets", "v4", credentials=creds)
        print("✅ Google Sheets API connected")

except Exception as e:
    print("⚠️ Google Sheets API setup failed:", e)
    service = None


# Your spreadsheet settings
SPREADSHEET_ID = os.getenv("GOOGLE_SPREADSHEET_ID", "1LkxYQ-eyqGUZurMn-_si5XxbzSQAvyRHVz3jpncd0t4")
RANGE_NAME = "Sheet1!A:Z"
CSV_URL = os.getenv("GOOGLE_SHEET_CSV")


@router.get("/api/live-stock-data")
async def get_live_stock_data(symbols: str = Query(None, description="Comma separated stock symbols")):
    try:
        rows = []
        headers = []

        # ✅ Option 1: Use Google Sheets API
        if service:
            sheet = service.spreadsheets()
            result = sheet.values().get(
                spreadsheetId=SPREADSHEET_ID,
                range=RANGE_NAME
            ).execute()
            values = result.get("values", [])

            if not values:
                return {"data": []}

            headers = [h.strip().lower().replace(" ", "_") for h in values[0]]
            rows = values[1:]

        # ✅ Option 2: Fallback to published CSV
        elif CSV_URL:
            async with httpx.AsyncClient() as client:
                r = await client.get(CSV_URL)
                r.raise_for_status()
                df = pd.read_csv(StringIO(r.text))
                headers = [h.strip().lower().replace(" ", "_") for h in df.columns]
                rows = df.values.tolist()

        else:
            return {"error": "No data source available (Google Sheets or CSV)"}

        # 🔎 Filter by symbols if provided
        data = []
        requested_symbols = {s.strip().upper().replace(".NS", "") for s in symbols.split(",")} if symbols else None

        for row in rows:
            if not row or not row[0]:
                continue

            stock_symbol = str(row[0]).strip().upper().replace(".NS", "")
            if requested_symbols and stock_symbol not in requested_symbols:
                continue

            entry = {"symbol": stock_symbol}
            for i, header in enumerate(headers[1:], start=1):
                if i < len(row):
                    value = row[i]
                    entry[header] = value if value != "" else "-"
            data.append(entry)

        return {"data": data}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
