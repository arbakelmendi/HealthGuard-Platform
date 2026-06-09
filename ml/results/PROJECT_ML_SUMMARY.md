# HealthGuard Machine Learning Project Summary

## Course Requirements Checklist

| Requirement | Status | Implemented file/section |
|---|---|---|
| Dataset and topic | Done | `ml/dataset/heart.csv`; `ml/notebooks/healthguard_ml.ipynb` section `Dataset Description`; this document section `Dataset Description` |
| Preprocessing | Done | `ml/notebooks/healthguard_ml.ipynb` sections `Exploratory Data Analysis (EDA)`, `Missing Values`, `Duplicate Rows`, `Define Features and Target Variable`, `Feature Scaling`; outputs in `ml/results/eda_summary.csv` |
| Train/test split | Done | `ml/notebooks/healthguard_ml.ipynb` section `Train-Test Split`; uses an 80/20 stratified split with `random_state=42` |
| Four classifiers | Done | `ml/notebooks/healthguard_ml.ipynb` section `Classical Classification Models`; Logistic Regression, Decision Tree, KNN and Random Forest |
| Neural network with two architectures | Done | `ml/notebooks/healthguard_ml.ipynb` section `Neural Network Classifier`; Architecture 1 uses `16 -> 8 -> output`, Architecture 2 uses `32 -> Dropout -> 16 -> 8 -> output` |
| Hyperparameter tuning | Done | `ml/notebooks/healthguard_ml.ipynb` section `Classical Classification Models`; `GridSearchCV` with 5-fold cross-validation and F1-score scoring; final tuning summary in this document section `Hyperparameter Tuning Summary` |
| Feature selection or dimensionality reduction | Done | `ml/notebooks/healthguard_ml.ipynb` sections `Feature Selection`, `Feature Selection Comparison Study`, and `PCA Visualization of Selected Clusters`; outputs in `ml/results/feature_selection_study.csv` and `ml/results/plots/kmeans_pca_clusters.png` |
| Explainable AI and interpretability | Done | `ml/notebooks/healthguard_ml.ipynb` sections `Feature Importance and Top Predictive Health Indicators` and `SHAP Interpretation Summary and Local Explanations`; outputs in `ml/results/feature_importance.csv`, `ml/results/top_predictive_health_indicators.csv`, `ml/results/shap_interpretation_summary.csv`, and `ml/results/plots` |
| Evaluation metrics | Done | `ml/notebooks/healthguard_ml.ipynb` sections `Final Model Comparison`, `Comprehensive Cross-Validation Study`, `ROC-AUC Evaluation`, and confusion-matrix sections; outputs in `ml/results/final_model_results.csv`, `ml/results/cross_validation_results.csv`, `ml/results/cross_validation_detailed_scores.csv`, `ml/results/train_test_vs_cross_validation.csv`, and `ml/results/roc_curves.png` |
| Comparison table | Done | `ml/results/final_model_results.csv`; `ml/model_comparison_results.json`; `ml/notebooks/healthguard_ml.ipynb` section `Final Model Comparison`; this document section `Hyperparameter Tuning Summary` |
| Clustering | Done | `ml/notebooks/healthguard_ml.ipynb` section `Clustering Analysis`; target removed before K-Means; tests `k=2..10`; uses Elbow Method, Silhouette Score, PCA, ARI, NMI and cluster-class match score; outputs in `ml/results/clustering_evaluation.csv`, `ml/results/cluster_class_summary.csv` and `ml/results/plots` |
| Report-style notebook sections | Done | `ml/notebooks/healthguard_ml.ipynb` sections `Introduction`, `Dataset Description`, `Methodology`, `Results`, `Discussion`, `Conclusion`, `References`, and `Final Course Requirements Checklist` |
| README and requirements.txt | Done | `README.md`, `ml/README.md`, and `ml/requirements.txt`; setup covers virtual environment, dependency installation, notebook execution, dataset location, results location, and platform integration |

## Reproducibility Improvements

The ML workflow was updated so the notebook can be rerun from start to finish without manual path edits or manual folder creation.

Reproducibility checklist:

