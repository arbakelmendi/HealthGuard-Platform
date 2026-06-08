# HealthGuard ML Defense Preparation

This document helps the team prepare for a project defense of the HealthGuard machine learning module. The main implementation files are:

- `ml/notebooks/healthguard_ml.ipynb`
- `ml/dataset/heart.csv`
- `ml/results/final_model_results.csv`
- `ml/results/PROJECT_ML_SUMMARY.md`
- `ml/model_comparison_results.json`

## Project Overview

HealthGuard uses machine learning to predict heart disease risk from patient clinical and demographic attributes. The workflow includes exploratory data analysis, preprocessing, supervised classification, neural-network experiments, feature selection, explainable AI, clustering, cross-validation and platform integration.

The final recommended model is **Logistic Regression with Feature Selection** because it achieved the best final F1-score while remaining simple, fast and explainable for a health-risk screening platform.

## Dataset Selection

**Question: Why did you choose the Heart Disease dataset?**

Expected answer: We selected the Heart Disease dataset because it matches the HealthGuard project goal: predicting health risk from patient information. The dataset contains medically relevant features such as age, chest pain type, cholesterol, resting blood pressure, maximum heart rate, exercise-induced angina, ST depression, number of major vessels and thalassemia. The target is binary, so it fits the platform's classification use case.

**Question: What does the target variable mean?**

Expected answer: The target column has two classes. `0` means no heart disease and `1` means heart disease. The model predicts this binary outcome and returns a probability/risk score that HealthGuard can show to users.

**Question: Did the dataset need cleaning?**

Expected answer: Yes. The raw dataset had 1,025 rows, but many were duplicates. After duplicate removal, the working dataset contained 302 unique records. No missing values were found, so imputation was not required.

**Question: Why was scaling used?**

Expected answer: Scaling was needed because several models are sensitive to feature magnitude, especially Logistic Regression, KNN, Neural Networks and K-Means clustering. `StandardScaler` puts features on a comparable scale so variables such as cholesterol or blood pressure do not dominate only because they have larger numeric ranges.

## Model Selection

**Question: Which supervised models did you train?**

Expected answer: We trained Logistic Regression, Decision Tree, KNN, Random Forest and two Neural Network architectures. We also evaluated feature-selected versions of the classical models.

**Question: Why is Logistic Regression with Feature Selection recommended?**

Expected answer: It had the best final F1-score (`0.8358`) and accuracy (`0.8197`) in the final test comparison. It also had strong ROC-AUC (`0.8799`) and is easier to explain than KNN, Random Forest or Neural Networks. For HealthGuard, interpretability matters because users and evaluators should understand which health indicators influenced the prediction.

**Question: Why not choose the most complex model?**

Expected answer: More complex models do not always perform better, especially on a small tabular dataset. The neural networks and Random Forest were useful comparisons, but they did not beat Logistic Regression with Feature Selection. A simpler model with strong metrics is better for this project because it is easier to deploy, explain and defend.

**Question: Why is F1-score important here?**

Expected answer: F1-score balances precision and recall. In heart disease risk prediction, both false negatives and false positives matter. A false negative may miss a patient who is actually at risk, while a false positive may cause unnecessary concern or follow-up. F1-score helps balance those two error types.

## Hyperparameter Tuning

**Question: How did you tune the models?**

Expected answer: We used `GridSearchCV` with 5-fold stratified cross-validation and F1-score as the scoring metric. This means the training data was split into folds, multiple parameter combinations were tested, and the configuration with the best validation F1-score was selected.

**Question: What parameters were tested?**

Expected answer:

| Model | Parameters Tested |
|---|---|
| Logistic Regression | `C`, `solver` |
| Decision Tree | `max_depth`, `criterion` |
| KNN | `n_neighbors`, `weights` |
| Random Forest | `n_estimators`, `max_depth`, `criterion` |
| Neural Networks | Two manually designed architectures with different hidden layers, neurons and dropout |

**Question: Why use cross-validation during tuning?**

Expected answer: Cross-validation reduces the chance of choosing a model that only performs well on one lucky split. It gives a more stable estimate of validation performance before testing on the final held-out test set.

**Question: Why are final scores not perfect?**

Expected answer: Perfect scores would be suspicious for this type of real-world health dataset. The final results are realistic because duplicates were removed, the test set was held out, and no target leakage was intentionally used. Earlier unrealistic scores were replaced with final evaluation metrics.

## Feature Selection

**Question: What is feature selection?**

Expected answer: Feature selection chooses a smaller group of useful input features. The goal is to reduce noise, simplify the model and improve interpretability while keeping predictive performance strong.

**Question: Which feature selection method was used?**

Expected answer: The notebook uses `SelectKBest`. The main feature-selected classifier experiment uses 8 selected features. A separate comparison study also evaluates Top 10 and Top 5 feature sets using Mutual Information.

**Question: Which features were selected for the final recommended model?**

Expected answer: The selected features were:

