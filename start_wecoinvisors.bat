@echo off
title WeCoinvisors Dev Environment
echo Starting WeCoinvisors Local Servers...
echo -------------------------------------

REM === Step 0: Push latest changes to GitHub ===
set /p commit_msg="Enter commit message for GitHub: "
git add .
git commit -m "%commit_msg%"
git push origin main

REM === Step 1: Trigger Render Deploy via Deploy Hook ===
REM Replace URL below with your own Render Deploy Hook URL
set RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-d1uusabuibrs738saj80?key=LCkjW-4-SIc
echo Triggering Render deploy...
curl -X POST %RENDER_DEPLOY_HOOK%

REM === Step 2: Start Backend (FastAPI) ===
echo Starting Backend on http://127.0.0.1:8000
cd backend
call venv\Scripts\activate
start cmd /k "uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM === Step 3: Start Frontend (Next.js) ===
echo Starting Frontend on http://localhost:3000
cd ../frontend
start cmd /k "npm run dev"

echo Both servers are running in separate windows!
pause
