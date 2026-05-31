import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, KeyRound, Loader2, Save, Settings as SettingsIcon, ShieldAlert, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UserPageContainer } from "@/components/PageContainers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { accountApi, defaultUserSettings, type UpdateUserSettingsRequest } from "@/services/accountApi";

const getSettingsFallbackKey = (userId?: string) => `healthguard:user-settings-fallback:${userId || "guest"}`;

const readLocalSettingsFallback = (userId?: string): UpdateUserSettingsRequest => {
  try {
    const saved = localStorage.getItem(getSettingsFallbackKey(userId));
    return saved ? { ...defaultUserSettings, ...JSON.parse(saved) } : defaultUserSettings;
  } catch {
    return defaultUserSettings;
  }
};

const writeLocalSettingsFallback = (settings: UpdateUserSettingsRequest, userId?: string) => {
  localStorage.setItem(getSettingsFallbackKey(userId), JSON.stringify(settings));
};

const getHttpStatus = (error: unknown) =>
  typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;

export default function SettingsPage() {
  const { user, updateProfile, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [settings, setSettings] = useState<UpdateUserSettingsRequest>(() => readLocalSettingsFallback(user?.id));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
  }, [user]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await refreshUser();
      } catch {
        toast.error("Could not refresh your account profile.");
      }

      try {
        const response = await accountApi.getUserSettings();
        setSettings({
          riskLevelAlerts: response.riskLevelAlerts,
          weeklyReports: response.weeklyReports,
          aiRecommendations: response.aiRecommendations,
          systemUpdates: response.systemUpdates,
          healthRecordReminders: response.healthRecordReminders,
          predictionCompletedAlerts: response.predictionCompletedAlerts,
          recommendationProgressAlerts: response.recommendationProgressAlerts,
        });
      } catch (err) {
        const status = getHttpStatus(err);
        const fallback = readLocalSettingsFallback(user?.id);
        setSettings(fallback);

        if (status === 404) {
          writeLocalSettingsFallback(fallback, user?.id);
        } else if (status === 401 || status === 403) {
          toast.error("Your session could not load settings. Please sign in again.");
        } else if (status === 500 || status === undefined) {
          toast.error("Settings service is unavailable. Default preferences are shown.");
        }
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, [refreshUser, user?.id]);

  const saveAccount = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }

    setSavingAccount(true);
    try {
      await updateProfile(form);
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSavingAccount(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await accountApi.updateUserSettings(settings);
      setSettings({
        riskLevelAlerts: response.riskLevelAlerts,
        weeklyReports: response.weeklyReports,
        aiRecommendations: response.aiRecommendations,
        systemUpdates: response.systemUpdates,
        healthRecordReminders: response.healthRecordReminders,
        predictionCompletedAlerts: response.predictionCompletedAlerts,
        recommendationProgressAlerts: response.recommendationProgressAlerts,
      });
      toast.success("Notification settings saved.");
    } catch (err) {
      writeLocalSettingsFallback(settings, user?.id);
      toast.warning("Could not save settings to the server. Preferences were saved locally on this device.");
    } finally {
      setSavingSettings(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Confirm password must match the new password.");
      return;
    }

    setChangingPassword(true);
    try {
      await accountApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm account deactivation.");
      return;
    }

    try {
      await accountApi.deleteAccount();
      logout();
      toast.success("Account deactivated.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to deactivate account.");
    }
  };

  const setNotification = (key: keyof UpdateUserSettingsRequest, value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <UserPageContainer>
          <div className="rounded-3xl border bg-white/60 p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-3 size-6 animate-spin text-primary" />
            Loading settings...
          </div>
        </UserPageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <UserPageContainer>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
            <SettingsIcon className="h-6 w-6 text-[#14B8C4] stroke-[2.25]" /> Settings
          </h1>
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
            </div>
            <Button onClick={() => void saveAccount()} disabled={savingAccount} className="gradient-primary text-primary-foreground">
              {savingAccount ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2"><Bell className="size-4 text-primary" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["riskLevelAlerts", "Risk Level Alerts", "Get notified when risk level changes"],
              ["weeklyReports", "Weekly Reports", "Receive weekly health summaries"],
              ["aiRecommendations", "AI Recommendations", "New personalized recommendations"],
              ["systemUpdates", "System Updates", "Platform updates and maintenance"],
              ["healthRecordReminders", "Health Record Reminders", "Prompts to keep health data current"],
              ["predictionCompletedAlerts", "Prediction Completed Alerts", "Alerts when a prediction is generated"],
              ["recommendationProgressAlerts", "Recommendation Progress Alerts", "Updates about recommendation progress"],
            ].map(([key, label, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-white/55 p-3">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={settings[key as keyof UpdateUserSettingsRequest]} onCheckedChange={(checked) => setNotification(key as keyof UpdateUserSettingsRequest, checked)} />
              </div>
            ))}
            <Button onClick={() => void saveNotificationSettings()} disabled={savingSettings} className="gradient-primary text-primary-foreground">
              {savingSettings ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2"><KeyRound className="size-4 text-primary" /> Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => void changePassword()} disabled={changingPassword} className="gradient-primary text-primary-foreground">
              {changingPassword ? <Loader2 className="mr-2 size-4 animate-spin" /> : <KeyRound className="mr-2 size-4" />}
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card border-health-danger/20">
          <CardHeader>
            <CardTitle className="text-base font-display text-health-danger flex items-center gap-2"><ShieldAlert className="size-4" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Deactivate your account. You must type DELETE before this action can continue.</p>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 size-4" /> Delete Account</Button>
          </CardContent>
        </Card>

        <Separator />

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will set your account to inactive and sign you out. Type DELETE to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-health-danger text-white hover:bg-health-danger/90" onClick={() => void deleteAccount()}>
                Deactivate Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </UserPageContainer>
    </DashboardLayout>
  );
}
