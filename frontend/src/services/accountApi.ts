import api from "@/lib/api";
import type { AuthResponse, UpdateProfileRequest } from "@/types/auth";

export type UserSettingsResponse = {
  id: number;
  userId: number;
  riskLevelAlerts: boolean;
  weeklyReports: boolean;
  aiRecommendations: boolean;
  systemUpdates: boolean;
  healthRecordReminders: boolean;
  predictionCompletedAlerts: boolean;
  recommendationProgressAlerts: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserSettingsRequest = Omit<UserSettingsResponse, "id" | "userId" | "createdAt" | "updatedAt">;

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export const defaultUserSettings: UpdateUserSettingsRequest = {
  riskLevelAlerts: true,
  weeklyReports: true,
  aiRecommendations: true,
  systemUpdates: true,
  healthRecordReminders: true,
  predictionCompletedAlerts: true,
  recommendationProgressAlerts: true,
};

type RawUserSettings = Partial<UserSettingsResponse> & {
  Id?: number;
  UserId?: number;
  RiskLevelAlerts?: boolean;
  WeeklyReports?: boolean;
  AiRecommendations?: boolean;
  SystemUpdates?: boolean;
  HealthRecordReminders?: boolean;
  PredictionCompletedAlerts?: boolean;
  RecommendationProgressAlerts?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
};

export const normalizeUserSettings = (raw: RawUserSettings): UserSettingsResponse => ({
  id: raw.id ?? raw.Id ?? 0,
  userId: raw.userId ?? raw.UserId ?? 0,
  riskLevelAlerts: raw.riskLevelAlerts ?? raw.RiskLevelAlerts ?? defaultUserSettings.riskLevelAlerts,
  weeklyReports: raw.weeklyReports ?? raw.WeeklyReports ?? defaultUserSettings.weeklyReports,
  aiRecommendations: raw.aiRecommendations ?? raw.AiRecommendations ?? defaultUserSettings.aiRecommendations,
  systemUpdates: raw.systemUpdates ?? raw.SystemUpdates ?? defaultUserSettings.systemUpdates,
  healthRecordReminders: raw.healthRecordReminders ?? raw.HealthRecordReminders ?? defaultUserSettings.healthRecordReminders,
  predictionCompletedAlerts: raw.predictionCompletedAlerts ?? raw.PredictionCompletedAlerts ?? defaultUserSettings.predictionCompletedAlerts,
  recommendationProgressAlerts: raw.recommendationProgressAlerts ?? raw.RecommendationProgressAlerts ?? defaultUserSettings.recommendationProgressAlerts,
  createdAt: raw.createdAt ?? raw.CreatedAt ?? new Date().toISOString(),
  updatedAt: raw.updatedAt ?? raw.UpdatedAt ?? new Date().toISOString(),
});

export const accountApi = {
  async getCurrentUserProfile() {
    const response = await api.get<AuthResponse["user"]>("/users/me");
    return response.data;
  },

  async updateCurrentUserProfile(request: UpdateProfileRequest) {
    const response = await api.put<AuthResponse["user"]>("/users/me", {
      ...request,
      firstName: request.firstName?.trim(),
      lastName: request.lastName?.trim(),
      phone: request.phone?.trim() || undefined,
      chronicConditions: request.chronicConditions?.trim() || undefined,
      allergies: request.allergies?.trim() || undefined,
    });
    return response.data;
  },

  async getUserSettings() {
    const response = await api.get<RawUserSettings>("/settings/me");
    return normalizeUserSettings(response.data);
  },

  async updateUserSettings(request: UpdateUserSettingsRequest) {
    const response = await api.put<RawUserSettings>("/settings/me", request);
    return normalizeUserSettings(response.data);
  },

  async changePassword(request: ChangePasswordRequest) {
    const response = await api.put<{ message: string }>("/users/me/password", request);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete<{ message: string }>("/users/me");
    return response.data;
  },
};

export const getCurrentUserProfile = accountApi.getCurrentUserProfile;
export const updateCurrentUserProfile = accountApi.updateCurrentUserProfile;
export const getUserSettings = accountApi.getUserSettings;
export const updateUserSettings = accountApi.updateUserSettings;
export const changePassword = accountApi.changePassword;
export const deleteAccount = accountApi.deleteAccount;
