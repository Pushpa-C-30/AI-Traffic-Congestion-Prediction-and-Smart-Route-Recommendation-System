# TRAFFIQ

TRAFFIQ is an AI-powered traffic intelligence platform that predicts congestion, explains the cause, and recommends better travel decisions.

## Features
- AI traffic prediction using a real ML pipeline
- Smart route comparison
- Live dashboard with simulated traffic data
- Analytics and heatmap visualizations
- Prediction history and saved locations
- Demo mode for local development without paid APIs

## Tech Stack
- Frontend: React + Vite + Recharts + Lucide React
- Backend: FastAPI + Python
- Machine Learning: Pandas + NumPy + Scikit-learn
- Database: MongoDB-ready integration with demo fallback

## Project Structure
```text
traffiq/
├── frontend/
├── backend/
├── ml/
├── tests/
├── README.md
├── .gitignore
└── .env.example
```

## Quick start

### 1. Install backend dependencies
```bash
cd traffiq/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generate dataset and train the model
```bash
cd traffiq/ml
python dataset/generate_dataset.py
python training/train_model.py
```

### 3. Run API
```bash
cd traffiq/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start frontend
```bash
cd traffiq/frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Example API calls
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Electronic City",
    "date": "2026-10-12",
    "time": "18:30",
    "day": "Tuesday",
    "weather": "Rain",
    "temperature": 27,
    "traffic_volume": 1800,
    "average_speed": 24,
    "holiday": false,
    "accident": true,
    "road_capacity": 2200
  }'
```

## Demo mode
The app ships with realistic simulated data and a trained demo model, so it runs locally without external paid APIs.

## Future scope
- Google Maps / Mapbox integration
- Real-time traffic APIs
- CCTV and IoT sensors
- Smart city control systems
