import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageContainer } from "@/components/PageContainers";
import { notificationsApi, type NotificationResponse } from "@/services/notificationsApi";
import { useEffect, useMemo, useState } from "react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { formatNotificationTime } from "@/lib/time";

export default function NotificationsPage() {
  const { isAdmin, user } = useAuth();
  const { setUnreadCount, refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<number | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const userId = useMemo(() => {
    const parsed = Number(user?.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [user?.id]);

  const typeStyle = (type: string) =>
    type === "Alert" ? "border-l-health-warning" :
    type === "Reminder" ? "border-l-health-success" : "border-l-health-info";

  const iconTone = (type: string) =>
    type === "Alert" ? "bg-health-warning/10 text-health-warning" :
    type === "Reminder" ? "bg-health-success/10 text-health-success" : "bg-health-info/10 text-health-info";

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      setError("Unable to load notifications for this session.");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    notificationsApi.getByUser(userId)
      .then((data) => {
        if (isMounted) {
          setNotifications(data);
          setUnreadCount(data.filter((notification) => !notification.isRead).length);
          refreshUnreadCount().catch(() => undefined);
        }
      })
      .catch(() => {
        if (isMounted) setError("Notifications could not be loaded.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshUnreadCount, setUnreadCount, userId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const markRead = async (notification: NotificationResponse) => {
    if (notification.isRead) return;

    setReadingId(notification.id);
    try {
      const updated = await notificationsApi.markRead(notification.id);
      setNotifications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setUnreadCount((current) => Math.max(0, current - 1));
      await refreshUnreadCount();
    } catch {
      toast.error("Notification could not be marked as read");
    } finally {
      setReadingId(null);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;

    setIsMarkingAll(true);
    try {
      await notificationsApi.markAllRead(userId);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? readAt })));
      setUnreadCount(0);
      await refreshUnreadCount();
      toast.success("All marked as read");
    } catch {
      toast.error("Notifications could not be marked as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <DashboardLayout>
      <AdminPageContainer>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
              <Bell className={isAdmin ? "h-7 w-7 text-cyan-400" : "h-6 w-6 text-[#14B8C4] stroke-[2.25]"} /> Notifications
            </h1>
            <p className="text-muted-foreground text-sm">Stay updated on your health status.</p>
          </div>
          <Button
            size="sm"
            className="gradient-primary text-primary-foreground shadow-glow"
            onClick={markAllRead}
            disabled={isMarkingAll || notifications.every((notification) => notification.isRead)}
          >
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading && (
            <Card className="shadow-card">
              <CardContent className="p-4 text-sm text-muted-foreground">Loading notifications...</CardContent>
            </Card>
          )}

          {!isLoading && error && (
            <Card className="shadow-card border-l-4 border-l-health-warning">
              <CardContent className="p-4 text-sm text-muted-foreground">{error}</CardContent>
            </Card>
          )}

          {!isLoading && !error && notifications.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="p-4 text-sm text-muted-foreground">No notifications yet.</CardContent>
            </Card>
          )}

          {!isLoading && !error && notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`shadow-card border-l-4 ${typeStyle(notification.type)} ${!notification.isRead ? "bg-primary/[0.02]" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconTone(notification.type)}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.isRead && <Badge className="gradient-primary text-primary-foreground text-[10px] px-1.5">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNotificationTime(notification.createdAt, now)}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => markRead(notification)}
                    disabled={readingId === notification.id}
                  >
                    Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminPageContainer>
    </DashboardLayout>
  );
}
