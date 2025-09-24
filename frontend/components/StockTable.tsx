from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from .google_sheet_data import fetch_from_google_sheet

router = APIRouter()


@router.get("/live-stock-data")
async def live_stock_data(symbols: str = Query(..., description="Comma separated stock symbols")):
    """
    Fetch stock data only from Google Sheets.
    """
    try:
        raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]

        sheet_data = fetch_from_google_sheet(raw_symbols)
        if not sheet_data:
            return {"data": [{"symbol": s, "error": "No data found in Google Sheet"} for s in raw_symbols]}

        # Tag source for clarity
        for row in sheet_data:
            row["source"] = "GoogleSheet"

        return {"data": sheet_data}

    except Exception as e:
        print(f"⚠️ Google Sheet fetch failed: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
