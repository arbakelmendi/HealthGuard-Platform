import api from "@/lib/api";

export type DatasetType = "Classification" | "Clustering";
export type DatasetStatus = "Active" | "Processing" | "Archived";

export type DatasetRecord = {
  id: number;
  name: string;
  type: DatasetType;
  records: number;
  source: string;
  fileName: string;
  filePath: string;
  status: DatasetStatus;
  uploadedByUserId?: number | null;
  uploadedByName: string;
  uploadedByEmail: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
};

export type DatasetListResponse = {
  items: DatasetRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type DatasetQuery = {
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  pageSize?: number;
};

export type UploadDatasetPayload = {
  name: string;
  type: DatasetType;
  source?: string;
  status: "Active" | "Processing";
  file: File;
};

function toFormData(payload: UploadDatasetPayload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("type", payload.type);
  formData.append("source", payload.source ?? "");
  formData.append("status", payload.status);
  formData.append("file", payload.file);
  return formData;
}

export const datasetsApi = {
  async list(query: DatasetQuery = {}) {
    const { data } = await api.get<DatasetListResponse>("/admin/datasets", { params: query });
    return data;
  },

  async get(id: number) {
    const { data } = await api.get<DatasetRecord>(`/admin/datasets/${id}`);
    return data;
  },

  async upload(payload: UploadDatasetPayload) {
    const { data } = await api.post<DatasetRecord>("/admin/datasets/upload", toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async replace(id: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<DatasetRecord>(`/admin/datasets/${id}/replace`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async archive(id: number) {
    const { data } = await api.post<DatasetRecord>(`/admin/datasets/${id}/archive`);
    return data;
  },
};