`sex`, `cp`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`

These are meaningful because they describe demographic context, chest pain, exercise response, ST depression, ST-segment slope, major vessel count and thalassemia.

**Question: Did feature selection improve every model?**

Expected answer: No. Feature selection improved the final Logistic Regression result, but it did not help every model equally. Some tree-based models lost performance with fewer features. This shows that feature selection must be validated with metrics instead of assumed to always improve results.

## Neural Network Architectures

**Question: What neural network architectures were tested?**

Expected answer:

| Architecture | Hidden Layers | Neurons | Activation | Optimizer | Learning Rate | Epochs |
|---|---:|---|---|---|---:|---:|
| Architecture 1 | 2 | `16`, `8` | ReLU hidden, sigmoid output | Adam | `0.001` | `50` |
| Architecture 2 | 3 + dropout | `32`, `16`, `8` with `Dropout(0.3)` | ReLU hidden, sigmoid output | Adam | `0.001` | `50` |

**Question: Why use sigmoid in the output layer?**

Expected answer: The task is binary classification. A sigmoid output produces a probability between 0 and 1, which can be interpreted as the model's estimated probability of heart disease risk.

**Question: Why use ReLU in hidden layers?**

Expected answer: ReLU is a common hidden-layer activation because it helps neural networks learn non-linear patterns and is computationally efficient.

**Question: What did dropout do in Architecture 2?**

Expected answer: Dropout randomly disables some neurons during training to reduce overfitting. In our result, Architecture 2 improved recall slightly but had lower accuracy, precision, F1-score and ROC-AUC than Architecture 1, so the extra complexity did not clearly help this small tabular dataset.

**Question: Why did the neural networks not win?**

Expected answer: Neural networks often need more data to outperform simpler models. This cleaned dataset has only 302 unique records, so Logistic Regression with selected features generalized better and was easier to explain.

## Clustering

**Question: Why did you include clustering?**

Expected answer: Clustering was included as an unsupervised learning component. It explores whether patients naturally group into similar profiles based on clinical features, without using the target label during clustering.

**Question: Did you remove the target before clustering?**

Expected answer: Yes. The `target` label was removed before K-Means. K-Means used only the scaled feature matrix. The true labels were used afterward only for evaluation and interpretation.

**Question: How did you choose the number of clusters?**

Expected answer: The notebook tested `k` values from 2 to 10. It used the Elbow Method to inspect inertia and Silhouette Score to select the best-separated clusters. The best `k` was selected by the highest Silhouette Score.

**Question: What metrics compared clusters to true labels?**

Expected answer: Adjusted Rand Index (ARI) and Normalized Mutual Information (NMI) were used after clustering to compare discovered clusters with the true heart disease labels. These metrics were not used to train K-Means.

**Question: What do the clusters mean?**

Expected answer: The clusters represent broad patient profiles with similar clinical measurements, such as chest pain type, exercise response, ST depression, maximum heart rate, major vessel count and thalassemia values. They are exploratory groups, not medical diagnoses.

## Explainability

**Question: How can you explain model predictions?**

Expected answer: We used feature importance and SHAP-style Logistic Regression contribution explanations. Feature importance combines Logistic Regression coefficient strength and Random Forest importance. Local contribution plots show which features pushed a sample prediction toward higher or lower modeled risk.

**Question: What were the top predictive health indicators?**

Expected answer: The top indicators included:

`cp`, `thalach`, `ca`, `thal`, `exang`, `oldpeak`, `sex`, `slope`, `age`, `chol`

These represent chest pain, heart-rate response, vessel count, thalassemia, exercise-induced angina, ST depression, demographic context, ECG slope, age and cholesterol.

**Question: Are these explanations medical advice?**

Expected answer: No. They explain how the trained model uses the dataset features. They are useful for transparency, but they should not be interpreted as medical causation or professional diagnosis.

## Reproducibility

**Question: Can the notebook be rerun from start to finish?**

Expected answer: Yes. The notebook has a reproducibility setup cell that defines `SEED = 42`, creates output folders automatically and uses portable paths. It can be run from the project root with:

```bash
jupyter nbconvert --to notebook --execute ml/notebooks/healthguard_ml.ipynb --inplace --ExecutePreprocessor.timeout=-1
```

**Question: Where are outputs saved?**

Expected answer:

- Models: `ml/models`
- CSV summaries and main plots: `ml/results`
- Plot collection: `ml/results/plots`
- Platform JSON summary: `ml/model_comparison_results.json`
- Final summary: `ml/results/PROJECT_ML_SUMMARY.md`

## Platform Integration

**Question: How does the ML work connect to HealthGuard?**

Expected answer: The notebook saves the Logistic Regression model and scaler under `ml/models`. The FastAPI prediction service in `ml/api/app.py` loads `logistic_model.pkl` and `scaler.pkl`, receives patient input, scales the input, predicts risk and returns a risk score, risk level, explanation and contributing factors. The ASP.NET backend calls this ML API when users request predictions.

**Question: What file powers the admin model summary?**

Expected answer: `ml/model_comparison_results.json`. It contains classification metrics, feature importance and clustering results in a platform-readable structure.

## Quick Team Speaking Guide

- Dataset member: explain dataset source, target values, duplicate removal, missing values and scaling.
- Model member: explain model choices, evaluation metrics, final recommendation and why F1-score mattered.
- Tuning member: explain `GridSearchCV`, 5-fold cross-validation and selected hyperparameters.
- Feature selection member: explain `SelectKBest`, selected features and why feature reduction must be validated.
- Neural network member: explain both architectures, activations, optimizer, dropout and why neural networks did not win.
- Clustering member: explain target removal, tested `k` values, Elbow Method, Silhouette Score, PCA, ARI and NMI.
- Platform member: explain saved model files, FastAPI prediction flow and `model_comparison_results.json`.

## Final Defense Message

HealthGuard demonstrates a complete and realistic machine learning workflow. The project does not only train a model; it cleans the dataset, compares multiple algorithms, tunes hyperparameters, evaluates with several metrics, checks model stability, studies feature selection, performs clustering, adds explainability and connects the final model to the platform. The final model choice is justified by performance, interpretability and deployment practicality.
