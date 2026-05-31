import api from "@/lib/api";

export type SymptomSeverity = "Mild" | "Moderate" | "Severe" | "Critical";

export type SymptomLog = {
  id: number;
  userId: number;
  symptom: string;
  severity: SymptomSeverity;
  duration: string;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SymptomLogPayload = {
  symptom: string;
  severity: SymptomSeverity;
  duration: string;
  notes?: string;
};

type RawSymptomLog = SymptomLog & {
  Id?: number;
  UserId?: number;
  Symptom?: string;
  Severity?: SymptomSeverity;
  Duration?: string;
  Notes?: string | null;
  CreatedAt?: string | null;
  UpdatedAt?: string | null;
};

const normalizeSymptomLog = (item: RawSymptomLog): SymptomLog => ({
  id: item.id ?? item.Id ?? 0,
  userId: item.userId ?? item.UserId ?? 0,
  symptom: item.symptom ?? item.Symptom ?? "",
  severity: item.severity ?? item.Severity ?? "Mild",
  duration: item.duration ?? item.Duration ?? "",
  notes: item.notes ?? item.Notes ?? null,
  createdAt: item.createdAt ?? item.CreatedAt ?? null,
  updatedAt: item.updatedAt ?? item.UpdatedAt ?? null,
});

export const symptomsApi = {
  async getMySymptoms() {
    const response = await api.get<RawSymptomLog[]>("/symptoms/me");
    return response.data.map(normalizeSymptomLog);
  },

  async createSymptomLog(payload: SymptomLogPayload) {
    const response = await api.post<RawSymptomLog>("/symptoms/me", payload);
    return normalizeSymptomLog(response.data);
  },

  async updateSymptomLog(id: number, payload: SymptomLogPayload) {
    const response = await api.put<RawSymptomLog>(`/symptoms/me/${id}`, payload);
    return normalizeSymptomLog(response.data);
  },

  async deleteSymptomLog(id: number) {
    const response = await api.delete<{ message: string }>(`/symptoms/me/${id}`);
    return response.data;
  },
};

export const getMySymptoms = symptomsApi.getMySymptoms;
export const createSymptomLog = symptomsApi.createSymptomLog;
export const updateSymptomLog = symptomsApi.updateSymptomLog;
export const deleteSymptomLog = symptomsApi.deleteSymptomLog;
