from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import os
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Column normalization
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

router = APIRouter()

# Google Sheets service
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
service = None
try:
    creds_dict = {
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
        creds_dict, scopes=SCOPES
    )
    service = build("sheets", "v4", credentials=creds)
    print("✅ Google Sheets connected")

except Exception as e:
    print("⚠️ Google Sheets setup failed:", e)
    service = None

SPREADSHEET_ID = "1LkxYQ-eyqGUZurMn-_si5XxbzSQAvyRHVz3jpncd0t4"
RANGE_NAME = "Sheet1!A:Z"


def fetch_from_google_sheet(symbols: list[str]):
    """
    Fetch stock data for given symbols from Google Sheets
    """
    if not service:
        raise RuntimeError("Google Sheets service not available")

    sheet = service.spreadsheets()
    result = sheet.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=RANGE_NAME
    ).execute()

    values = result.get("values", [])
    if not values:
        return []

    raw_headers = [h.strip().lower().replace(" ", "_") for h in values[0]]
    headers = [h for h in raw_headers if h]
    rows = values[1:]

    requested_symbols = {s.strip().upper().replace(".NS", "") for s in symbols}
    data, seen = [], set()

    for row in rows:
        if not row or not row[0]:
            continue

        stock_symbol = row[0].strip().upper()
        if stock_symbol in requested_symbols and stock_symbol not in seen:
            entry = {"symbol": stock_symbol}
            for i, header in enumerate(headers[1:], start=1):
                if i < len(row):
                    value = row[i].strip() if isinstance(row[i], str) else row[i]
                    clean_key = COLUMN_MAPPING.get(header, header)
                    entry[clean_key] = value if value != "" else "-"
            data.append(entry)
            seen.add(stock_symbol)

    return data
