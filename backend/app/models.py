from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    location: str = Field(..., min_length=2)
    date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"), description="YYYY-MM-DD")
    time: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M"), description="HH:MM")
    day: str = ""
    weather: str = "Clear"
    temperature: float = Field(28, ge=-20, le=60)
    traffic_volume: int = Field(1200, ge=0)
    average_speed: float = Field(30, ge=0, le=150)
    holiday: bool = False
    accident: bool = False
    road_capacity: int = Field(2200, ge=0)


class RouteRequest(BaseModel):
    origin: str = Field(..., min_length=2)
    destination: str = Field(..., min_length=2)


class PredictionReason(BaseModel):
    label: str
    impact: int


class PredictionResponse(BaseModel):
    traffic_level: str
    congestion_probability: int
    estimated_speed: float
    expected_delay: int
    traffic_volume: int
    reasons: List[PredictionReason]
    recommendation: str
    route_recommendations: List[dict]


class HistoryItem(BaseModel):
    date: str
    location: str
    predicted_level: str
    congestion_percent: int
    estimated_delay: int
    weather: str


class TrafficSummary(BaseModel):
    status: str
    network_congestion: int
    active_roads: int
    average_speed: float
    incidents: int
