from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_stock_data():
    return {"success": True, "data": "Stock info here"}

