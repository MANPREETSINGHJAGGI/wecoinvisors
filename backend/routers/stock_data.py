from fastapi import APIRouter, Query
from typing import List
from utils.stock_fetcher import fetch_stock_data  # Assuming you have a util for yfinance

router = APIRouter()

@router.get("/live-stock-data")
async def get_live_stock_data(symbols: str = Query(..., description="Comma-separated list of stock symbols")):
    symbol_list = symbols.split(",")
    result = fetch_stock_data(symbol_list)
    return result
