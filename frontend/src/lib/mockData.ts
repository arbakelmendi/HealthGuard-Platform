// Extended mock data for the full HealthGuard platform

export const riskOverTimeData = [
  { month: "Jan", risk: 35, activity: 72 },
  { month: "Feb", risk: 38, activity: 68 },
  { month: "Mar", risk: 42, activity: 60 },
  { month: "Apr", risk: 39, activity: 65 },
  { month: "May", risk: 48, activity: 55 },
  { month: "Jun", risk: 52, activity: 50 },
  { month: "Jul", risk: 45, activity: 58 },
];

export const healthTrendsData = [
  { week: "W1", bmi: 26.2, sleep: 6.5, stress: 4 },
  { week: "W2", bmi: 26.0, sleep: 7.0, stress: 3 },
  { week: "W3", bmi: 25.8, sleep: 6.8, stress: 5 },
  { week: "W4", bmi: 25.5, sleep: 7.2, stress: 3 },
  { week: "W5", bmi: 25.3, sleep: 7.5, stress: 2 },
  { week: "W6", bmi: 25.1, sleep: 7.0, stress: 4 },
];

export const predictionHistoryData = [
  { id: 1, date: "2026-04-07", riskLevel: "Medium", score: 52, factors: "BMI, Low Activity" },
  { id: 2, date: "2026-03-28", riskLevel: "Medium", score: 48, factors: "Sleep, Stress" },
  { id: 3, date: "2026-03-15", riskLevel: "Low", score: 35, factors: "Diet" },
  { id: 4, date: "2026-03-01", riskLevel: "High", score: 72, factors: "BMI, Inactivity, Stress" },
  { id: 5, date: "2026-02-14", riskLevel: "Low", score: 28, factors: "None significant" },
];

export const symptomHistoryData = [
  { id: 1, date: "2026-04-06", symptom: "Headache", severity: "Moderate", duration: "3 hours" },
  { id: 2, date: "2026-04-04", symptom: "Fatigue", severity: "Mild", duration: "All day" },
  { id: 3, date: "2026-04-01", symptom: "Back Pain", severity: "Severe", duration: "2 days" },
  { id: 4, date: "2026-03-28", symptom: "Insomnia", severity: "Moderate", duration: "Ongoing" },
  { id: 5, date: "2026-03-25", symptom: "Shortness of Breath", severity: "Mild", duration: "30 min" },
];

export const notificationsData = [
  { id: 1, title: "Risk Level Increased", message: "Your risk score has increased to 52%. Consider reviewing your activity levels.", time: "2 hours ago", type: "warning" as const, read: false },
  { id: 2, title: "New Recommendation", message: "Based on your recent data, we suggest increasing daily water intake.", time: "5 hours ago", type: "info" as const, read: false },
  { id: 3, title: "Weekly Report Ready", message: "Your weekly health report is now available for download.", time: "1 day ago", type: "success" as const, read: false },
  { id: 4, title: "Symptom Alert", message: "You've logged recurring headaches. Consider consulting a physician.", time: "2 days ago", type: "warning" as const, read: true },
  { id: 5, title: "Profile Updated", message: "Your health profile has been successfully updated.", time: "3 days ago", type: "info" as const, read: true },
];

export const recommendationsData = [
  { id: 1, title: "Increase Physical Activity", description: "Aim for at least 30 minutes of moderate exercise daily. Start with brisk walking.", category: "Exercise", priority: "High", icon: "🏃" },
  { id: 2, title: "Reduce Sugar Intake", description: "Limit added sugars to less than 25g per day. Check food labels carefully.", category: "Diet", priority: "High", icon: "🍎" },
  { id: 3, title: "Improve Sleep Quality", description: "Maintain a consistent sleep schedule. Aim for 7-8 hours per night.", category: "Sleep", priority: "Medium", icon: "😴" },
  { id: 4, title: "Stay Hydrated", description: "Drink at least 2 liters of water daily. Set reminders if needed.", category: "Hydration", priority: "Medium", icon: "💧" },
  { id: 5, title: "Stress Management", description: "Practice mindfulness or meditation for 10 minutes daily.", category: "Mental Health", priority: "Low", icon: "🧘" },
  { id: 6, title: "Regular Health Checkups", description: "Schedule a comprehensive health checkup every 6 months.", category: "Prevention", priority: "Medium", icon: "🏥" },
];

