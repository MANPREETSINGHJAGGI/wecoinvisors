# backend/app/routers/stocks.py

from fastapi import APIRouter, Query
from app.utils import stock_tracker

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)

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
