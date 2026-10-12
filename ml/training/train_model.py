from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.dataset.generate_dataset import generate_traffic_dataset
from ml.preprocessing.preprocess import build_preprocessor

BASE_DIR = Path(__file__).resolve().parents[1]
DATASET_PATH = BASE_DIR / "dataset" / "traffic_dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def build_model_pipeline(model_name: str):
    numeric_features = ["temperature", "traffic_volume", "average_speed", "road_capacity"]
    categorical_features = ["location", "day", "weather", "holiday", "accident"]

    model_map = {
        "random_forest": RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced"),
        "decision_tree": DecisionTreeClassifier(random_state=42, max_depth=8),
        "gradient_boosting": GradientBoostingClassifier(random_state=42),
    }

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor(numeric_features, categorical_features)),
            ("model", model_map[model_name]),
        ]
    )
    return pipeline


def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    report = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }
    return report


def train_and_save_model():
    if not DATASET_PATH.exists():
        generate_traffic_dataset(DATASET_PATH)

    df = pd.read_csv(DATASET_PATH)
    df["time_hour"] = df["time"].str.split(":").str[0].astype(int)
    df["peak_hour"] = df["time_hour"].apply(lambda hour: 1 if 17 <= hour <= 20 else 0)

    features = [
        "location",
        "day",
        "weather",
        "temperature",
        "traffic_volume",
        "average_speed",
        "holiday",
        "accident",
        "road_capacity",
        "time_hour",
        "peak_hour",
    ]
    target = "congestion_level"

    X = df[features]
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    model_scores = {}
    for model_name in ["random_forest", "decision_tree", "gradient_boosting"]:
        pipeline = build_model_pipeline(model_name)
        pipeline.fit(X_train, y_train)
        model_scores[model_name] = evaluate_model(pipeline, X_test, y_test)

    best_model_name = max(model_scores, key=lambda key: model_scores[key]["f1"])
    best_pipeline = build_model_pipeline(best_model_name)
    best_pipeline.fit(X_train, y_train)

    model_path = MODEL_DIR / "best_traffic_model.pkl"
    joblib.dump(best_pipeline, model_path)

    report_path = MODEL_DIR / "model_report.json"
    model_report = {
        "best_model": best_model_name,
        "metrics": model_scores,
        "feature_order": features,
    }
    report_path.write_text(json.dumps(model_report, indent=2))

    return {
        "best_model": best_model_name,
        "metrics": model_scores[best_model_name],
        "model_path": str(model_path),
    }


if __name__ == "__main__":
    result = train_and_save_model()
    print(json.dumps(result, indent=2))
