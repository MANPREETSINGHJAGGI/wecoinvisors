# app/routes/stocks.py
from fastapi import APIRouter
from app.utils.stock_tracker import get_live_price, get_historical_data, get_top_gainers_losers

router = APIRouter()

@router.get("/price/{symbol}")
def fetch_price(symbol: str):
    return get_live_price(symbol)

@router.get("/history/{symbol}")
def fetch_history(symbol: str, start: str, end: str):
    return get_historical_data(symbol, start, end)

@router.get("/gainers-losers")
def fetch_gainers_losers():
    return get_top_gainers_losers()
