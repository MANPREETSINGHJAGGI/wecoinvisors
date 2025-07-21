# backend/utils/stock_fetcher.py

import yfinance as yf

def fetch_stock_data(symbols):
    result = []
    for symbol in symbols:
        try:
            stock = yf.Ticker(f"{symbol}.NS")
            info = stock.info

            data = {
                "symbol": symbol,
                "name": info.get("shortName", "N/A"),
                "price": info.get("currentPrice", 0),
                "change": info.get("regularMarketChange", 0),
                "percentChange": info.get("regularMarketChangePercent", 0),
                "volume": info.get("volume", 0),
                "sector": info.get("sector", "N/A")
            }
            result.append(data)
        except Exception as e:
            result.append({
                "symbol": symbol,
                "error": str(e)
            })
    return result
