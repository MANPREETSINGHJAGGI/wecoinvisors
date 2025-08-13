from fastapi import APIRouter, HTTPException, Query
from ..utils.stock_fetcher import (
    fetch_live_price,
    fetch_historical_data,
    fetch_gainers_losers
)

router = APIRouter(prefix="/stock", tags=["Stock Data"])

@router.get("/live/{symbol}")
async def get_live_stock_price(symbol: str):
    """Get live stock price for a symbol."""
    try:
        price_data = await fetch_live_price(symbol)
        if not price_data:
            raise HTTPException(status_code=404, detail="Stock data not found")
        return price_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{symbol}")
async def get_stock_history(
    symbol: str,
    days: int = Query(30, ge=1, le=365)
):
    """Get historical stock price data for a symbol."""
    try:
        history_data = await fetch_historical_data(symbol, days)
        if not history_data:
            raise HTTPException(status_code=404, detail="No historical data found")
        return history_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/market/gainers-losers")
async def get_gainers_losers(
    exchange: str = Query("NSE", regex="^(NSE|BSE)$")
):
    """Get top gainers and losers for NSE or BSE."""
    try:
        data = await fetch_gainers_losers(exchange)
        if not data:
            raise HTTPException(status_code=404, detail="No data found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
