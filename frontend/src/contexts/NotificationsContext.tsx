import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationsApi } from "@/services/notificationsApi";

interface NotificationsContextType {
  unreadCount: number;
  hasUnread: boolean;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = useMemo(() => {
    const parsed = Number(user?.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [user?.id]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setUnreadCount(0);
      return;
    }

    const count = await notificationsApi.getUnreadCount(userId);
    setUnreadCount(count);
  }, [isAuthenticated, userId]);

  useEffect(() => {
    refreshUnreadCount().catch(() => setUnreadCount(0));
  }, [refreshUnreadCount]);

  const value = useMemo(
    () => ({
      unreadCount,
      hasUnread: unreadCount > 0,
      refreshUnreadCount,
      setUnreadCount,
    }),
    [refreshUnreadCount, unreadCount],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
