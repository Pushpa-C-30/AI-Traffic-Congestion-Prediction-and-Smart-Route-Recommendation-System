from fastapi import APIRouter, HTTPException

from app.database import DatabaseManager
from app.models import PredictionRequest, PredictionResponse
from app.services.ml_service import predict_traffic

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
async def predict(payload: PredictionRequest):
    try:
        result = predict_traffic(payload.model_dump())
        DatabaseManager.save_prediction({
            "date": payload.date,
            "location": payload.location,
            "predicted_level": result["traffic_level"],
            "congestion_percent": result["congestion_probability"],
            "estimated_delay": result["expected_delay"],
            "weather": payload.weather,
        })
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to generate prediction: {str(exc)}") from exc
