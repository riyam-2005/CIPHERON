# CIPHERON-X1 Deployment & Local Setup Guide

## 1. Quick Start (Local Development)

### 1.1 Backend Companion Server
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\Activate.ps1
pip install -e .
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 1.2 Frontend Web Dashboard
```bash
cd frontend
npm install
npm run dev
# Dashboard launches at http://localhost:3000
```

## 2. Docker Compose Deployment
To run the local-first stack in isolated containers:
```bash
docker-compose up --build
```
Access the dashboard at `http://localhost:3000` and API docs at `http://localhost:8000/docs`.
