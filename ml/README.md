# HealthGuard Machine Learning Module

This module contains the Machine Learning part of the HealthGuard project.

It includes:

- the heart disease dataset
- the training and evaluation notebook
- saved model and scaler files
- generated plots and reports
- a small FastAPI service used by the HealthGuard backend for predictions

## Dataset

The dataset used is the Heart Disease Dataset.  
It contains patient health attributes such as age, sex, chest pain type, resting blood pressure, cholesterol, fasting blood sugar, maximum heart rate and other clinical indicators.

Dataset location:

```text
ml/dataset/heart.csv
```

The target column shows whether the patient has heart disease:

- 0 = No heart disease
- 1 = Heart disease

When running commands from inside the `ml` folder, the same dataset path is:

```text
dataset/heart.csv
```

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

Other saved model assets may also be present in `models`, such as the selected classical model, neural model, and feature column metadata.

## Results and Plots

The notebook saves generated outputs to:

```text
ml/results
```

This folder contains plots, CSV summaries, and report files such as:

- model comparison plots
- ROC curves
- confusion-matrix and metric summaries
- feature importance outputs
- clustering and PCA visualizations
- SHAP plots
- `HealthGuard_ML_Report.pdf`

The platform-readable model metrics are exported to:

```text
ml/model_comparison_results.json
```

The backend uses this JSON file for the admin model summary and report pages.

## How to Run

From the project root, create a Python virtual environment:

```bash
python -m venv ml/.venv
```

Activate it on Windows PowerShell:

```powershell
ml\.venv\Scripts\Activate.ps1
```

Activate it on macOS or Linux:

```bash
source ml/.venv/bin/activate
```

Install dependencies from the project root:

```bash
pip install -r ml/requirements.txt
```

If you are already inside the `ml` folder, use:

```bash
pip install -r requirements.txt
```

## Running the Notebook

Start Jupyter from the project root:

```bash
jupyter notebook ml/notebooks/healthguard_ml.ipynb
```

Or from inside the `ml` folder:

```bash
jupyter notebook notebooks/healthguard_ml.ipynb
```

The notebook reads the dataset from `ml/dataset/heart.csv`, trains and compares the models, saves model files under `ml/models`, and writes plots and analysis files under `ml/results`.

After rerunning the notebook, make sure `ml/model_comparison_results.json` is up to date if the backend/admin dashboard should show the newest ML metrics.

## Running the Prediction API

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

## Connection to the HealthGuard Platform

The HealthGuard backend is configured to call the ML API at:

```text
http://localhost:8000
```

This value is set in `backend/HealthGuard.API/appsettings.json` under:

```text
MlApi:BaseUrl
```

It can also be overridden with the `ML_API_BASE_URL` environment variable.

When a user requests a health prediction in the web app:

1. The React frontend sends the request to the ASP.NET Core backend.
2. The backend calls the Python FastAPI service at `POST /predict`.
3. The FastAPI service loads `models/logistic_model.pkl` and `models/scaler.pkl`.
4. The API returns the prediction, risk score, risk level, explanation, and contributing factors.
5. The backend stores the prediction result in SQL Server, refreshes Redis-backed caches, and sends notifications.

If the ML API is not running, the backend uses its rule-based fallback prediction service so the application can still respond.

Run the HealthGuard backend:

```bash
dotnet run --project backend/HealthGuard.API --urls http://localhost:5000
```

Run the HealthGuard frontend:

```bash
cd frontend
npm run dev
```
