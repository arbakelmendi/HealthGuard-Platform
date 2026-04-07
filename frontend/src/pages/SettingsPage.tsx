import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="John Doe" /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue="john@example.com" /></div>
            </div>
            <Button onClick={() => toast.success("Saved!")} className="gradient-primary text-primary-foreground">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Risk Level Alerts", desc: "Get notified when risk level changes", default: true },
              { label: "Weekly Reports", desc: "Receive weekly health summaries", default: true },
              { label: "AI Recommendations", desc: "New personalized recommendations", default: false },
              { label: "System Updates", desc: "Platform updates and maintenance", default: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.default} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-health-danger/20">
          <CardHeader><CardTitle className="text-base font-display text-health-danger">Danger Zone</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Permanently delete your account and all associated data.</p>
            <Button variant="destructive" onClick={() => toast.error("This is a demo — account not deleted.")}>Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
