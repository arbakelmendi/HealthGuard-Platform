import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/authService";
import type { AuthUser, LoginRequest, SignupRequest, UpdateProfileRequest, UserRole } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  signup: (request: SignupRequest) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (updates: UpdateProfileRequest) => Promise<AuthUser>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const session = authService.getCurrentSession();
    if (!session) return;

    authService.refreshProfile()
      .then(setUser)
      .catch(() => {
        authService.logout();
        setUser(null);
      });
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    const request: LoginRequest = { email, password, rememberMe };
    const session = await authService.login(request);
    setUser(session.user);
    return session.user;
  }, []);

  const signup = useCallback(async (request: SignupRequest) => {
    const session = await authService.signup(request);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    return updated;
  }, []);

  const refreshUser = useCallback(async () => {
    const session = authService.getCurrentSession();
    if (!session) {
      setUser(null);
      return;
    }
    const nextUser = await authService.refreshProfile();
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      signup,
      logout,
      updateProfile,
      refreshUser,
    }),
    [login, logout, refreshUser, signup, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { AuthUser, UserRole };
