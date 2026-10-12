from fastapi import APIRouter

from app.services.ml_service import get_history

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def history():
    return get_history()
