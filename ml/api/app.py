from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
FEATURE_COLUMNS = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]

model = joblib.load(MODEL_DIR / "logistic_model.pkl")
scaler = joblib.load(MODEL_DIR / "scaler.pkl")

app = FastAPI(title="HealthGuard ML Prediction API")


class HeartDiseasePredictionRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)
    cp: int = Field(..., ge=0, le=3)
    trestbps: int = Field(..., ge=70, le=250)
    chol: int = Field(..., ge=80, le=400)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: int = Field(..., ge=60, le=220)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=0, le=10)
    slope: int = Field(..., ge=0, le=2)
    ca: int = Field(..., ge=0, le=4)
    thal: int = Field(..., ge=0, le=3)


def risk_level(probability: float) -> str:
    if probability < 0.40:
        return "Low"
    if probability < 0.70:
        return "Medium"
    return "High"


def contributing_factors(request: HeartDiseasePredictionRequest, probability: float) -> List[str]:
    factors: List[str] = []

    if request.age >= 60:
        factors.append(f"Age {request.age}")
    if request.trestbps >= 140:
        factors.append(f"High resting blood pressure ({request.trestbps})")
    elif request.trestbps >= 130:
        factors.append(f"Elevated resting blood pressure ({request.trestbps})")
    if request.chol >= 240:
        factors.append(f"High cholesterol ({request.chol})")
    elif request.chol >= 200:
        factors.append(f"Borderline cholesterol ({request.chol})")
    if request.fbs == 1:
        factors.append("Fasting blood sugar above threshold")
    if request.exang == 1:
        factors.append("Exercise-induced angina indicator")
    if request.cp > 0:
        factors.append("Chest pain category present")
    if request.oldpeak >= 2:
        factors.append(f"Elevated ST depression ({request.oldpeak:g})")

    if not factors:
        factors.append(f"Model probability {probability:.2f}")

    return factors


@app.post("/predict")
def predict(request: HeartDiseasePredictionRequest):
    frame = pd.DataFrame([[getattr(request, column) for column in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)
    scaled = scaler.transform(frame)

    prediction = int(model.predict(scaled)[0])
    probabilities = model.predict_proba(scaled)[0]
    positive_probability = float(probabilities[1] if len(probabilities) > 1 else probabilities[0])
    score = int(round(np.clip(positive_probability, 0, 1) * 100))
    level = risk_level(positive_probability)
    factors = contributing_factors(request, positive_probability)

    return {
        "prediction": prediction,
        "riskScore": score,
        "riskLevel": level,
        "explanation": (
            f"The Logistic Regression model estimated a {positive_probability:.0%} "
            f"probability of heart disease risk, classified as {level.lower()} risk."
        ),
        "contributingFactors": factors,
    }
