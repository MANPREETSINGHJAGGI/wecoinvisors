from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel
from dotenv import load_dotenv

import httpx
import os
import yfinance as yf
import sqlite3
import hashlib
import secrets
import datetime
from typing import Optional

# Load environment variables
load_dotenv()

# -----------------------
# FastAPI app setup
# -----------------------
app = FastAPI(title="WeCoinvisors API", version="1.0.0")
origins = [
    "http://localhost:3000",
    "https://wecoinvisors.com",
    "https://wecoinvisors-frontend.vercel.app"
]

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="WeCoinvisors API Docs",
        swagger_js_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js",
        swagger_css_url="/static/swagger.css"
    )

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # loosened for dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# DB setup
# -----------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.getenv("WECOINVISORS_DB", os.path.join(BASE_DIR, "data", "db.sqlite3"))

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                phone TEXT UNIQUE,
                password TEXT,
                paid INTEGER DEFAULT 0,
                created_at TEXT
            )
        """)
        conn.commit()
        conn.close()
        print("✅ Database initialized at", DB_PATH)
    except Exception as e:
        print(f"⚠️ DB init failed: {e}")

init_db()

# -----------------------
# Password helpers
# -----------------------
def hash_password(plain: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.sha256((salt + plain).encode("utf-8")).hexdigest()
    return f"{salt}${h}"

def verify_password(stored: Optional[str], plain: str) -> bool:
    if not stored:
        return False
    try:
        salt, h = stored.split("$", 1)
    except ValueError:
        return False
    return hashlib.sha256((salt + plain).encode("utf-8")).hexdigest() == h

# -----------------------
# Pydantic models
# -----------------------
class RegisterIn(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

class LoginIn(BaseModel):
    identifier: str
    password: str

# -----------------------
# Basic endpoints
# -----------------------
@app.get("/")
def root():
    return {"message": "WeCoinvisors API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------
# Auth
# -----------------------
@app.post("/api/register")
async def register(payload: RegisterIn):
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Provide email or phone to register.")
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_conn()
    cur = conn.cursor()

    if payload.email:
        cur.execute("SELECT id FROM users WHERE email = ?", (payload.email.lower(),))
        if cur.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered")

    if payload.phone:
        cur.execute("SELECT id FROM users WHERE phone = ?", (payload.phone,))
        if cur.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Phone already registered")

    pw_hash = hash_password(payload.password)
    now = datetime.datetime.utcnow().isoformat()
    cur.execute(
        "INSERT INTO users (name, email, phone, password, paid, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (payload.name, payload.email.lower() if payload.email else None, payload.phone, pw_hash, 0, now),
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()

    return {"id": user_id, "email": payload.email, "phone": payload.phone, "paid": False, "status": "created"}

@app.post("/api/login")
async def login(payload: LoginIn):
    identifier = payload.identifier.strip()
    conn = get_conn()
    cur = conn.cursor()

    if "@" in identifier:
        cur.execute("SELECT * FROM users WHERE email = ?", (identifier.lower(),))
    else:
        cur.execute("SELECT * FROM users WHERE phone = ?", (identifier,))
    user = cur.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user["password"], payload.password):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid password")

    resp = {k: user[k] for k in ("id", "name", "email", "phone")}
    resp["paid"] = bool(user["paid"])
    conn.close()
    return resp

# -----------------------
# Stock helpers
# -----------------------
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")

def is_indian_stock(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")

async def fetch_from_alpha_vantage(client, symbol: str):
    url = "https://www.alphavantage.co/query"
    params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
    r = await client.get(url, params=params)
    data = r.json().get("Global Quote", {})
    return data if data else None

async def fetch_from_twelve_data(client, symbol: str):
    url = "https://api.twelvedata.com/quote"
    params = {"symbol": symbol, "apikey": TWELVE_DATA_API_KEY}
    if is_indian_stock(symbol):
        params["exchange"] = "NSE"
    r = await client.get(url, params=params)
    data = r.json()
    return data if "price" in data else None

async def fetch_from_finnhub(client, symbol: str):
    url = "https://finnhub.io/api/v1/quote"
    params = {"symbol": symbol, "token": FINNHUB_API_KEY}
    r = await client.get(url, params=params)
    return r.json() if "c" in r.json() else None

# -----------------------
# Live Stock Data
# -----------------------
@app.get("/api/live-stock-data")
async def get_live_stock_data(symbols: str, highlight: str = ""):
    results = []
    raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    symbol_list = [s if "." in s else f"{s}.NS" for s in raw_symbols]
    highlight_list = [s.strip().upper() for s in highlight.split(",")] if highlight else []

    async with httpx.AsyncClient(timeout=15) as client:
        for symbol in symbol_list:
            stock_data = None
            is_golden = symbol in highlight_list

            try:
                if is_indian_stock(symbol):
                    # 1️⃣ yfinance (best for NSE)
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="1d")
                        if not hist.empty:
                            last, prev = hist.iloc[-1], hist.iloc[-2] if len(hist) > 1 else hist.iloc[-1]
                            change = round(float(last["Close"] - prev["Close"]), 2)
                            percent_change = round((change / prev["Close"]) * 100, 2) if prev["Close"] else 0
                            stock_data = {
                                "symbol": symbol, "name": symbol,
                                "price": round(float(last["Close"]), 2),
                                "change": change, "percentChange": percent_change,
                                "volume": int(last["Volume"]),
                                "sector": "N/A", "marketCap": 0.0,
                                "peRatio": 0, "eps": 0,
                                "isGolden": is_golden
                            }
                    except Exception as e:
                        print(f"⚠️ yfinance NSE error for {symbol}: {e}")

                    # 2️⃣ Twelve Data fallback
                    if not stock_data:
                        td_data = await fetch_from_twelve_data(client, symbol)
                        if td_data:
                            stock_data = {
                                "symbol": symbol, "name": td_data.get("name", symbol),
                                "price": float(td_data.get("price", 0)),
                                "change": float(td_data.get("change", 0)),
                                "percentChange": float(td_data.get("percent_change", 0)),
                                "volume": int(float(td_data.get("volume", 0))) if td_data.get("volume") else None,
                                "sector": td_data.get("sector", "UNKNOWN"),
                                "marketCap": float(td_data.get("market_cap", 0)),
                                "peRatio": float(td_data.get("pe", 0)) if td_data.get("pe") else 0,
                                "eps": float(td_data.get("eps", 0)) if td_data.get("eps") else 0,
                                "isGolden": is_golden
                            }

                else:
                    # 1️⃣ Alpha Vantage
                    av_data = await fetch_from_alpha_vantage(client, symbol)
                    if av_data and "05. price" in av_data:
                        stock_data = {
                            "symbol": symbol, "name": symbol,
                            "price": float(av_data["05. price"]),
                            "change": float(av_data.get("09. change", 0)),
                            "percentChange": float(str(av_data.get("10. change percent", "0%")).replace("%", "")),
                            "volume": int(float(av_data.get("06. volume", 0))),
                            "sector": "N/A", "marketCap": 0.0,
                            "peRatio": 0, "eps": 0,
                            "isGolden": is_golden
                        }

                    # 2️⃣ Finnhub fallback
                    if not stock_data:
                        fh_data = await fetch_from_finnhub(client, symbol)
                        if fh_data:
                            stock_data = {
                                "symbol": symbol, "name": symbol,
                                "price": fh_data["c"], "change": fh_data.get("d", 0.0),
                                "percentChange": fh_data.get("dp", 0.0),
                                "volume": None, "sector": "N/A",
                                "marketCap": 0.0, "peRatio": 0, "eps": 0,
                                "isGolden": is_golden
                            }

                    # 3️⃣ Twelve Data fallback
                    if not stock_data:
                        td_data = await fetch_from_twelve_data(client, symbol)
                        if td_data:
                            stock_data = {
                                "symbol": symbol, "name": td_data.get("name", symbol),
                                "price": float(td_data.get("price", 0)),
                                "change": float(td_data.get("change", 0)),
                                "percentChange": float(td_data.get("percent_change", 0)),
                                "volume": int(float(td_data.get("volume", 0))) if td_data.get("volume") else None,
                                "sector": td_data.get("sector", "UNKNOWN"),
                                "marketCap": float(td_data.get("market_cap", 0)),
                                "peRatio": float(td_data.get("pe", 0)) if td_data.get("pe") else 0,
                                "eps": float(td_data.get("eps", 0)) if td_data.get("eps") else 0,
                                "isGolden": is_golden
                            }

            except Exception as e:
                print(f"⚠️ fetch error for {symbol}: {e}")

            results.append(stock_data if stock_data else {"symbol": symbol, "error": "No data found"})

    return JSONResponse(content=results)
