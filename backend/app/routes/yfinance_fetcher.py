# app/routes/yfinance_fetcher.py
import yfinance as yf

def fetch_from_yfinance(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        return {
            "symbol": symbol,
            "company_name": info.get("longName", "-"),
            "current_price": info.get("currentPrice", "-"),
            "prevclose": info.get("previousClose", "-"),
            "priceopen": info.get("open", "-"),
            "high": info.get("dayHigh", "-"),
            "low": info.get("dayLow", "-"),
            "volume": info.get("volume", "-"),
            "market_cap": info.get("marketCap", "-"),
            "volumeAvg": info.get("averageVolume", "-"),
            "pe": info.get("trailingPE", "-"),
            "eps": info.get("trailingEps", "-"),
            "high52": info.get("fiftyTwoWeekHigh", "-"),
            "low52": info.get("fiftyTwoWeekLow", "-"),
            "beta": info.get("beta", "-"),
            "shares": info.get("sharesOutstanding", "-"),
            "currency": info.get("currency", "-"),
            "sector": info.get("sector", "-"),
            "tradeTime": info.get("lastTradeDateTime", "-"),
            "dataDelay": "-",
            "expenseRatio": "-",
            "morningStarRating": "-",
            "change": (
                round(info.get("currentPrice", 0) - info.get("previousClose", 0), 2)
                if info.get("currentPrice") and info.get("previousClose")
                else "-"
            ),
            "changePct": (
                round(
                    ((info.get("currentPrice") - info.get("previousClose")) / info.get("previousClose")) * 100,
                    2,
                )
                if info.get("currentPrice") and info.get("previousClose")
                else "-"
            ),
        }
    except Exception as e:
        return {"symbol": symbol, "error": str(e)}