- Fixed shared seed: the notebook defines `SEED = 42`.
- Seeded libraries: Python `random`, NumPy and TensorFlow are seeded in the setup cell.
- Deterministic TensorFlow request: `TF_DETERMINISTIC_OPS=1` is set where supported by the local TensorFlow installation.
- Seeded model workflow: `train_test_split`, `StratifiedKFold`, `GridSearchCV`, permutation importance, K-Means, Decision Tree, Random Forest and neural-network dropout use the shared seed.
- Deterministic neural-network training: neural-network cells reset the TensorFlow seed before model construction and disable training-data shuffling during `fit`.
- Portable paths: the notebook locates `ml/dataset/heart.csv` from the current working directory and uses `pathlib.Path` objects for dataset, results, plots and model paths.
- Automatic folders: `ml/results`, `ml/results/plots` and `ml/models` are created automatically at the top of the notebook.
- Reproducible platform export: the notebook writes `ml/model_comparison_results.json` automatically after model evaluation, so the backend/admin dashboard can use the same results produced by the final notebook run.
- API model export: the notebook saves the full-feature Logistic Regression model as `ml/models/logistic_model.pkl`, the scaler as `ml/models/scaler.pkl`, and feature columns as `ml/models/columns.pkl`.

Exact full-run command from the project root:

```bash
jupyter nbconvert --to notebook --execute ml/notebooks/healthguard_ml.ipynb --inplace --ExecutePreprocessor.timeout=-1
```

Small numeric differences can still occur across machines because TensorFlow and numerical libraries may use different low-level kernels, but the workflow now has fixed seeds, stable paths and automatic output generation.

## Defense Preparation

Each team member should be ready to explain one part of the ML workflow clearly and connect it to the saved files:

- Dataset and preprocessing member: explain why the Heart Disease dataset fits the HealthGuard topic, what the target values mean, why duplicate rows were removed, why no missing-value imputation was needed, and why scaling was applied before Logistic Regression, KNN, Neural Networks and K-Means.
- Model training member: explain the 80/20 stratified train/test split, the four classical classifiers, why F1-score was used for tuning, what `GridSearchCV` tested, how 5-fold and 10-fold cross-validation were used to assess stability, and why final test metrics are lower and more realistic than perfect scores.
- Neural network member: explain both architectures, the role of ReLU, sigmoid output, binary cross-entropy, Adam optimizer and dropout, and compare neural network performance with the classical models.
- Feature selection and explainability member: explain `SelectKBest`, the Top 10 and Top 5 feature experiments, feature importance, local patient explanations, and why simpler feature sets can improve interpretability but must still be validated.
- Clustering member: explain that the target label was removed before K-Means, why multiple `k` values were tested, how the Elbow Method and Silhouette Score were used, what PCA shows, and how ARI, NMI and cluster-class match score compare clusters with true labels only after clustering.
- Platform integration member: explain how `ml/models/logistic_model.pkl` and `ml/models/scaler.pkl` support the FastAPI prediction service in `ml/api/app.py`, how `ml/model_comparison_results.json` powers the HealthGuard backend/admin model summary, and where plots/reports are saved under `ml/results`.

## Dataset Description

The HealthGuard machine learning module uses the Heart Disease dataset to predict whether a patient is likely to have heart disease based on clinical and demographic attributes.

The target variable is:

- `0`: No heart disease
- `1`: Heart disease

The raw dataset contains 1,025 rows and 14 columns. After duplicate removal, the working dataset contains 302 unique patient records with 13 input features and 1 target column. The cleaned class distribution is reasonably balanced:

- No heart disease: 138 records
- Heart disease: 164 records

The dataset includes features such as age, sex, chest pain type, resting blood pressure, cholesterol, fasting blood sugar, maximum heart rate, exercise-induced angina, ST depression, ST slope, number of major vessels and thalassemia.

## Preprocessing Steps

The preprocessing pipeline included:

- Loading the Heart Disease dataset from `ml/dataset/heart.csv`.
- Checking dataset shape, feature data types and descriptive statistics.
- Checking missing values. No missing values were found.
- Detecting duplicate rows. A total of 723 duplicate rows were removed.
- Separating features from the target variable.
- Splitting the cleaned dataset into training and testing sets using an 80/20 split with stratification.
- Scaling numerical features using `StandardScaler`.

Scaling was important because Logistic Regression, KNN and Neural Networks are sensitive to feature magnitude.

The EDA plots are saved under `ml/results/plots`:

- `class_distribution.png`
- `missing_value_analysis.png`
- `duplicate_record_analysis.png`
- `numeric_feature_distributions.png`
- `categorical_feature_distributions.png`
- `correlation_heatmap.png`

## Classification Models Used

The project evaluated several supervised classification models:

- Logistic Regression
- Decision Tree
- K-Nearest Neighbors
- Random Forest
- Neural Network Architecture 1
- Neural Network Architecture 2

