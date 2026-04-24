import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    city: user?.city || "",
  });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      city: user?.city || "",
    });
  }, [user]);

  const saveAccount = async () => {
    try {
      await updateProfile(form);
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save settings.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => void saveAccount()} className="gradient-primary text-primary-foreground">Save Changes</Button>
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
            ].map((item) => (
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
            <Button variant="destructive" onClick={() => toast.error("Account deletion is disabled in this local demo.")}>Delete Account</Button>
          </CardContent>
        </Card>

        <Separator />
      </div>
    </DashboardLayout>
  );
}
