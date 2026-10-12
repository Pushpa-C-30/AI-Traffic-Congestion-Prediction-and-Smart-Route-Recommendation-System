from fastapi import APIRouter

from app.services.ml_service import get_live_traffic_summary

router = APIRouter(prefix="/api", tags=["traffic"])


@router.get("/traffic")
async def traffic_summary():
    return get_live_traffic_summary()
