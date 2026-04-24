import { authStorage } from "@/lib/auth-storage";
import { authApi } from "@/services/authApi";
import type {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AuthResponse,
  AuthSession,
  AuthUser,
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
} from "@/types/auth";

const normalizeRole = (role: string) => (role.toLowerCase() === "admin" ? "admin" : "user");
const normalizeStatus = (isActive: boolean | undefined) => (isActive === false ? "inactive" : "active");

const mapUser = (user: AuthResponse["user"]): AuthUser => ({
  id: String(user.id),
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: normalizeRole(user.role),
  status: normalizeStatus(user.isActive),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastActive: user.updatedAt,
  joinedDate: user.createdAt.split("T")[0],
  age: user.age,
  gender: user.gender,
  weight: user.weight,
  height: user.height,
  phone: user.phone,
  city: user.city,
  bloodType: user.bloodType,
  activityLevel: user.activityLevel,
  chronicConditions: user.chronicConditions,
  allergies: user.allergies,
  smokingStatus: user.smokingStatus,
});

const mapSession = (response: AuthResponse): AuthSession => ({
  token: response.token,
  user: mapUser(response.user),
});

export const authService = {
  getCurrentSession() {
    return authStorage.getSession();
  },

  getCurrentUser() {
    return authStorage.getSession()?.user ?? null;
  },

  setSession(session: AuthSession) {
    authStorage.setSession(session);
  },

  async login(request: LoginRequest): Promise<AuthSession> {
    const response = await authApi.login(request);
    const session = mapSession(response);
    authStorage.setSession(session);
    return session;
  },

  async signup(request: SignupRequest): Promise<AuthSession> {
    const response = await authApi.register(request);
    const session = mapSession(response);
    authStorage.setSession(session);
    return session;
  },

  logout() {
    authStorage.clearSession();
  },

  async refreshProfile(): Promise<AuthUser> {
    const user = await authApi.getProfile();
    const session = authStorage.getSession();
    if (!session) {
      throw new Error("No active session.");
    }
    const nextSession = {
      ...session,
      user: mapUser(user),
    };
    authStorage.setSession(nextSession);
    return nextSession.user;
  },

  async updateProfile(updates: UpdateProfileRequest): Promise<AuthUser> {
    const user = await authApi.updateProfile(updates);
    const session = authStorage.getSession();
    if (!session) {
      throw new Error("No active session.");
    }
    const nextSession = {
      ...session,
      user: mapUser(user),
    };
    authStorage.setSession(nextSession);
    return nextSession.user;
  },

  mapUser,

  toAdminCreateRequest(form: AdminCreateUserRequest): AdminCreateUserRequest {
    return {
      ...form,
      role: form.role === "admin" ? "Admin" : "User",
      isActive: form.status === "active",
    };
  },

  toAdminUpdateRequest(form: AdminUpdateUserRequest): AdminUpdateUserRequest {
    return {
      ...form,
      role: form.role === "admin" ? "Admin" : "User",
      isActive: form.status === "active",
    };
  },
};
