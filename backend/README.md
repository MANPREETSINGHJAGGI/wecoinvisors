# WeCoinvisors 🚀  
Empowering Investors with Education and Insights

---

## 🔧 Project Structure

```
wecoinvisors/
├── backend/               # FastAPI backend
│   ├── main.py            # Main server entry
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Virtual environment
│
├── frontend/              # Next.js frontend
│   ├── app/               # App router structure
│   │   ├── (main)/        # Layout group for login/dashboard pages
│   │   ├── api/           # Next.js API routes
│   ├── components/        # Reusable UI components
│   ├── context/           # Firebase auth context
│   ├── lib/               # Firebase config
│   └── public/            # Static assets like favicon
│
├── .env.local             # Environment variables
├── package.json           # Node dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind CSS setup
└── start_wecoinvisors.bat # Helper to launch both servers
```

---

## 🔑 Features

- 📈 **Live NSE & US Stock Data** (via Alpha Vantage, Twelve Data, and Finnhub)
- 🔒 **Firebase Email Magic Link Login**
- 💡 **Stock Insights Dashboard**
- 📊 **Dynamic Charting** (yfinance-based)
- 🔐 **FastAPI Token Verification**
- 📂 **Modular, Clean Codebase**

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/wecoinvisors.git
cd wecoinvisors
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Firebase Setup

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## 📞 Contact

Built by **WeCoinvisors**  
Email: `info@wecoinvisors.com`  
Website: [www.wecoinvisors.com](https://www.wecoinvisors.com)

---

## ✅ License

MIT © 2025 WeCoinvisors