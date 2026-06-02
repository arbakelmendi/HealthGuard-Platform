import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useAuth } from "@/contexts/AuthContext";
import { authStorage } from "@/lib/auth-storage";
import { notificationsApi } from "@/services/notificationsApi";
import type { NotificationResponse } from "@/services/notificationsApi";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl("/hubs/notifications", {
        accessTokenFactory: () => authStorage.getSession()?.token ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("notificationReceived", (notification: NotificationResponse) => {
      setUnreadCount((current) => current + (notification.isRead ? 0 : 1));
      toast(notification.title, { description: notification.message });
    });

    connection
      .start()
      .catch(() => undefined);

    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().catch(() => undefined);
      }
    };
  }, [isAuthenticated, userId]);

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
