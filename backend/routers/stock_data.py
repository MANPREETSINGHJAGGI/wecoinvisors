# File: backend/app/routers/stock_data.py
from fastapi import APIRouter, Query, HTTPException
import httpx
import os
import yfinance as yf

router = APIRouter()

ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")
TWELVE_DATA_KEY = os.getenv("TWELVE_DATA_KEY", "")

@router.get("/live-stock-data")
async def live_stock_data(symbols: str = Query(..., description="Comma separated symbols like TCS.NS,AAPL")):
    """
    Unified live stock data fetcher.
    Priority:
    - NSE stocks: yfinance or Alpha Vantage
    - US/global: TwelveData or yfinance fallback
    """
    results = []
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]

    async with httpx.AsyncClient(timeout=15) as client:
        for symbol in symbol_list:
            stock_data = None
            try:
                # Try yfinance first (works for NSE and US)
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="2d")
                if not hist.empty:
                    last = hist.iloc[-1]
                    prev = hist.iloc[-2] if len(hist) > 1 else hist.iloc[-1]
                    change = round(float(last["Close"] - prev["Close"]), 2)
                    percent_change = round((change / prev["Close"]) * 100, 2) if prev["Close"] else 0

                    stock_data = {
                        "symbol": symbol,
                        "price": round(float(last["Close"]), 2),
                        "change": change,
                        "percentChange": percent_change,
                        "volume": int(last["Volume"]),
                    }
            except Exception as e:
                print(f"⚠️ yfinance error for {symbol}: {e}")

            # If still None, try Alpha Vantage (for .NS stocks)
            if not stock_data and symbol.endswith(".NS") and ALPHA_VANTAGE_KEY:
                try:
                    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_KEY}"
                    r = await client.get(url)
                    d = r.json().get("Global Quote", {})
                    if d:
                        stock_data = {
                            "symbol": symbol,
                            "price": float(d.get("05. price", 0)),
                            "change": float(d.get("09. change", 0)),
                            "percentChange": float(d.get("10. change percent", "0%").replace("%", "")),
                            "volume": int(d.get("06. volume", 0)),
                        }
                except Exception as e:
                    print(f"⚠️ Alpha Vantage error for {symbol}: {e}")

            # If still None, try Twelve Data (for US/global)
            if not stock_data and TWELVE_DATA_KEY:
                try:
                    url = f"https://api.twelvedata.com/quote?symbol={symbol}&apikey={TWELVE_DATA_KEY}"
                    r = await client.get(url)
                    d = r.json()
                    if "symbol" in d:
                        stock_data = {
                            "symbol": d["symbol"],
                            "price": float(d.get("close", 0)),
                            "change": float(d.get("change", 0)),
                            "percentChange": float(d.get("percent_change", 0)),
                            "volume": int(d.get("volume", 0)) if d.get("volume") else 0,
                        }
                except Exception as e:
                    print(f"⚠️ TwelveData error for {symbol}: {e}")

            results.append(stock_data if stock_data else {"symbol": symbol, "error": "No data found"})

    return results
