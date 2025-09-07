from fastapi import APIRouter
from typing import List

router = APIRouter()

@router.get("/api/sector-heatmap")
def get_sector_heatmap():
    # Example static response - replace with real logic
    return {
        "IT": {"change": 1.5},
        "Finance": {"change": -0.7},
        "Energy": {"change": 0.9},
    }
