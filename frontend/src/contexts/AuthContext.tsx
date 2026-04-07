import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  joinedDate: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: "1",
    email: "admin@healthguard.com",
    password: "admin123",
    firstName: "Sarah",
    lastName: "Chen",
    role: "admin",
    phone: "+1 555-0100",
    age: 34,
    gender: "Female",
    weight: 62,
    height: 168,
    joinedDate: "2025-06-15",
  },
  {
    id: "2",
    email: "user@healthguard.com",
    password: "user123",
    firstName: "John",
    lastName: "Doe",
    role: "user",
    phone: "+1 555-0200",
    age: 42,
    gender: "Male",
    weight: 85,
    height: 178,
    joinedDate: "2025-11-02",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("healthguard_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem("healthguard_user", JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (email: string, _password: string, firstName: string, lastName: string): Promise<boolean> => {
    const newUser: AuthUser = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role: "user",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setUser(newUser);
    localStorage.setItem("healthguard_user", JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("healthguard_user");
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("healthguard_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
