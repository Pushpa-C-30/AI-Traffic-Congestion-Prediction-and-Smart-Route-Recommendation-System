from fastapi import APIRouter

from app.services.ml_service import get_locations

router = APIRouter(prefix="/api", tags=["locations"])


@router.get("/locations")
async def locations():
    return get_locations()
