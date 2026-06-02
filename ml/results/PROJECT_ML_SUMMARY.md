# HealthGuard Machine Learning Project Summary

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

1. Neural Network Architecture 1
   - Input layer
   - Dense layer with 16 neurons and ReLU activation
   - Dense layer with 8 neurons and ReLU activation
   - Output layer with sigmoid activation

2. Neural Network Architecture 2
   - Input layer
   - Dense layer with 32 neurons and ReLU activation
   - Dropout layer
   - Dense layer with 16 neurons and ReLU activation
   - Dense layer with 8 neurons and ReLU activation
   - Output layer with sigmoid activation

Both neural networks used binary cross-entropy loss and the Adam optimizer.

## Hyperparameter Tuning Summary

Classical machine learning models were tuned using `GridSearchCV` with 5-fold cross-validation and F1-score as the optimization metric.

Best hyperparameters and final test metrics from `ml/results/final_model_results.csv` were:

| Model | Best Parameters | Accuracy | Precision | Recall | F1-score | ROC-AUC |
|---|---|---:|---:|---:|---:|---:|
| Logistic Regression with Feature Selection | `C=0.1`, `solver=lbfgs` | 0.8197 | 0.8235 | 0.8485 | 0.8358 | 0.8799 |
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

## Clustering Results

K-Means clustering was evaluated for `k` values from 2 to 10.

The best cluster count was selected using Silhouette Score:

- Best `k`: 2
- Silhouette Score: 0.1683
- Adjusted Rand Index: 0.4110
- Normalized Mutual Information: 0.3502

The clustering results show that unsupervised learning was able to capture some structure related to the true heart disease labels, but the match was not perfect. This is expected because K-Means does not use the target labels during training and only groups patients based on feature similarity.

## Best Model and Why It Performed Best

The best model in the final train-test comparison was:

**Logistic Regression with Feature Selection**

Final test metrics:

- Accuracy: 0.8197
- Precision: 0.8235
- Recall: 0.8485
- F1-score: 0.8358
- ROC-AUC: 0.8799

This model performed best by F1-score, which is important because F1-score balances precision and recall. In a heart disease prediction task, both types of error matter:

- A false negative may miss a patient who is actually at risk.
- A false positive may incorrectly flag a patient as high risk.

Logistic Regression with Feature Selection performed well because it combined strong predictive performance with a simpler and more interpretable feature set. The model also had a strong ROC-AUC score, meaning it was effective at separating high-risk and low-risk patients across different probability thresholds.

Cross-validation results also showed that several models were stable across folds. The strongest cross-validation F1-score mean was achieved by KNN with Feature Selection, followed by Random Forest with Feature Selection and Logistic Regression with Feature Selection. This supports the conclusion that feature-selected models were competitive and stable, even when evaluated across multiple validation splits.

## Final Conclusion for Presentation and Defense

The HealthGuard ML project demonstrates a complete machine learning workflow for heart disease risk prediction. The project includes data exploration, preprocessing, supervised classification, neural network experimentation, hyperparameter tuning, feature selection, clustering, cross-validation, ROC analysis, learning curves and explainability.

The dataset was cleaned by removing duplicates and verified to have no missing values. Multiple models were trained and compared using appropriate classification metrics. Logistic Regression with Feature Selection achieved the best final F1-score, making it the strongest final candidate for this project because it balances predictive performance, interpretability and reliability.

The project also shows that reducing features can be useful, but it must be evaluated carefully. Some models improved or stayed stable with fewer features, while others lost performance. This demonstrates an important machine learning principle: simpler models are not always worse, but feature reduction should be validated using metrics and not assumed to be beneficial.

The clustering section provided an unsupervised perspective on the same patient data. Although K-Means did not perfectly reproduce the target labels, the ARI and NMI scores showed that there was some meaningful structure in the feature space.

For explainability, global feature importance and local patient-level explanations were generated. These outputs help explain why the model classifies a patient as higher or lower risk and make the system easier to defend in a university presentation.

Overall, HealthGuard successfully applies machine learning to support heart disease risk prediction and presents the results in a transparent, reproducible and interpretable way.
