import yfinance as yf

def get_stock_data(symbols: list):
    """
    symbols: list of stock symbols like ["RELIANCE.NS", "AAPL"]
    Returns: list of dicts with price, volume, change %
    """
    results = []
    for sym in symbols:
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(period="1d")
            last_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else last_price
            change_pct = ((last_price - prev_close)/prev_close) * 100 if prev_close else 0

            results.append({
                "symbol": sym,
                "price": round(last_price, 2),
                "change_pct": round(change_pct, 2),
                "volume": int(hist['Volume'].iloc[-1])
            })
        except Exception as e:
            results.append({
                "symbol": sym,
                "price": None,
                "change_pct": None,
                "volume": None,
                "error": str(e)
            })
    return results