export const adminUsersData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "User", status: "Active", lastActive: "2 hours ago", predictions: 12, joinedDate: "2025-08-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Admin", status: "Active", lastActive: "5 min ago", predictions: 45, joinedDate: "2025-06-01" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "User", status: "Inactive", lastActive: "2 weeks ago", predictions: 3, joinedDate: "2025-10-20" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "User", status: "Active", lastActive: "1 day ago", predictions: 28, joinedDate: "2025-09-05" },
  { id: 5, name: "Alex Turner", email: "alex@example.com", role: "User", status: "Active", lastActive: "3 hours ago", predictions: 17, joinedDate: "2025-11-12" },
  { id: 6, name: "Emily Davis", email: "emily@example.com", role: "User", status: "Active", lastActive: "30 min ago", predictions: 22, joinedDate: "2025-07-30" },
  { id: 7, name: "Robert Brown", email: "robert@example.com", role: "User", status: "Inactive", lastActive: "1 month ago", predictions: 5, joinedDate: "2026-01-10" },
  { id: 8, name: "Lisa Martinez", email: "lisa@example.com", role: "User", status: "Active", lastActive: "6 hours ago", predictions: 31, joinedDate: "2025-12-01" },
];

export const aiInsights = [
  { text: "Your risk has increased 8% due to declining physical activity over the past 3 weeks.", type: "warning" as const },
  { text: "Sleep quality improved by 15% this month. Keep maintaining your bedtime routine.", type: "success" as const },
  { text: "BMI trending downward — you're on track to reach your target weight by June.", type: "success" as const },
  { text: "Stress indicators are elevated. Consider the recommended mindfulness exercises.", type: "info" as const },
];

// Admin Prediction Records
export const allPredictionRecords = [
  { id: 1, userName: "John Doe", date: "2026-04-07", riskLevel: "Medium", score: 52, model: "Random Forest v2.1", status: "Completed" },
  { id: 2, userName: "Sarah Wilson", date: "2026-04-07", riskLevel: "High", score: 78, model: "Neural Network v1.3", status: "Completed" },
  { id: 3, userName: "Alex Turner", date: "2026-04-06", riskLevel: "Low", score: 22, model: "Random Forest v2.1", status: "Completed" },
  { id: 4, userName: "Emily Davis", date: "2026-04-06", riskLevel: "Medium", score: 55, model: "Logistic Regression v3.0", status: "Completed" },
  { id: 5, userName: "Lisa Martinez", date: "2026-04-05", riskLevel: "Low", score: 18, model: "Random Forest v2.1", status: "Completed" },
  { id: 6, userName: "John Doe", date: "2026-04-04", riskLevel: "High", score: 72, model: "Neural Network v1.3", status: "Completed" },
  { id: 7, userName: "Mike Johnson", date: "2026-04-03", riskLevel: "Medium", score: 44, model: "XGBoost v1.0", status: "Completed" },
  { id: 8, userName: "Robert Brown", date: "2026-04-02", riskLevel: "Low", score: 31, model: "Logistic Regression v3.0", status: "Completed" },
];

// Datasets
export const datasetsData = [
  { id: 1, name: "Heart Disease UCI", type: "Classification", records: 303, uploadDate: "2026-01-15", source: "UCI Repository", status: "Active" },
  { id: 2, name: "Diabetes Pima Indians", type: "Classification", records: 768, uploadDate: "2026-01-20", source: "Kaggle", status: "Active" },
  { id: 3, name: "Blood Pressure Monitoring", type: "Regression", records: 12450, uploadDate: "2026-02-05", source: "Internal", status: "Active" },
  { id: 4, name: "Patient Clustering Set", type: "Clustering", records: 5200, uploadDate: "2026-02-18", source: "Hospital Partner", status: "Active" },
  { id: 5, name: "Lifestyle Survey 2025", type: "Classification", records: 8900, uploadDate: "2026-03-01", source: "Survey", status: "Processing" },
  { id: 6, name: "Symptom-Disease Mapping", type: "Classification", records: 1500, uploadDate: "2025-12-10", source: "Research", status: "Archived" },
];

// ML Models
export const mlModelsData = {
  classification: [
    { id: 1, name: "Logistic Regression", version: "v3.0", status: "Active", lastTrained: "2026-03-20", accuracy: 0.87, precision: 0.85, recall: 0.89, f1: 0.87, dataset: "Heart Disease UCI" },
    { id: 2, name: "K-Nearest Neighbors", version: "v1.2", status: "Active", lastTrained: "2026-03-18", accuracy: 0.82, precision: 0.80, recall: 0.84, f1: 0.82, dataset: "Diabetes Pima Indians" },
    { id: 3, name: "Random Forest", version: "v2.1", status: "Active", lastTrained: "2026-04-01", accuracy: 0.91, precision: 0.90, recall: 0.92, f1: 0.91, dataset: "Heart Disease UCI" },
    { id: 4, name: "Neural Network", version: "v1.3", status: "Active", lastTrained: "2026-03-25", accuracy: 0.93, precision: 0.92, recall: 0.94, f1: 0.93, dataset: "Diabetes Pima Indians" },
  ],
  regression: [
    { id: 5, name: "Linear Regression", version: "v2.0", status: "Active", lastTrained: "2026-03-15", rmse: 4.2, mae: 3.1, r2: 0.85, dataset: "Blood Pressure Monitoring" },
    { id: 6, name: "Random Forest Regressor", version: "v1.5", status: "Active", lastTrained: "2026-03-22", rmse: 3.5, mae: 2.6, r2: 0.89, dataset: "Blood Pressure Monitoring" },
    { id: 7, name: "XGBoost Regressor", version: "v1.0", status: "Training", lastTrained: "2026-04-05", rmse: 3.1, mae: 2.3, r2: 0.92, dataset: "Blood Pressure Monitoring" },
  ],
  clustering: [
    { id: 8, name: "K-Means", version: "v2.0", status: "Active", lastTrained: "2026-02-28", silhouette: 0.72, clusters: 4, dataset: "Patient Clustering Set" },
    { id: 9, name: "Hierarchical Clustering", version: "v1.1", status: "Active", lastTrained: "2026-03-05", silhouette: 0.68, clusters: 5, dataset: "Patient Clustering Set" },
    { id: 10, name: "DBSCAN", version: "v1.0", status: "Inactive", lastTrained: "2026-01-20", silhouette: 0.65, clusters: 3, dataset: "Patient Clustering Set" },
  ],
};

