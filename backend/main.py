from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stock_data  # 👈 Make sure this is the correct path

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the router
app.include_router(stock_data.router)  # 👈 This should include the /live-stock-data route
