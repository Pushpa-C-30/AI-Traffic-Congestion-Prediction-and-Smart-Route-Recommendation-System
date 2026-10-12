from fastapi import APIRouter

from app.services.ml_service import get_traffic_analytics, get_model_summary

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics")
async def analytics():
    return {
        "traffic": get_traffic_analytics(),
        "model": get_model_summary(),
    }
