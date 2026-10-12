from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import settings
from app.database import DatabaseManager

BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_PATH = Path(settings.model_path)
DATASET_PATH = Path(settings.dataset_path)

LEVEL_LABELS = {0: "LOW", 1: "MODERATE", 2: "HIGH", 3: "SEVERE"}
LEVEL_TO_COLOR = {0: "low", 1: "moderate", 2: "high", 3: "severe"}


def _ensure_model_exists() -> bool:
    if not MODEL_PATH.exists():
        from ml.training.train_model import train_and_save_model

        train_and_save_model()
    return MODEL_PATH.exists()


def _build_demo_history() -> List[Dict[str, Any]]:
    return [
        {"date": "2026-10-12", "location": "Electronic City", "predicted_level": "HIGH", "congestion_percent": 82, "estimated_delay": 25, "weather": "Rain"},
        {"date": "2026-10-11", "location": "Koramangala", "predicted_level": "MODERATE", "congestion_percent": 63, "estimated_delay": 16, "weather": "Cloudy"},
        {"date": "2026-10-10", "location": "Silk Board", "predicted_level": "SEVERE", "congestion_percent": 90, "estimated_delay": 31, "weather": "Heavy Rain"},
        {"date": "2026-10-09", "location": "Whitefield", "predicted_level": "HIGH", "congestion_percent": 74, "estimated_delay": 22, "weather": "Clear"},
    ]


def _feature_vector(payload: Dict[str, Any]) -> pd.DataFrame:
    date_value = payload.get("date")
    if isinstance(date_value, str) and len(date_value) >= 10:
        parsed = datetime.strptime(date_value, "%Y-%m-%d")
        day_name = parsed.strftime("%A")
    else:
        day_name = payload.get("day") or "Monday"

    time_value = payload.get("time", "18:00")
    hour = int(str(time_value).split(":")[0])

    row = {
        "location": payload.get("location", "Electronic City"),
        "day": payload.get("day") or day_name,
        "weather": payload.get("weather", "Clear"),
        "temperature": float(payload.get("temperature", 28)),
        "traffic_volume": int(payload.get("traffic_volume", 1200)),
        "average_speed": float(payload.get("average_speed", 30)),
        "holiday": int(bool(payload.get("holiday", False))),
        "accident": int(bool(payload.get("accident", False))),
        "road_capacity": int(payload.get("road_capacity", 2200)),
        "time_hour": hour,
        "peak_hour": 1 if 17 <= hour <= 20 else 0,
    }
    return pd.DataFrame([row])


def _prediction_reason(payload: Dict[str, Any], level: str, probability: float):
    hour = int(str(payload.get("time", "18:00")).split(":")[0])
    day = payload.get("day")
    if not day:
        try:
            day = datetime.strptime(payload.get("date", ""), "%Y-%m-%d").strftime("%A")
        except ValueError:
            day = "Monday"
    reasons = [
        {"label": "Peak Hour", "impact": 32 if 17 <= hour <= 20 else 18},
        {"label": "High Vehicle Volume", "impact": min(35, int((payload.get("traffic_volume", 1200) / 100) * 1.7))},
        {"label": "Weather", "impact": 42 if payload.get("weather", "Clear") in ["Rain", "Heavy Rain"] else 18},
        {"label": "Historical Pattern", "impact": 26 if day in ["Monday", "Tuesday", "Friday"] else 14},
    ]
    if payload.get("accident"):
        reasons.insert(1, {"label": "Accident Impact", "impact": 22})
    return reasons


def _generate_recommendation(level: str, payload: Dict[str, Any]) -> str:
    if level in ["HIGH", "SEVERE"]:
        return "Consider travelling after 8:00 PM or choose Route B to avoid peak congestion."
    if level == "MODERATE":
        return "Traffic is manageable, but leaving 15-20 minutes earlier can reduce delay."
    return "Conditions are favorable. A direct route is recommended for a smooth trip."


