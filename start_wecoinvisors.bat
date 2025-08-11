@echo off
title WeCoinvisors Dev Environment
echo Starting WeCoinvisors Local Servers...
echo -------------------------------------

REM Step 1: Start Backend (FastAPI)
echo Starting Backend on http://127.0.0.1:8000
cd backend
call venv\Scripts\activate
start cmd /k "uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM Step 2: Start Frontend (Next.js)
echo Starting Frontend on http://localhost:3000
cd ../frontend
start cmd /k "npm run dev"

echo Both servers are running in separate windows!
pause
