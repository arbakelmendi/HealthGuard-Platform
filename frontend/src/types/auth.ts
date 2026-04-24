export type UserRole = "admin" | "user";

export type UserStatus = "active" | "inactive";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  joinedDate: string;
  avatar?: string;
  phone?: string;
  city?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  bloodType?: string;
  activityLevel?: string;
  chronicConditions?: string;
  allergies?: string;
  smokingStatus?: string;
}

export interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  phone?: string;
  city?: string;
  bloodType?: string;
  activityLevel?: string;
  chronicConditions?: string;
  allergies?: string;
  smokingStatus?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  phone?: string;
  city?: string;
  bloodType?: string;
  activityLevel?: string;
  chronicConditions?: string;
  allergies?: string;
  smokingStatus?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  avatar?: string;
  bloodType?: string;
  activityLevel?: string;
  chronicConditions?: string;
  allergies?: string;
  smokingStatus?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: BackendUser;
}

export interface AdminCreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  phone?: string;
  city?: string;
  bloodType?: string;
  activityLevel?: string;
  chronicConditions?: string;
  allergies?: string;
  smokingStatus?: string;
  isActive?: boolean;
}

export interface AdminUpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  phone?: string;
  city?: string;
  bloodType?: string;
  activityLevel?: string;
  chronicConditions?: string;
  allergies?: string;
  smokingStatus?: string;
  isActive?: boolean;
}