def predict_traffic(payload: Dict[str, Any]) -> Dict[str, Any]:
    _ensure_model_exists()
    model = joblib.load(MODEL_PATH)
    X = _feature_vector(payload)
    pred = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]
    probability = int(round(max(probabilities) * 100))
    traffic_level = LEVEL_LABELS.get(pred, "MODERATE")

    speed = max(12, float(payload.get("average_speed", 30)) * (0.7 if traffic_level in ["HIGH", "SEVERE"] else 1.0))
    speed = round(float(speed), 1)
    expected_delay = int(max(5, round((probability / 100) * 40 + (0 if not payload.get("accident") else 10))))
    volume = int(payload.get("traffic_volume", 1200))

    result = {
        "traffic_level": traffic_level,
        "congestion_probability": probability,
        "estimated_speed": speed,
        "expected_delay": expected_delay,
        "traffic_volume": volume,
        "reasons": _prediction_reason(payload, traffic_level, probability),
        "recommendation": _generate_recommendation(traffic_level, payload),
        "route_recommendations": [
            {"name": "Route A", "traffic": probability, "distance": "14.2 km", "time": "48 min", "delay": "+21 min"},
            {"name": "Route B", "traffic": max(28, probability - 18), "distance": "16.1 km", "time": "36 min", "delay": "+9 min"},
            {"name": "Route C", "traffic": max(12, probability - 35), "distance": "18.4 km", "time": "31 min", "delay": "+4 min"},
        ],
    }
    return result


def get_live_traffic_summary() -> Dict[str, Any]:
    return {
        "status": "HIGH",
        "network_congestion": 72,
        "active_roads": 128,
        "average_speed": 31,
        "incidents": 7,
    }


def get_traffic_analytics() -> Dict[str, Any]:
    if not DATASET_PATH.exists():
        return {"data_source": "unavailable", "hourly": [], "weekly": [], "weather": [], "heatmap": [], "vehicle_volume": [], "average_speed": []}

    data = pd.read_csv(DATASET_PATH)
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_labels = {name: name[:3] for name in day_names}
    periods = [(hour, f"{hour:02d}:00-{(hour + 3):02d}:59") for hour in range(0, 24, 4)]
    data["hour"] = pd.to_datetime(data["time"], format="%H:%M").dt.hour
    data["period_start"] = (data["hour"] // 4) * 4
    data["congestion_index"] = (data["traffic_volume"] / data["road_capacity"] * 100).clip(upper=100)

    period_means = data.groupby("period_start")["congestion_index"].mean()
    hourly = [{"time": label, "value": round(float(period_means.get(start, 0)), 1)} for start, label in periods]

    day_means = data.groupby("day")["congestion_index"].mean()
    weekly = [{"day": day_labels[day], "value": round(float(day_means.get(day, 0)), 1)} for day in day_names]

    heatmap_means = data.groupby(["day", "period_start"])["congestion_index"].mean()
    heatmap = [
        {
            "day": day_labels[day],
            "time": label,
            "value": round(float(heatmap_means.get((day, start), 0)), 1),
        }
        for day in day_names
        for start, label in periods
    ]

    weather_means = data.groupby("weather")["congestion_index"].mean()
    weather = [
        {"name": name, "value": round(float(weather_means.get(name, 0)), 1)}
        for name in ["Clear", "Cloudy", "Rain", "Heavy Rain"]
    ]

    volume_means = data.groupby("period_start")["traffic_volume"].mean()
    speed_means = data.groupby("period_start")["average_speed"].mean()
    vehicle_volume = [
        {"label": f"{start:02d}:00", "value": round(float(volume_means.get(start, 0)))}
        for start, label in periods
    ]
    average_speed = [
        {"label": f"{start:02d}:00", "value": round(float(speed_means.get(start, 0)), 1)}
        for start, label in periods
    ]

    return {
        "data_source": "synthetic_training_dataset",
        "data_note": "Aggregated from generated training records; not live traffic observations.",
        "hourly": hourly,
        "weekly": weekly,
        "weather": weather,
        "heatmap": heatmap,
        "vehicle_volume": vehicle_volume,
        "average_speed": average_speed,
    }


def get_history() -> List[Dict[str, Any]]:
    return DatabaseManager.list_predictions()


def get_locations() -> List[Dict[str, Any]]:
    return DatabaseManager.demo_locations()


def get_model_summary() -> Dict[str, Any]:
    path = BASE_DIR / "ml" / "models" / "model_report.json"
    if path.exists():
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    return {
        "best_model": "unavailable",
        "metrics": {},
    }
