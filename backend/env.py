import os
from pathlib import Path
from dotenv import load_dotenv
from app.utils import stock_tracker


# Load root .env.local
root_env = Path(__file__).resolve().parents[1] / ".env.local"
if root_env.exists():
    load_dotenv(dotenv_path=root_env)
    print(f"Loaded root env: {root_env}")

# Load frontend .env
frontend_env = Path(__file__).resolve().parents[1] / "frontend" / ".env"
if frontend_env.exists():
    load_dotenv(dotenv_path=frontend_env, override=True)
    print(f"Loaded frontend env: {frontend_env}")

# Masked env check
for key in ["ALPHA_VANTAGE_API_KEY", "TWELVE_DATA_API_KEY", "FINNHUB_API_KEY"]:
    val = os.getenv(key)
    if val:
        print(f"{key}: {val[:4]}***{val[-3:]}")
    else:
        print(f"{key}: NOT FOUND")

# -----------------------------
# Import and test stock_tracker
# -----------------------------
try:
    from app.utils.stock_tracker import StockTracker
except ModuleNotFoundError:
    print("❌ Could not import StockTracker. Check path backend/app/utils/stock_tracker.py")
    exit(1)

# Initialize tracker
tracker = StockTracker()

# Test 1: Live data (e.g., Infosys NSE)
print("\n🔵 Testing Live Stock Data...")
try:
    live = tracker.get_live_stock("INFY.NS")
    print("Live Data:", live)
except Exception as e:
    print("❌ Live data error:", e)

# Test 2: Historical data (last 5 days)
print("\n🟢 Testing Historical Stock Data...")
try:
    hist = tracker.get_historical_stock("INFY.NS", interval="1d")
    if isinstance(hist, dict):
        print("Historical Keys:", list(hist.keys())[:5])
    else:
        print("Historical Data:", str(hist)[:200])
except Exception as e:
    print("❌ Historical data error:", e)
