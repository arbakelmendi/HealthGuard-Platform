import api from "@/lib/api";

export type NotificationType = "Alert" | "Reminder" | "Info";
export type NotificationSource = "Prediction" | "System" | "Profile";

export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  source: NotificationSource;
  predictionResultId?: number | null;
  createdAt: string;
  readAt?: string | null;
}

export const notificationsApi = {
  async getByUser(userId: number) {
    const response = await api.get<NotificationResponse[]>(`/notifications/user/${userId}`);
    return response.data;
  },

  async getUnreadCount(userId: number) {
    const response = await api.get<{ unreadCount: number }>(`/notifications/user/${userId}/unread-count`);
    return response.data.unreadCount;
  },

  async markRead(id: number) {
    const response = await api.put<NotificationResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead(userId: number) {
    const response = await api.put<{ message: string }>(`/notifications/user/${userId}/read-all`);
    return response.data;
  },
};
