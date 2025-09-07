# File: backend/app/routers/stocks.py
@router.get("/chart")
def get_chart(
    symbol: str = Query(..., description="Stock symbol e.g. RELIANCE.NS"),
    range: str = Query("1mo", description="Valid yfinance range: 1d,5d,1mo,3mo,6mo,1y,3y,5y")
):
    import yfinance as yf
    ticker = yf.Ticker(symbol)
    data = ticker.history(period=range)
    return data.reset_index().to_dict(orient="records")
