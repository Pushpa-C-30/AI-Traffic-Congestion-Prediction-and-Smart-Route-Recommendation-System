import asyncio
import sqlite3
from pathlib import Path
from typing import Any, Dict, List

try:
    from motor.motor_asyncio import AsyncIOMotorClient
except Exception:  # pragma: no cover
    AsyncIOMotorClient = None

from .config import settings


class DatabaseManager:
    client = None
    db = None

    @classmethod
    async def connect(cls):
        if cls.client is not None:
            return cls.client
        if AsyncIOMotorClient is None:
            cls.client = None
            cls.db = None
            return None
        try:
            cls.client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=2000)
            cls.db = cls.client[settings.mongo_db]
            await cls.db.command("ping")
            return cls.client
        except Exception:
            cls.client = None
            cls.db = None
            return None

    @classmethod
    async def get_collection(cls, name: str):
        await cls.connect()
        if cls.db is None:
            return None
        return cls.db[name]

    @classmethod
    def save_prediction(cls, record: Dict[str, Any]) -> None:
        database_path = Path(settings.history_db_path)
        database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(database_path, timeout=10)
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS prediction_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    date TEXT NOT NULL,
                    location TEXT NOT NULL,
                    predicted_level TEXT NOT NULL,
                    congestion_percent INTEGER NOT NULL,
                    estimated_delay INTEGER NOT NULL,
                    weather TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                INSERT INTO prediction_history
                    (date, location, predicted_level, congestion_percent, estimated_delay, weather)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    record["date"],
                    record["location"],
                    record["predicted_level"],
                    record["congestion_percent"],
                    record["estimated_delay"],
                    record["weather"],
                ),
            )
            connection.commit()
        finally:
            connection.close()

    @classmethod
    def list_predictions(cls) -> List[Dict[str, Any]]:
        database_path = Path(settings.history_db_path)
        if not database_path.exists():
            return []
        connection = sqlite3.connect(database_path, timeout=10)
        connection.row_factory = sqlite3.Row
        try:
            rows = connection.execute(
                """
                SELECT date, location, predicted_level, congestion_percent, estimated_delay, weather
                FROM prediction_history
                ORDER BY created_at DESC, id DESC
                """
            ).fetchall()
            return [dict(row) for row in rows]
        finally:
            connection.close()

    @classmethod
    def demo_locations(cls) -> List[Dict[str, str]]:
        return [
            {"name": "Electronic City", "region": "South Bengaluru"},
            {"name": "Silk Board", "region": "Central Bengaluru"},
            {"name": "Koramangala", "region": "East Bengaluru"},
            {"name": "Whitefield", "region": "East Bengaluru"},
            {"name": "Hebbal", "region": "North Bengaluru"},
        ]
