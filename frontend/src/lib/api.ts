import axios from "axios";
import { authStorage } from "@/lib/auth-storage";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = authStorage.getSession()?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response?.data || error?.message);

    if (error.response?.status === 401) {
      authStorage.clearSession();
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export default api;

export type RiskLevel = "Low" | "Medium" | "High";

export type PredictHealthRiskRequest = {
  userId: number;
  healthRecordId?: number;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  systolicBp?: number;
  diastolicBp?: number;
  bloodSugar?: number;
  cholesterol?: number;
  activityLevel?: string;
  sleepHours?: number;
  stressLevel?: number;
  smokingStatus?: string;
  symptoms?: string;
};

export type HealthRecordPayload = {
  userId?: number;
  age: number;
  gender: string;
  height: number;
  weight: number;
  heightCm: number;
  weightKg: number;
  bloodPressure: string;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  glucose: number;
  bloodSugar: number;
  cholesterol: number;
  activityLevel: string;
  sleepHours: number;
  stressLevel: number;
  smokingStatus: string;
  symptoms: string;
};

export type HealthRecordResponse = HealthRecordPayload & {
  id: number;
  userId: number;
  bmi: number;
  createdAt: string;
};

export type PredictHealthRiskResponse = {
  predictionId: number;
  userId: number;
  healthRecordId?: number | null;
  riskLevel: RiskLevel;
  riskScore: number;
  explanation: string;
  contributingFactors: string[];
  modelName: string;
  createdAt: string;
  healthRecord?: HealthRecordResponse | null;
};

export type AdminPredictionRecordResponse = PredictHealthRiskResponse & {
  userName: string;
  userEmail: string;
};

export const predictionsApi = {
  async predict(request: PredictHealthRiskRequest) {
    const { data } = await api.post<PredictHealthRiskResponse>("/predictions/predict", request);
    return data;
  },

  async getByUser(userId: number) {
    const { data } = await api.get<PredictHealthRiskResponse[]>(`/predictions/user/${userId}`);
    return data;
  },

  async getById(id: number) {
    const { data } = await api.get<PredictHealthRiskResponse>(`/predictions/${id}`);
    return data;
  },

  async getAll() {
    const { data } = await api.get<AdminPredictionRecordResponse[]>("/predictions/admin/all");
    return data;
  },
};

export const healthRecordsApi = {
  async getLatestHealthRecord(userId: number) {
    const { data } = await api.get<HealthRecordResponse>(`/health-records/user/${userId}/latest`);
    return data;
  },

  async getUserHealthRecords(userId: number) {
    const { data } = await api.get<HealthRecordResponse[]>(`/health-records/user/${userId}`);
    return data;
  },

  async saveHealthRecord(payload: HealthRecordPayload) {
    const { data } = await api.post<HealthRecordResponse>("/health-records", payload);
    return data;
  },

  async updateHealthRecord(id: number, payload: HealthRecordPayload) {
    const { data } = await api.put<HealthRecordResponse>(`/health-records/${id}`, payload);
    return data;
  },
};

export const getLatestHealthRecord = healthRecordsApi.getLatestHealthRecord;
export const saveHealthRecord = healthRecordsApi.saveHealthRecord;
export const updateHealthRecord = healthRecordsApi.updateHealthRecord;
export const predictHealthRisk = predictionsApi.predict;
export const getUserPredictions = predictionsApi.getByUser;