The models were evaluated using accuracy, precision, recall, F1-score, confusion matrices and ROC-AUC. F1-score was treated as a key metric because the task requires balancing false positives and false negatives in a health-risk screening context.

## Neural Network Architectures

Two neural network architectures were tested:

| Architecture | Hidden Layers | Neurons per Hidden Layer | Hidden Activation | Output Layer | Output Activation | Optimizer | Learning Rate | Loss | Epochs | Batch Size | Validation Split |
|---|---:|---|---|---|---|---|---:|---|---:|---:|---:|
| Neural Network Architecture 1 | 2 | 16, 8 | ReLU | 1 neuron | Sigmoid | Adam | 0.001 | Binary cross-entropy | 50 | 16 | 20% |
| Neural Network Architecture 2 | 3 + dropout | 32, 16, 8 | ReLU | 1 neuron | Sigmoid | Adam | 0.001 | Binary cross-entropy | 50 | 16 | 20% |

Architecture 1 was the smaller baseline network. It used two hidden layers with 16 and 8 neurons. Architecture 2 increased capacity by using a wider first hidden layer with 32 neurons, adding a dropout layer with rate `0.3`, and then using 16-neuron and 8-neuron hidden layers. Both networks used ReLU activation in hidden layers and sigmoid activation in the output layer because the task is binary classification.

Neural network performance comparison:

| Model | Architecture Change | Final Accuracy | Final Precision | Final Recall | Final F1-score | Final ROC-AUC | Cross-validation F1 Mean |
|---|---|---:|---:|---:|---:|---:|---:|
| Neural Network Architecture 1 | Smaller baseline: `16 -> 8 -> output`, no dropout | 0.7869 | 0.8125 | 0.7879 | 0.8000 | 0.8615 | 0.8512 |
| Neural Network Architecture 2 | Larger model: `32 -> Dropout(0.3) -> 16 -> 8 -> output` | 0.7705 | 0.7714 | 0.8182 | 0.7941 | 0.8517 | 0.8361 |

Architecture 2 found slightly more positive cases on the final test set, shown by higher recall (`0.8182` vs `0.7879`). However, Architecture 1 had better accuracy, precision, F1-score and ROC-AUC. This suggests the larger model and dropout did not provide a clear advantage on the cleaned tabular dataset. The dataset is relatively small for deep learning, so the simpler Architecture 1 generalized slightly better while the larger Architecture 2 produced more false positives.

## Hyperparameter Tuning Summary

Classical machine learning models were tuned using `GridSearchCV` with 5-fold cross-validation and F1-score as the optimization metric.

Best hyperparameters and final test metrics from `ml/results/final_model_results.csv` were:

| Model | Best Parameters | Accuracy | Precision | Recall | F1-score | ROC-AUC |
|---|---|---:|---:|---:|---:|---:|
| Logistic Regression with Feature Selection | `C=0.01`, `solver=liblinear` | 0.8033 | 0.8182 | 0.8182 | 0.8182 | 0.8820 |
| Logistic Regression | `C=0.01`, `solver=lbfgs` | 0.8033 | 0.7838 | 0.8788 | 0.8286 | 0.8810 |
| KNN | `n_neighbors=9`, `weights=uniform` | 0.8033 | 0.7838 | 0.8788 | 0.8286 | 0.8626 |
| Random Forest | `criterion=entropy`, `max_depth=3`, `n_estimators=200` | 0.8033 | 0.8000 | 0.8485 | 0.8235 | 0.8755 |
| KNN with Feature Selection | `n_neighbors=9`, `weights=uniform` | 0.8033 | 0.8000 | 0.8485 | 0.8235 | 0.8626 |
| Random Forest with Feature Selection | `criterion=entropy`, `max_depth=3`, `n_estimators=50` | 0.7869 | 0.7778 | 0.8485 | 0.8116 | 0.8680 |
| Decision Tree | `criterion=entropy`, `max_depth=3` | 0.7705 | 0.7436 | 0.8788 | 0.8056 | 0.8306 |
| Neural Network Architecture 1 | `16 -> 8 -> output` | 0.7869 | 0.8125 | 0.7879 | 0.8000 | 0.8615 |
| Neural Network Architecture 2 | `32 -> Dropout -> 16 -> 8 -> output` | 0.7705 | 0.7714 | 0.8182 | 0.7941 | 0.8517 |
| Decision Tree with Feature Selection | `criterion=entropy`, `max_depth=3` | 0.7541 | 0.7647 | 0.7879 | 0.7761 | 0.7900 |

