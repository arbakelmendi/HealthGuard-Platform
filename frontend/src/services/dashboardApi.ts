import api from "@/lib/api";

export type DashboardTrendPoint = {
  date: string;
  score: number;
};

export type DashboardInsight = {
  type: "info" | "warning";
  title: string;
  message: string;
};

export type DashboardWellnessItem = {
  date: string;
  title: string;
  description: string;
  tone: "ok" | "warn";
};

export type DashboardPrediction = {
  id: number;
  riskLevel: string;
  riskScore: number;
  explanation: string;
  contributingFactors: string[];
  createdAt: string;
};

export type DashboardSymptom = {
  id: number;
  symptom: string;
  severity: string;
  duration: string;
  createdAt: string;
};

export type DashboardRecommendation = {
  id: number;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
};

export type DashboardNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type DashboardResponse = {
  userName: string;
  currentDate: string;
  healthScore: number | null;
  cardioScore: number | null;
  sleepScore: number | null;
  hydrationScore: number | null;
  stressScore: number | null;
  weeklyTrend: DashboardTrendPoint[];
  aiInsights: DashboardInsight[];
  todayWellness: DashboardWellnessItem[];
  recentPredictions: DashboardPrediction[];
  latestSymptoms: DashboardSymptom[];
  recommendationsSummary: DashboardRecommendation[];
  notificationsCount: number;
  recentNotifications: DashboardNotification[];
};

export const dashboardApi = {
  async getMine() {
    const response = await api.get<DashboardResponse>("/dashboard/me");
    return response.data;
  },
};
