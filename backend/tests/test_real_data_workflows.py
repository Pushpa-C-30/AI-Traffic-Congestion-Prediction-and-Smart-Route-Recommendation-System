import asyncio

from app.config import settings
from app.database import DatabaseManager
from app.models import PredictionRequest
from app.routes import predict as predict_route
from app.services import ml_service, route_service


def test_analytics_groups_all_days_into_four_hour_periods():
    analytics = ml_service.get_traffic_analytics()

    assert [item["day"] for item in analytics["weekly"]] == ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    assert [item["time"] for item in analytics["hourly"]] == [
        "00:00-03:59",
        "04:00-07:59",
        "08:00-11:59",
        "12:00-15:59",
        "16:00-19:59",
        "20:00-23:59",
    ]
    assert len(analytics["heatmap"]) == 42
    assert analytics["data_source"] == "synthetic_training_dataset"


def test_route_alternatives_are_sorted_and_not_given_fake_traffic(monkeypatch):
    monkeypatch.setattr(
        route_service,
        "_geocode_karnataka",
        lambda place: (12.0, 13.0, f"{place}, Karnataka, India"),
    )
    monkeypatch.setattr(
        route_service,
        "_get_json",
        lambda url: {
            "code": "Ok",
            "routes": [
                {"distance": 14000, "duration": 900},
                {"distance": 12000, "duration": 700},
                {"distance": 16000, "duration": 1100},
            ],
        },
    )

    result = route_service.get_route_alternatives("Mysuru", "Bengaluru")

    assert [route["name"] for route in result["routes"]] == ["Route A", "Route B", "Route C"]
    assert [route["duration_minutes"] for route in result["routes"]] == [12, 15, 18]
    assert all(route["traffic_percent"] is None for route in result["routes"])


def test_successful_prediction_is_saved_to_persistent_history(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "history_db_path", str(tmp_path / "history.sqlite3"))
    monkeypatch.setattr(
        predict_route,
        "predict_traffic",
        lambda payload: {
            "traffic_level": "HIGH",
            "congestion_probability": 81,
            "estimated_speed": 22.0,
            "expected_delay": 24,
            "traffic_volume": 1400,
            "reasons": [],
            "recommendation": "Leave later.",
            "route_recommendations": [],
        },
    )

    asyncio.run(predict_route.predict(PredictionRequest(location="Mysuru", weather="Rain")))

    assert DatabaseManager.list_predictions() == [
        {
            "date": PredictionRequest(location="Mysuru").date,
            "location": "Mysuru",
            "predicted_level": "HIGH",
            "congestion_percent": 81,
            "estimated_delay": 24,
            "weather": "Rain",
        }
    ]


def test_heatmap_values_have_a_spread_for_distinct_color_rendering():
    values = {round(cell["value"]) for cell in ml_service.get_traffic_analytics()["heatmap"]}

    assert len(values) > 4
