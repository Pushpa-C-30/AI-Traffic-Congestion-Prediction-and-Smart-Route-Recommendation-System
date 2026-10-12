import os
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "TRAFFIQ"
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "traffiq"
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    model_path: str = str(BASE_DIR / "ml" / "models" / "best_traffic_model.pkl")
    dataset_path: str = str(BASE_DIR / "ml" / "dataset" / "traffic_dataset.csv")
    history_db_path: str = str(BASE_DIR / "data" / "traffiq_history.sqlite3")
    api_prefix: str = "/api"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / "backend" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=(),
    )


settings = Settings()