// Feature importance data
export const featureImportanceData = [
  { feature: "BMI", importance: 0.23, selected: true },
  { feature: "Age", importance: 0.18, selected: true },
  { feature: "Blood Pressure", importance: 0.15, selected: true },
  { feature: "Physical Activity", importance: 0.12, selected: true },
  { feature: "Sleep Hours", importance: 0.09, selected: true },
  { feature: "Stress Level", importance: 0.08, selected: true },
  { feature: "Smoking", importance: 0.06, selected: true },
  { feature: "Diet Score", importance: 0.05, selected: true },
  { feature: "Family History", importance: 0.03, selected: false },
  { feature: "Alcohol", importance: 0.01, selected: false },
];

// Correlation matrix data
export const correlationData = [
  { x: "BMI", y: "Blood Pressure", value: 0.72 },
  { x: "BMI", y: "Age", value: 0.45 },
  { x: "BMI", y: "Activity", value: -0.68 },
  { x: "BMI", y: "Sleep", value: -0.32 },
  { x: "Blood Pressure", y: "Age", value: 0.58 },
  { x: "Blood Pressure", y: "Activity", value: -0.42 },
  { x: "Blood Pressure", y: "Stress", value: 0.61 },
  { x: "Age", y: "Activity", value: -0.35 },
  { x: "Activity", y: "Sleep", value: 0.48 },
  { x: "Sleep", y: "Stress", value: -0.55 },
];

// Model tuning history
export const tuningHistoryData = [
  { id: 1, model: "Random Forest", date: "2026-04-01", params: "n_estimators=200, max_depth=10", beforeAccuracy: 0.88, afterAccuracy: 0.91, improvement: "+3.4%" },
  { id: 2, model: "Neural Network", date: "2026-03-25", params: "layers=[64,32], lr=0.001", beforeAccuracy: 0.90, afterAccuracy: 0.93, improvement: "+3.3%" },
  { id: 3, model: "Logistic Regression", date: "2026-03-20", params: "C=0.5, penalty=l2", beforeAccuracy: 0.84, afterAccuracy: 0.87, improvement: "+3.6%" },
  { id: 4, model: "XGBoost Regressor", date: "2026-04-05", params: "n_estimators=300, lr=0.05", beforeAccuracy: 0.89, afterAccuracy: 0.92, improvement: "+3.4%" },
];

// Classification report data
export const confusionMatrixData = {
  truePositive: 142,
  falsePositive: 18,
  trueNegative: 128,
  falseNegative: 12,
};

// Regression report data
export const predVsActualData = [
  { actual: 120, predicted: 118 }, { actual: 135, predicted: 138 }, { actual: 140, predicted: 137 },
  { actual: 110, predicted: 112 }, { actual: 155, predicted: 150 }, { actual: 128, predicted: 130 },
  { actual: 145, predicted: 148 }, { actual: 132, predicted: 129 }, { actual: 118, predicted: 120 },
  { actual: 160, predicted: 155 }, { actual: 125, predicted: 127 }, { actual: 142, predicted: 140 },
];

// Risk distribution data
export const riskDistributionData = [
  { level: "Low", count: 456, percentage: 36.5 },
  { level: "Medium", count: 512, percentage: 41.0 },
  { level: "High", count: 279, percentage: 22.5 },
];

// Model usage trends
export const modelUsageTrendsData = [
  { month: "Jan", randomForest: 120, neuralNetwork: 85, logistic: 45, xgboost: 30 },
  { month: "Feb", randomForest: 135, neuralNetwork: 92, logistic: 52, xgboost: 38 },
  { month: "Mar", randomForest: 148, neuralNetwork: 110, logistic: 48, xgboost: 55 },
  { month: "Apr", randomForest: 162, neuralNetwork: 125, logistic: 42, xgboost: 72 },
];
