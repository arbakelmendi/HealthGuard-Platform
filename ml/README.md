# HealthGuard Machine Learning Module

This module contains the Machine Learning part of the HealthGuard project.

## Dataset

The dataset used is the Heart Disease Dataset.  
It contains patient health attributes such as age, sex, chest pain type, resting blood pressure, cholesterol, fasting blood sugar, maximum heart rate and other clinical indicators.

The target column shows whether the patient has heart disease:

- 0 = No heart disease
- 1 = Heart disease

## Implemented Models

The following classification models were implemented:

1. Logistic Regression
2. Decision Tree
3. K-Nearest Neighbors
4. Neural Network

## Evaluation Metrics

The models were evaluated using:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

## Clustering

K-Means clustering was also applied after removing the target variable.  
PCA was used to visualize the clustering results in 2D.

## Saved Model

The Logistic Regression model was saved for integration with the HealthGuard backend.

Saved files:

- models/logistic_model.pkl
- models/scaler.pkl

## How to Run

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI ML service:

```bash
cd ml/api
uvicorn app:app --reload --port 8000
```

The ML API exposes:

```text
POST http://localhost:8000/predict
```

Example request body:

```json
{
  "age": 52,
  "sex": 1,
  "cp": 0,
  "trestbps": 135,
  "chol": 225,
  "fbs": 0,
  "restecg": 1,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 1.0,
  "slope": 1,
  "ca": 0,
  "thal": 2
}
```

Run the HealthGuard backend:

```bash
dotnet run --project backend/HealthGuard.API --urls http://localhost:5000
```

Run the HealthGuard frontend:

```bash
cd frontend
npm run dev
```
