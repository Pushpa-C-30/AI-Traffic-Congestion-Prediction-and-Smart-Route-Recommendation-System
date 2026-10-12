from __future__ import annotations

import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd


LOCATIONS = [
    "Electronic City",
    "Silk Board",
    "Koramangala",
    "Whitefield",
    "Hebbal",
    "Domlur",
    "Indiranagar",
    "MG Road",
]
WEATHER = ["Clear", "Cloudy", "Rain", "Heavy Rain"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _safe_int(value):
    return max(0, int(round(value)))


def generate_traffic_dataset(path: str | Path = "ml/dataset/traffic_dataset.csv", rows: int = 1800):
    root = Path(path)
    root.parent.mkdir(parents=True, exist_ok=True)

    records = []
    start_date = datetime(2024, 1, 1)
    rng = np.random.default_rng(42)

    for index in range(rows):
        location = random.choice(LOCATIONS)
        date = start_date + timedelta(days=index % 365)
        day = DAYS[date.weekday()]
        hour = int(rng.integers(6, 22))
        minute = int(rng.integers(0, 60, endpoint=False))
        time = f"{hour:02d}:{minute:02d}"

        holiday = bool((day in ["Saturday", "Sunday"]) or (index % 30 == 0))
        weather = random.choices(WEATHER, weights=[0.45, 0.25, 0.2, 0.1])[0]
        temperature = round(float(np.clip(rng.normal(29, 7), 15, 42)), 1)

        base_volume = {
            "Electronic City": 1500,
            "Silk Board": 1700,
            "Koramangala": 1600,
            "Whitefield": 1550,
            "Hebbal": 1450,
            "Domlur": 1400,
            "Indiranagar": 1500,
            "MG Road": 1650,
        }[location]

        time_factor = 1.0
        if 17 <= hour <= 20:
            time_factor = 1.45
        elif 8 <= hour <= 10:
            time_factor = 1.2
        elif 13 <= hour <= 15:
            time_factor = 1.1

        weather_factor = {"Clear": 0.9, "Cloudy": 1.0, "Rain": 1.2, "Heavy Rain": 1.45}[weather]
        holiday_factor = 1.15 if holiday else 1.0
        accident = bool(rng.random() < 0.14 and hour in range(9, 20))

        traffic_volume = _safe_int(base_volume * time_factor * weather_factor * holiday_factor * (0.85 + rng.random() * 0.7))
        if accident:
            traffic_volume = int(traffic_volume * 1.3)

        road_capacity = base_volume + random.randint(400, 900)
        congestion_score = (traffic_volume / road_capacity) * 100
        if 17 <= hour <= 20:
            congestion_score += 20
        if accident:
            congestion_score += 18
        if weather in ["Rain", "Heavy Rain"]:
            congestion_score += 12
        if holiday:
            congestion_score += 5
        if day in ["Saturday", "Sunday"] and 14 <= hour <= 18:
            congestion_score += 8

        average_speed = max(12, 58 - (congestion_score / 2.5) + (rng.random() * 14) - (4 if accident else 0))
        average_speed = round(float(np.clip(average_speed, 12, 68)), 1)

        if congestion_score >= 88:
            congestion_level = 3
        elif congestion_score >= 60:
            congestion_level = 2
        elif congestion_score >= 35:
            congestion_level = 1
        else:
            congestion_level = 0

        records.append(
            {
                "location": location,
                "date": date.strftime("%Y-%m-%d"),
                "time": time,
                "day": day,
                "weather": weather,
                "temperature": round(float(temperature), 1),
                "traffic_volume": traffic_volume,
                "average_speed": average_speed,
                "holiday": int(holiday),
                "accident": int(accident),
                "road_capacity": road_capacity,
                "congestion_level": congestion_level,
            }
        )

    df = pd.DataFrame(records)
    df.to_csv(root, index=False)
    return df


if __name__ == "__main__":
    generate_traffic_dataset()
