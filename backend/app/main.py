from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.analytics import router as analytics_router
from app.routes.history import router as history_router
from app.routes.locations import router as locations_router
from app.routes.predict import router as predict_router
from app.routes.routes import router as route_router
from app.routes.traffic import router as traffic_router

app = FastAPI(
    title="TRAFFIQ API",
    version="1.0.0",
    description="AI traffic intelligence and route prediction platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(traffic_router)
app.include_router(analytics_router)
app.include_router(history_router)
app.include_router(locations_router)
app.include_router(route_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.app_name}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
