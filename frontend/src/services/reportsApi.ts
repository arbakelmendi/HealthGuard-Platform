import api from "@/lib/api";

export type ReportFormat = "json" | "csv" | "excel";

export type ReportsSummary = {
  predictionCount: number;
  healthRecordCount: number;
  generatedReportCount: number;
  averageRiskScore: number;
  lastPredictionAt: string | null;
};

export type ClassificationModel = {
  modelName: string;
  datasetName: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  confusionMatrix: number[][] | null;
  trainingDate: string | null;
  status: string;
};

export type ClassificationReport = {
  models: ClassificationModel[];
  bestModel: ClassificationModel | null;
};

export type RiskDistributionItem = {
  level: string;
  count: number;
  percentage: number;
};

export type FeatureImportanceItem = {
  feature: string;
  importance: number;
};

export type AnalysisReport = {
  riskDistribution: RiskDistributionItem[];
  featureImportance: FeatureImportanceItem[];
  modelUsageTrends: Array<Record<string, string | number>>;
};

export type PredictionHistoryItem = {
  predictionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  date: string;
  riskLevel: string;
  riskScore: number;
  contributingFactors: string[];
  modelName: string;
};

export type GenerateReportRequest = {
  from: string;
  to: string;
  reportType: string;
  format: ReportFormat;
};

export type GeneratedReport = {
  id: number;
  title: string;
  reportType: string;
  fromDate: string;
  toDate: string;
  resultJson: string;
  createdAt: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function filenameFromDisposition(disposition: string | undefined, fallback: string) {
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? fallback;
}

export const reportsApi = {
  async getSummary() {
    const { data } = await api.get<ReportsSummary>("/reports/summary");
    return data;
  },

  async getClassification() {
    const { data } = await api.get<ClassificationReport>("/reports/classification");
    return data;
  },

  async getAnalysis() {
    const { data } = await api.get<AnalysisReport>("/reports/analysis");
    return data;
  },

  async getHistory() {
    const { data } = await api.get<PredictionHistoryItem[]>("/reports/history");
    return data;
  },

  async generate(request: GenerateReportRequest) {
    const { data } = await api.post<GeneratedReport>("/reports/generate", request);
    return data;
  },

  async exportAll(format: ReportFormat, predictionId?: number) {
    const response = await api.get<Blob>("/reports/export", {
      params: { format, predictionId },
      responseType: "blob",
    });
    downloadBlob(response.data, filenameFromDisposition(response.headers["content-disposition"], `healthguard-reports.${format === "excel" ? "xls" : format}`));
  },

  async exportGenerated(reportId: number, format: ReportFormat) {
    const response = await api.get<Blob>(`/reports/${reportId}/export`, {
      params: { format },
      responseType: "blob",
    });
    downloadBlob(response.data, filenameFromDisposition(response.headers["content-disposition"], `healthguard-report-${reportId}.${format === "excel" ? "xls" : format}`));
  },
};
