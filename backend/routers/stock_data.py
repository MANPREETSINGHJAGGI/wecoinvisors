# backend/app/routers/stocks.py

from fastapi import APIRouter, Query
from app.utils import stock_tracker
import json
from pathlib import Path

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)

# Path to NSE All Stocks JSON
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "nse_all_stocks.json"

@router.get("/live")
def get_live_price(
    symbol: str = Query(..., description="Stock symbol e.g. RELIANCE.BSE")
):
    """
    Fetch live stock price from available APIs (Alpha Vantage → Twelve Data → Finnhub).
    """
    return stock_tracker.get_live_price(symbol)

@router.get("/history")
def get_historical_data(
    symbol: str = Query(..., description="Stock symbol e.g. RELIANCE.BSE"),
    start_date: str = Query(..., description="Start date YYYY-MM-DD"),
    end_date: str = Query(..., description="End date YYYY-MM-DD")
):
    """
    Fetch historical daily stock data between start_date and end_date.
    Uses Alpha Vantage TIME_SERIES_DAILY.
    """
    return stock_tracker.get_historical_data(symbol, start_date, end_date)

@router.get("/gainers-losers")
def get_gainers_losers():
    """
    Get top market gainers and losers.
    (Currently dummy data — replace with NSE/BSE API when available.)
    """
    return stock_tracker.get_top_gainers_losers()

@router.get("/nse-all")
def get_nse_all_stocks():
    """
    Returns all NSE stocks with sectors from the static JSON file.
    """
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            stocks = json.load(f)
        return {"success": True, "data": stocks}
    except FileNotFoundError:
        return {"success": False, "error": "nse_all_stocks.json not found"}
    except json.JSONDecodeError:
        return {"success": False, "error": "Invalid JSON format in nse_all_stocks.json"}
    except Exception as e:
        return {"success": False, "error": str(e)}
