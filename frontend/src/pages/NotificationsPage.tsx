import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notificationsData } from "@/lib/mockData";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const typeStyle = (type: string) =>
    type === "warning" ? "border-l-health-warning" :
    type === "success" ? "border-l-health-success" : "border-l-health-info";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm">Stay updated on your health status.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("All marked as read")}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        </div>

        <div className="space-y-3">
          {notificationsData.map(n => (
            <Card key={n.id} className={`shadow-card border-l-4 ${typeStyle(n.type)} ${!n.read ? "bg-primary/[0.02]" : ""}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === "warning" ? "bg-health-warning/10" :
                  n.type === "success" ? "bg-health-success/10" : "bg-health-info/10"
                }`}>
                  <Bell className={`w-4 h-4 ${
                    n.type === "warning" ? "text-health-warning" :
                    n.type === "success" ? "text-health-success" : "text-health-info"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title}</p>
                    {!n.read && <Badge className="gradient-primary text-primary-foreground text-[10px] px-1.5">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
