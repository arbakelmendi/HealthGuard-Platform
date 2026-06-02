import axios from "axios";
import { authStorage } from "@/lib/auth-storage";
import type { AuthResponse } from "@/types/auth";

const api = axios.create({
  baseURL: "/api",
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = authStorage.getSession()?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API ERROR:", error?.response?.data || error?.message);

    const originalRequest = error.config;
    const session = authStorage.getSession();

    if (error.response?.status === 401 && session?.refreshToken && !originalRequest?._retry) {
      originalRequest._retry = true;

      refreshPromise ??= axios
        .post<AuthResponse>("/api/auth/refresh", { refreshToken: session.refreshToken })
        .then((response) => {
          authStorage.setSession({
            ...session,
            token: response.data.token,
            refreshToken: response.data.refreshToken,
            expiresAt: response.data.expiresAt,
            refreshTokenExpiresAt: response.data.refreshTokenExpiresAt,
          });
          return response.data.token;
        })
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });

      const nextToken = await refreshPromise;
      if (nextToken) {
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
      }
    }

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
  userName?: string;
  userEmail?: string;
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