No final model achieved perfect 1.0 test metrics. Earlier exported perfect scores were treated as outdated and replaced with the final train-test evaluation values above.

The tuning process helped compare models fairly and reduced the risk of selecting a weak configuration by chance.

## Classifier Evaluation Discussion

### Logistic Regression

Logistic Regression was one of the strongest all-feature models, with F1-score `0.8286` and ROC-AUC `0.8810`. Its main strength is interpretability: coefficients can be used to explain which features increase or decrease predicted risk. It trained quickly and remained stable in cross-validation with F1 mean `0.8539`. Its weakness is that it uses a mostly linear decision boundary, so it may miss complex interactions. There is little evidence of severe overfitting because regularization was selected during tuning, but the model can underfit if the true relationships are highly non-linear.

### Logistic Regression with Feature Selection

Logistic Regression with Feature Selection achieved accuracy `0.8033`, precision `0.8182`, recall `0.8182`, F1-score `0.8182` and ROC-AUC `0.8820`. It produced the highest ROC-AUC in the final comparison and improved precision compared with the all-feature Logistic Regression model, but it reduced recall and slightly reduced F1-score. Its main weakness is that the selected feature set must be revalidated if the dataset changes. This result shows that feature selection improved ranking quality and precision for Logistic Regression, but the full feature set preserved better recall.

### Decision Tree

The Decision Tree was easy to interpret and achieved high recall (`0.8788`), but its precision (`0.7436`) and F1-score (`0.8056`) were lower than Logistic Regression, KNN and Random Forest. GridSearchCV selected a shallow tree with `max_depth=3`, which reduces overfitting risk but can also underfit because the tree cannot create many detailed split rules. It performed worse than Random Forest because a single tree is sensitive to individual split choices, while an ensemble averages many trees.

### Decision Tree with Feature Selection

Decision Tree with Feature Selection remained interpretable but had the weakest final F1-score (`0.7761`). Its lower recall (`0.7879`) shows that feature selection removed information this tree needed for useful splits. The result suggests underfitting: fewer features plus a shallow tree limited the model's ability to separate the classes. This is a useful finding because it shows feature selection does not help every model family.

### KNN

KNN matched full Logistic Regression on final F1-score (`0.8286`) and recall (`0.8788`). Its strength is that it can capture local non-linear patterns by comparing similar patients. Its weaknesses are lower interpretability, dependence on scaling and potentially slower prediction on larger datasets. GridSearchCV selected `n_neighbors=9` with `uniform` weights, which smooths predictions and reduces overfitting compared with very small `k`. KNN performed competitively, but it is less explainable and less convenient for HealthGuard deployment than Logistic Regression.

### KNN with Feature Selection

KNN with Feature Selection tied for the best final F1-score (`0.8235`) and had the strongest cross-validation F1 mean (`0.8716`) with low F1 standard deviation. This suggests stable behavior across folds, likely because feature selection improved distance quality by removing less useful dimensions. However, it did not beat all-feature Logistic Regression on the final held-out test split and remains harder to explain to users.

### Random Forest

Random Forest achieved final precision `0.7500`, recall `0.8182`, F1-score `0.7826` and ROC-AUC `0.8766`. It can model non-linear feature interactions better than Logistic Regression and performed better than a single Decision Tree on ROC-AUC, but it did not match the leading F1-score models. GridSearchCV selected `n_estimators=50`, `criterion=entropy` and `max_depth=3`. The shallow depth limits overfitting but may also limit model capacity, suggesting the dataset is small enough that extra ensemble complexity is not clearly beneficial.

### Random Forest with Feature Selection

Random Forest with Feature Selection had strong cross-validation F1 mean (`0.8661`) but a lower final test F1-score (`0.8116`) than the full Random Forest. The reduced feature set may have removed variables useful for tree splits. There is no evidence of unrealistic perfect-score overfitting, but the final result suggests some loss of useful split diversity or mild underfitting.

### Neural Network Architecture 1

Neural Network Architecture 1 used two hidden layers (`16 -> 8`) and achieved F1-score `0.8000`. Its strength is the ability to model non-linear relationships, and its precision (`0.8125`) was reasonable. Its weakness is that it did not outperform the best classical models, likely because the cleaned dataset is small for neural-network training. Cross-validation F1 mean was `0.8512`, but variation was higher than the most stable feature-selected models.

### Neural Network Architecture 2

