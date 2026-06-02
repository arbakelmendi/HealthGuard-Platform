import api from "@/lib/api";

export type ClassificationModelSummary = {
  id: string;
  modelName: string;
  modelType: string;
  datasetName: string;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1Score?: number | null;
  confusionMatrix?: number[][] | null;
  bestHyperparameters?: Record<string, unknown> | null;
  trainingDate?: string | null;
  status: string;
};

export type ClusteringModelSummary = {
  id: string;
  modelName: string;
  modelType: string;
  datasetName: string;
  algorithmName?: string | null;
  numberOfClusters?: number | null;
  silhouetteScore?: number | null;
  pcaVisualization?: Record<string, unknown> | null;
  labelComparison?: Record<string, unknown> | null;
  bestHyperparameters?: Record<string, unknown> | null;
  trainingDate?: string | null;
  status: string;
};

export type ModelSummaryResponse = {
  classification: ClassificationModelSummary[];
  clustering: ClusteringModelSummary[];
};

export const modelSummaryApi = {
  async get() {
    const response = await api.get<ModelSummaryResponse>("/admin/model-summary");
    return response.data;
  },
};
