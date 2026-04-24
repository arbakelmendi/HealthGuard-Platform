import api from "@/lib/api";
import { authService } from "@/services/authService";
import type { AdminCreateUserRequest, AdminUpdateUserRequest, AuthUser, BackendUser } from "@/types/auth";

export const usersApi = {
  async list(search?: string): Promise<AuthUser[]> {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    const response = await api.get<BackendUser[]>(`/users${query}`);
    return response.data.map(authService.mapUser);
  },

  async create(request: AdminCreateUserRequest): Promise<AuthUser> {
    const response = await api.post<BackendUser>("/users", request);
    return authService.mapUser(response.data);
  },

  async update(id: string, request: AdminUpdateUserRequest): Promise<AuthUser> {
    const response = await api.put<BackendUser>(`/users/${id}`, request);
    return authService.mapUser(response.data);
  },

  async remove(id: string) {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },
};
