from fastapi import APIRouter, HTTPException, Query

from app.models import RouteRequest
from app.services.route_service import RouteLookupError, get_route_alternatives

router = APIRouter(prefix="/api", tags=["routes"])


@router.get("/routes")
async def routes(
    origin: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
):
    try:
        return get_route_alternatives(origin, destination)
    except RouteLookupError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/routes/alternatives")
async def route_alternatives(payload: RouteRequest):
    try:
        return get_route_alternatives(payload.origin, payload.destination)
    except RouteLookupError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
