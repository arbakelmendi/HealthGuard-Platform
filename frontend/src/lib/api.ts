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
