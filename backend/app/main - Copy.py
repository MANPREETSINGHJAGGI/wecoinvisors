from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel
from app.utils import stock_tracker

import httpx
import os
import yfinance as yf
import sqlite3
import hashlib
import secrets
import datetime
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="WeCoinvisors API", version="1.0.0")
origins = [
    "http://localhost:3000",     # local frontend
    "https://wecoinvisors.com",
    "https://wecoinvisors-frontend.vercel.app"
]

# Mount static files if folder exists
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Custom Swagger UI route
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
    allow_origins=["*"],  # Change for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path config
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.getenv("WECOINVISORS_DB", os.path.join(BASE_DIR, "data", "db.sqlite3"))

# API keys (use env vars in production)
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "TE8DYXRJ2A8NFOX3")
TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY", "abe50c45515a4d489c9cb03de847801e")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "d216ms9r01qkduphvddgd216ms9r01qkduphvde0")

# -----------------------
# DB helpers
# -----------------------
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
# Basic status endpoints
# -----------------------
@app.get("/")
def root():
    return {"message": "WeCoinvisors API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------
# Auth endpoints
# -----------------------
@app.post("/api/register")
async def register(payload: RegisterIn):
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Provide email or phone to register.")
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password is required (min 6 chars).")

    conn = get_conn()
    cur = conn.cursor()

    if payload.email:
        cur.execute("SELECT id FROM users WHERE email = ?", (payload.email.lower(),))
        if cur.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered.")

    if payload.phone:
        cur.execute("SELECT id FROM users WHERE phone = ?", (payload.phone,))
        if cur.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Phone already registered.")

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

    stored_pw = user["password"]
    if not verify_password(stored_pw, payload.password):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid password")

    resp = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "paid": bool(user["paid"]),
    }
    conn.close()
    return resp

@app.post("/api/auth/verify")
async def auth_verify():
    # Currently just returns success, replace with session/token validation later
    return {"authenticated": True}

@app.get("/api/user/{user_id}")
async def get_user(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, phone, paid, created_at FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)

