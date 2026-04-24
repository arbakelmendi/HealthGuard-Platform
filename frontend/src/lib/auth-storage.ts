import type { AuthSession } from "@/types/auth";

const SESSION_KEY = "healthguard_auth_session";

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const authStorage = {
  getSession(): AuthSession | null {
    return parseJson<AuthSession | null>(localStorage.getItem(SESSION_KEY), null);
  },

  setSession(session: AuthSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("healthguard_user", JSON.stringify(session.user));
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("healthguard_user");
  },
};