Neural Network Architecture 2 used `32 -> Dropout -> 16 -> 8 -> output`. Dropout added regularization, but the final F1-score (`0.7941`) was lower than Architecture 1 and the main classical models. The added complexity did not improve performance on this tabular dataset. The result suggests the model may be too complex, too regularized or too data-limited for the available cleaned records.

## Final HealthGuard Model Recommendation

The recommended model for HealthGuard is **Logistic Regression**. It tied for the best final F1-score (`0.8235`) with KNN with Feature Selection and Neural Network Architecture 2, while also keeping strong recall (`0.8485`) and the highest ROC-AUC among those F1-score leaders (`0.8712`). The highest-recall model was the Decision Tree (`0.8788`), but it had lower precision (`0.7436`) and a lower F1-score (`0.8056`), meaning it found one more heart-disease case at the cost of more false positives.

This matters for HealthGuard because recall is important in heart disease prediction: a false negative can miss a patient who may need further medical attention. Precision still matters because too many false positives can create unnecessary stress and follow-up workload. Logistic Regression provides the strongest overall balance for the platform because it combines top F1-score, strong recall, good ranking quality, fast inference and clear interpretability. It should be used as the production baseline, with recall monitored over time and the classification threshold revisited if future validation shows false negatives are too costly.

## Feature Selection Summary

Feature selection was studied in multiple ways:

- `SelectKBest` with ANOVA F-test was used in the original feature-selection experiment.
- A separate comparison study used `SelectKBest` with Mutual Information.
- Model performance was compared using all 13 features, the Top 10 features and the Top 5 features.

The Top 10 Mutual Information features were:

