# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WECOINVISORS_DB = os.getenv(
    "WECOINVISORS_DB",
    os.path.join(BASE_DIR, "data", "db.sqlite3")
)

ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")
YFINANCE_ENABLED = os.getenv("YFINANCE_ENABLED", "true").lower() == "true"
