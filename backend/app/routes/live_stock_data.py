from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import os
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Normalize sheet headers → clean API keys
COLUMN_MAPPING = {
    "symbol": "symbol",
    "company_name": "company_name",
    "current_price": "current_price",
    "prevclose": "prev_close",
    "priceopen": "price_open",
    "changepct": "change_pct",
    "high": "day_high",
    "low": "day_low",
    "expenseratio": "expense_ratio",
    "morningstarrating": "morningstar_rating",
    "volume": "volume",
    "market_cap_(₹_crore,_approx)": "market_cap",
    "tradetime": "trade_time",
    "datadelay": "data_delay",
    "volumeavg": "avg_volume",
    "pe": "pe_ratio",
    "eps": "eps",
    "high52": "high_52",
    "low52": "low_52",
    "change": "change",
    "beta": "beta",
    "shares": "shares",
    "currency": "currency",
    "sector": "sector",
}

from fastapi import APIRouter

router = APIRouter()

@router.get("/live-stock-data")
async def get_live_stock_data():
    return {"status": "ok", "data": "live stock data here"}

router = APIRouter()

# Google Sheets settings
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SERVICE_ACCOUNT_FILE = os.path.join(os.getcwd(), "credentials.json")

try:
    creds = service_account.Credentials.from_service_account_file(
    "credentials.json",
    scopes=SCOPES

    )
    service = build("sheets", "v4", credentials=creds)
except Exception as e:
    print("Google Sheets setup failed:", e)
    service = None

SPREADSHEET_ID = "1LkxYQ-eyqGUZurMn-_si5XxbzSQAvyRHVz3jpncd0t4"
RANGE_NAME = "Sheet1!A:Z"


@router.get("/api/live-stock-data")
async def get_live_stock_data(symbols: str = Query(..., description="Comma separated stock symbols")):
    try:
        if not service:
            return JSONResponse(content={"error": "Google Sheets service not available"}, status_code=500)

        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=RANGE_NAME
        ).execute()

        values = result.get("values", [])
        if not values:
            return {"data": []}

        # Normalize headers: strip, lower, underscores
        raw_headers = [h.strip().lower().replace(" ", "_") for h in values[0]]
        headers = []
        for h in raw_headers:
            if h and h != "":  # skip blank headers
                headers.append(h)

        rows = values[1:]

        requested_symbols = {s.strip().upper().replace(".NS", "") for s in symbols.split(",")}

        data = []
        seen = set()

        for row in rows:
            if not row or not row[0]:
                continue

            stock_symbol = row[0].strip().upper()
            if stock_symbol in requested_symbols and stock_symbol not in seen:
                entry = {"symbol": stock_symbol}

                for i, header in enumerate(headers[1:], start=1):  # skip symbol col
                    if i < len(row):
                        value = row[i].strip() if isinstance(row[i], str) else row[i]
                        clean_key = COLUMN_MAPPING.get(header, header)
                        entry[clean_key] = value if value != "" else "-"

                data.append(entry)
                seen.add(stock_symbol)

        return {"data": data}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