`cp`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`

The features removed in the Top 10 setup were:

`age`, `sex`, `trestbps`

The Top 5 Mutual Information features were:

`cp`, `exang`, `oldpeak`, `ca`, `thal`

The features removed in the Top 5 setup were:

`age`, `sex`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `slope`

Feature reduction did not improve all models equally. Logistic Regression improved slightly with the selected 8-feature set in the final train-test comparison, while Decision Tree and Random Forest lost some performance. KNN stayed close to its all-feature result. This shows that feature reduction can help interpretability, but it must be validated with metrics instead of assumed to improve every model.

The feature importance analysis also showed that the most influential features included:

`cp`, `thalach`, `ca`, `thal`, `exang`, `oldpeak`, `sex`, `slope`, `age`, `chol`

These features are clinically meaningful because they describe chest pain, exercise response, heart rate behavior and diagnostic indicators.

## Explainable AI Summary

Explainable AI was added so the HealthGuard prediction workflow can be discussed in terms of both model performance and model reasoning. The main interpretability files are:

- `ml/results/feature_importance.csv`: full feature ranking using normalized Logistic Regression coefficient strength and Random Forest importance.
- `ml/results/top_predictive_health_indicators.csv`: student-friendly Top 10 table with feature names, health-indicator meanings and short interpretations.
- `ml/results/shap_interpretation_summary.csv`: SHAP-style direction summary for Logistic Regression feature contributions.
- `ml/results/plots/feature_importance.png`: Top 10 combined feature-importance chart.
- `ml/results/plots/shap_summary.png`: global explainability chart based on permutation importance.
- `ml/results/plots/shap_patient_example.png`: local high-risk and low-risk patient explanation examples.

Top predictive health indicators:

| Rank | Feature | Health Indicator | Model Interpretation |
|---:|---|---|---|
| 1 | `cp` | Chest pain type | Strongest combined signal; symptom pattern was highly informative for the model. |
| 2 | `thalach` | Maximum heart rate achieved | Exercise heart-rate response helped separate patient risk profiles. |
| 3 | `ca` | Number of major vessels colored by fluoroscopy | Important diagnostic indicator; direction depends on the dataset encoding. |
| 4 | `thal` | Thalassemia result | Strong diagnostic feature in both Logistic Regression and Random Forest. |
| 5 | `exang` | Exercise-induced angina | Clear exercise-response signal for the trained models. |
| 6 | `oldpeak` | ST depression induced by exercise | Captures cardiac stress response during exercise. |
| 7 | `sex` | Patient sex | Demographic context used by the model; should be interpreted carefully. |
| 8 | `slope` | Slope of peak exercise ST segment | Adds ECG exercise-pattern information. |
| 9 | `age` | Patient age | Present in the Top 10 but weaker than the strongest clinical indicators. |
| 10 | `chol` | Serum cholesterol | Useful but less influential than chest-pain, exercise and diagnostic indicators. |

The SHAP-style explanation uses Logistic Regression contribution values: each standardized feature value is multiplied by the learned coefficient. Positive contributions push the prediction toward higher modeled heart-disease risk, while negative contributions push it toward lower modeled risk. For categorical fields such as `cp`, `ca`, `thal`, `exang` and `slope`, the direction follows the numeric encoding in `heart.csv`, so these results should be explained as model behavior rather than direct medical causation.

The local patient explanation plot shows one high-risk and one low-risk example. Red bars represent features that increased the predicted risk score, while blue bars represent features that lowered it. This helps HealthGuard explain why a prediction was made instead of only showing a final class label.

These XAI outputs support the HealthGuard platform by making the final recommendation more transparent. They can be used in the admin results page, project report and presentation defense to explain which health indicators most influenced model predictions.

## Clustering Results

K-Means clustering was performed as an unsupervised analysis step. The `target` class label was removed before clustering, so K-Means grouped patients only from the scaled clinical feature values. The true labels were used afterward only for interpretation.

K-Means clustering was evaluated for `k` values from 2 to 10.

The best cluster count was selected using Silhouette Score:

- Best `k`: 2
- Silhouette Score: 0.1683
- Adjusted Rand Index: 0.4110
- Normalized Mutual Information: 0.3502

The Elbow Method was used to inspect how inertia changed as more clusters were added, and the Silhouette Score was used to choose the best-separated cluster count. PCA was used to visualize the selected K-Means clusters in two dimensions and compare them with the true class labels on the same projected feature space.

The clustering plots are saved under `ml/results/plots`:

- `elbow_method.png`
- `silhouette_scores.png`
- `kmeans_pca_clusters.png`

The clustering results show that unsupervised learning was able to capture some structure related to the true heart disease labels, but the match was not perfect. This is expected because K-Means does not use the target labels during training and only groups patients based on feature similarity.

In practical terms, the clusters represent broad patient profiles with similar clinical measurements, such as chest pain type, exercise response, ST depression, maximum heart rate, major vessel count and thalassemia values. They are useful for understanding the shape of the dataset, but they are not a replacement for the supervised classifiers and should not be interpreted as medical diagnoses.

## Best Model and Why It Performed Best

The best model in the final train-test comparison was:

**Logistic Regression**

Final test metrics:

- Accuracy: 0.8033
- Precision: 0.8000
- Recall: 0.8485
- F1-score: 0.8235
- ROC-AUC: 0.8712

This model performed best by F1-score, which is important because F1-score balances precision and recall. In a heart disease prediction task, both types of error matter:

- A false negative may miss a patient who is actually at risk.
- A false positive may incorrectly flag a patient as high risk.

Logistic Regression performed well because the scaled heart-disease features contain strong linear risk patterns. Regularization selected during tuning helped preserve generalization, and the full feature set kept enough signal to maintain recall. It also had the strongest ROC-AUC among the models tied for best F1-score, meaning it ranked high-risk and low-risk patients well across probability thresholds.

Cross-validation results also showed that several models were stable across folds. The strongest cross-validation F1-score mean was achieved by KNN with Feature Selection, followed by Random Forest with Feature Selection and Logistic Regression with Feature Selection. This supports the conclusion that feature-selected models were competitive and stable, even when evaluated across multiple validation splits.

## Final Conclusion for Presentation and Defense

The HealthGuard ML project demonstrates a complete machine learning workflow for heart disease risk prediction. The project includes data exploration, preprocessing, supervised classification, neural network experimentation, hyperparameter tuning, feature selection, clustering, cross-validation, ROC analysis, learning curves and explainability.

The dataset was cleaned by removing duplicates and verified to have no missing values. Multiple models were trained and compared using appropriate classification metrics. Logistic Regression tied for the best final F1-score and provided the strongest practical balance of recall, ROC-AUC, interpretability and deployment simplicity, making it the strongest final candidate for this project.

The project also shows that reducing features can be useful, but it must be evaluated carefully. Some models improved or stayed stable with fewer features, while others lost performance. This demonstrates an important machine learning principle: simpler models are not always worse, but feature reduction should be validated using metrics and not assumed to be beneficial.

The clustering section provided an unsupervised perspective on the same patient data. Although K-Means did not perfectly reproduce the target labels, the ARI and NMI scores showed that there was some meaningful structure in the feature space.

For explainability, global feature importance and local patient-level explanations were generated. These outputs help explain why the model classifies a patient as higher or lower risk and make the system easier to defend in a university presentation.

Overall, HealthGuard successfully applies machine learning to support heart disease risk prediction and presents the results in a transparent, reproducible and interpretable way.
