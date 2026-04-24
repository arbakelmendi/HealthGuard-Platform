import api from "@/lib/api";
import type { AuthResponse, LoginRequest, SignupRequest, UpdateProfileRequest } from "@/types/auth";

export const authApi = {
  async login(request: LoginRequest) {
    const response = await api.post<AuthResponse>("/auth/login", {
      email: request.email.trim(),
      password: request.password,
    });
    return response.data;
  },

  async register(request: SignupRequest) {
    const response = await api.post<AuthResponse>("/auth/register", {
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      email: request.email.trim(),
      password: request.password,
      confirmPassword: request.confirmPassword,
      age: request.age,
      gender: request.gender,
      weight: request.weight,
      height: request.height,
      phone: request.phone?.trim() || undefined,
      city: request.city?.trim() || undefined,
      bloodType: request.bloodType || undefined,
      activityLevel: request.activityLevel || undefined,
      chronicConditions: request.chronicConditions?.trim() || undefined,
      allergies: request.allergies?.trim() || undefined,
      smokingStatus: request.smokingStatus || undefined,
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get<AuthResponse["user"]>("/profile");
    return response.data;
  },

  async updateProfile(request: UpdateProfileRequest) {
    const response = await api.put<AuthResponse["user"]>("/profile", {
      ...request,
      firstName: request.firstName?.trim(),
      lastName: request.lastName?.trim(),
      email: request.email?.trim(),
      phone: request.phone?.trim() || undefined,
      city: request.city?.trim() || undefined,
      chronicConditions: request.chronicConditions?.trim() || undefined,
      allergies: request.allergies?.trim() || undefined,
    });
    return response.data;
  },
};
