# HealthGuard Machine Learning Module

This module contains the Machine Learning part of the HealthGuard project.

It includes:

- the heart disease dataset
- the training and evaluation notebook
- saved model and scaler files
- generated plots and reports
- a small FastAPI service used by the HealthGuard backend for predictions

## Recommended Environment

Use Python 3.11 for the most predictable local setup. The notebook relies on TensorFlow, scikit-learn and Jupyter, so using a virtual environment is recommended to keep these packages isolated from the rest of the platform.

The commands below assume they are run from the repository root:

```text
healthguard-platform
```

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
4. Random Forest
5. Neural Network

## Evaluation Metrics

The models were evaluated using:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

## Clustering

K-Means clustering was also applied after removing the target variable.  
The notebook tests multiple `k` values, uses the Elbow Method and Silhouette Score to evaluate cluster quality, and compares the selected clusters with the true labels using Adjusted Rand Index (ARI), Normalized Mutual Information (NMI), and a cluster-class match score. PCA was used to visualize the clustering results in 2D.

## Saved Model

The Logistic Regression model was saved for integration with the HealthGuard backend.

## Final Model Recommendation

The recommended classifier for HealthGuard is Logistic Regression. In the final comparison it tied for the best F1-score, kept strong recall for detecting heart-disease cases, and remained easier to explain and deploy than KNN, Random Forest, or Neural Network alternatives. Recall is especially important in this use case because a false negative may miss a patient who is actually at risk.

Saved files:

- models/logistic_model.pkl
- models/scaler.pkl

Other saved model assets may also be present in `models`, such as the selected classical model, neural model, and feature column metadata.

## Project Files and Outputs

The ML workflow uses and creates files in these locations:

| Type | Location | Notes |
| --- | --- | --- |
| Input dataset | `ml/dataset/heart.csv` | Source heart disease CSV used by the notebook. |
| Notebook | `ml/notebooks/healthguard_ml.ipynb` | Main exploratory analysis, training, evaluation and export workflow. |
| Trained models | `ml/models` | Saved `.pkl` and `.keras` model assets, including `logistic_model.pkl` and `scaler.pkl` for the prediction API. |
| Result CSV files | `ml/results` | Model comparison tables, feature-selection results, clustering metrics, SHAP-style summaries and other tabular outputs. |
| JSON outputs | `ml/model_comparison_results.json` | Platform-readable model metrics used by the backend/admin report pages. |
| Visualizations | `ml/results/plots` | Main plot folder for confusion matrices, ROC curves, clustering plots, feature plots and interpretation images. |
| Report files | `ml/results` | Generated report artifacts such as `HealthGuard_ML_Report.pdf`. |

The notebook also saves some image copies directly under `ml/results` to preserve existing project file paths. Common outputs include:

- model comparison plots
- ROC curves
- confusion-matrix and metric summaries
- feature importance outputs, including `feature_importance.csv` and `top_predictive_health_indicators.csv`
- clustering Elbow Method, Silhouette Score, and PCA visualizations
- SHAP-style interpretation outputs, including `shap_interpretation_summary.csv`, `plots/shap_summary.png`, and `plots/shap_patient_example.png`
- `HealthGuard_ML_Report.pdf`

The platform-readable model metrics are exported to:

```text
ml/model_comparison_results.json
```

The backend uses this JSON file for the admin model summary and report pages.

## Course Requirement Alignment

The notebook includes report-style Markdown sections for:

- Introduction
- Dataset Description
- Methodology
- Results
- Discussion
- Conclusion
- References
- Final Course Requirements Checklist

The final checklist in `ml/notebooks/healthguard_ml.ipynb` maps each course requirement to the implemented notebook section or exported output. A project-level checklist is also maintained in `ml/results/PROJECT_ML_SUMMARY.md`.

## Setup

From the project root, create a Python virtual environment:

```bash
py -3.11 -m venv ml/.venv
```

If the `py` launcher is not available, use:

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

Install the ML dependencies with `requirements.txt`:

```bash
python -m pip install --upgrade pip
pip install -r ml/requirements.txt
```

If you are already inside the `ml` folder, use:

```bash
pip install -r requirements.txt
```

The requirements file includes the libraries used by the notebook for data analysis, modeling, visualization and export:

- `pandas`, `numpy`
- `scikit-learn`
- `matplotlib`, `seaborn`
- `joblib`
- `tensorflow`
- `jupyter`, `notebook`, `ipykernel`
- `fastapi`, `pydantic`, `uvicorn` for the ML prediction API

Optional but recommended: register the virtual environment as a Jupyter kernel:

```bash
python -m ipykernel install --user --name healthguard-ml --display-name "Python (HealthGuard ML)"
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

In Jupyter, select the `Python (HealthGuard ML)` kernel if you registered it during setup, then run the notebook from top to bottom.

For the most reproducible full run, execute the notebook from the project root without manual cell editing:

```bash
jupyter nbconvert --to notebook --execute ml/notebooks/healthguard_ml.ipynb --inplace --ExecutePreprocessor.timeout=-1
```

The notebook reads the dataset from `ml/dataset/heart.csv`, trains and compares the models, saves model files under `ml/models`, writes plots and analysis files under `ml/results`, and exports `ml/model_comparison_results.json` for the backend/admin dashboard.

## Reproducibility Notes

The notebook is designed to run from the project root, the `ml` folder, or the `ml/notebooks` folder. It automatically locates `ml/dataset/heart.csv` and creates these folders if they do not already exist:

- `ml/results`
- `ml/results/plots`
- `ml/models`

Reproducibility settings are centralized near the top of the notebook:

- `SEED = 42`
- Python, NumPy and TensorFlow seeds are fixed.
- TensorFlow deterministic operations are requested with `TF_DETERMINISTIC_OPS=1`.
- `train_test_split`, `GridSearchCV` folds, cross-validation, permutation importance, K-Means and supported model constructors use the shared seed.
- Neural-network dropout uses a fixed seed, and neural-network training disables data shuffling for deterministic cell reruns.

Small numeric differences can still occur across operating systems, TensorFlow versions or hardware backends, but the workflow no longer requires manual path edits or manual output-folder creation.

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