@app.post("/api/mark-paid/{user_id}")
async def mark_paid(user_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE users SET paid = 1 WHERE id = ?", (user_id,))
    conn.commit()
    cur.execute("SELECT id, paid FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": row["id"], "paid": bool(row["paid"])}

@app.get("/api/users")
async def list_users():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, phone, paid, created_at FROM users ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -----------------------
# Stock helpers
# -----------------------
def is_indian_stock(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")

async def fetch_from_alpha_vantage(client, symbol: str):
    url = "https://www.alphavantage.co/query"
    params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHA_VANTAGE_API_KEY}
    r = await client.get(url, params=params)
    return r.json().get("Global Quote", {})

async def fetch_from_twelve_data(client, symbol: str):
    exchange = "NSE" if is_indian_stock(symbol) else None
    url = "https://api.twelvedata.com/quote"
    params = {"symbol": symbol, "apikey": TWELVE_DATA_API_KEY}
    if exchange:
        params["exchange"] = exchange
    r = await client.get(url, params=params)
    return r.json()

async def fetch_from_finnhub(client, symbol: str):
    url = "https://finnhub.io/api/v1/quote"
    params = {"symbol": symbol, "token": FINNHUB_API_KEY}
    r = await client.get(url, params=params)
    return r.json()

# -----------------------
# Live Stock Data endpoint
# -----------------------
@app.get("/api/live-stock-data")
async def get_live_stock_data(
    symbols: str = Query(..., description="Comma-separated symbols"),
    highlight: str = Query("", description="Comma-separated symbols to highlight")
):
    results = []
    # Clean list
    raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    symbol_list = []
    for s in raw_symbols:
        if "." not in s:  # user gave plain "RELIANCE"
            symbol_list.append(f"{s}.NS")
        else:
            symbol_list.append(s)

    highlight_list = [s.strip().upper() for s in highlight.split(",")] if highlight else []

    if not symbol_list:
        raise HTTPException(status_code=400, detail="No symbols provided")

    async with httpx.AsyncClient(timeout=15) as client:
        for symbol in symbol_list:
            is_golden = symbol in highlight_list
            stock_data = None

            try:
                if is_indian_stock(symbol):
                    # 1️⃣ Try yfinance (best for NSE)
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="2d")
                        if not hist.empty:
                            last = hist.iloc[-1]
                            prev = hist.iloc[-2] if len(hist) > 1 else last
                            change = round(float(last["Close"] - prev["Close"]), 2)
                            percent_change = round((change / prev["Close"]) * 100, 2) if prev["Close"] else 0
                            stock_data = {
                                "symbol": symbol,
                                "name": symbol,
                                "price": round(float(last["Close"]), 2),
                                "change": change,
                                "percentChange": percent_change,
                                "volume": int(last["Volume"]),
                                "sector": "N/A",
                                "marketCap": 0.0,
                                "peRatio": 0,
                                "eps": 0,
                                "isGolden": is_golden
                            }
                    except Exception as e:
                        print(f"⚠️ yfinance NSE error for {symbol}: {e}")

                    # 2️⃣ Fall back to Twelve Data
                    if not stock_data:
                        td_data = await fetch_from_twelve_data(client, symbol)
                        if td_data.get("price"):
                            stock_data = {
                                "symbol": symbol,
                                "name": td_data.get("name", symbol),
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
                    # 1️⃣ Try Alpha Vantage
                    av_data = await fetch_from_alpha_vantage(client, symbol)
                    if av_data and "05. price" in av_data:
                        stock_data = {
                            "symbol": symbol,
                            "name": symbol,
                            "price": float(av_data["05. price"]),
                            "change": float(av_data.get("09. change", 0)),
                            "percentChange": float(av_data.get("10. change percent", "0%").replace("%", "")),
                            "volume": int(float(av_data.get("06. volume", 0))),
                            "sector": "N/A",
                            "marketCap": 0.0,
                            "peRatio": 0,
                            "eps": 0,
                            "isGolden": is_golden
                        }

                    # 2️⃣ Fall back to Finnhub
                    if not stock_data:
                        fh_data = await fetch_from_finnhub(client, symbol)
                        if fh_data.get("c"):
                            stock_data = {
                                "symbol": symbol,
                                "name": symbol,
                                "price": fh_data["c"],
                                "change": fh_data.get("d", 0.0),
                                "percentChange": fh_data.get("dp", 0.0),
                                "volume": None,
                                "sector": "N/A",
                                "marketCap": 0.0,
                                "peRatio": 0,
                                "eps": 0,
                                "isGolden": is_golden
                            }

                    # 3️⃣ Fall back to Twelve Data
                    if not stock_data:
                        td_data = await fetch_from_twelve_data(client, symbol)
                        if td_data.get("price"):
                            stock_data = {
                                "symbol": symbol,
                                "name": td_data.get("name", symbol),
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

            if stock_data:
                results.append(stock_data)
            else:
                results.append({"symbol": symbol, "error": "No data found"})

    return JSONResponse(content=results)

# -----------------------
# Sector heatmap placeholder
# -----------------------
@app.get("/api/sector-heatmap")
async def sector_heatmap():
    return {"data": []}

# -----------------------
# Historical chart
# -----------------------
RANGE_MAP = {
    "1D": ("5m", 1),
    "3D": ("15m", 3),
    "5D": ("30m", 5),
    "1M": ("1d", 30),
    "3M": ("1d", 90),
    "6M": ("1d", 180),
    "1Y": ("1d", 365),
    "2Y": ("1wk", 730),
    "3Y": ("1wk", 1095),
    "4Y": ("1wk", 1460),
    "5Y": ("1wk", 1825),
}

@app.get("/api/historical-chart")
async def historical_chart(symbol: str = Query(...), range: str = Query("1M")):
    range = range.upper()
    if range not in RANGE_MAP:
        return {"error": "Invalid range."}
    interval, period_days = RANGE_MAP[range]

    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=f"{period_days}d", interval=interval)
        if not hist.empty:
            hist = hist.reset_index()
            labels = [str(x) for x in hist["Date"]]
            prices = [round(float(x), 2) for x in hist["Close"]]
            return {"symbol": symbol, "labels": labels, "prices": prices, "range": range}
    except Exception as e:
        print(f"⚠️ yfinance chart error for {symbol}: {e}")

    url = "https://api.twelvedata.com/time_series"
    query_params = {
        "symbol": symbol,
        "interval": interval,
        "outputsize": period_days,
        "apikey": TWELVE_DATA_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=query_params)
        data = res.json()

    if "values" not in data:
        return {"error": "No chart data found"}

    labels = [v["datetime"] for v in reversed(data["values"])]
    prices = [float(v["close"]) for v in reversed(data["values"])]
    return {"symbol": symbol, "labels": labels, "prices": prices, "range": range}
