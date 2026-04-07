import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, Activity, TrendingUp, Edit, Save, Shield } from "lucide-react";

export default function MyProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    age: user?.age || 0,
    gender: user?.gender || "",
    weight: user?.weight || 0,
    height: user?.height || 0,
  });

  if (!user) return null;

  const bmi = form.weight && form.height ? (form.weight / ((form.height / 100) ** 2)).toFixed(1) : "—";

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    toast.success("Profile updated!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal information</p>
        </div>

        {/* Profile Header */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-20 h-20 text-2xl">
                <AvatarFallback className="gradient-primary text-primary-foreground font-display text-xl">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-display font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" /> {user.role}
                  </Badge>
                  <Badge variant="outline" className="border-health-success text-health-success">Active</Badge>
                </div>
              </div>
              <Button variant={editing ? "default" : "outline"} onClick={() => editing ? handleSave() : setEditing(true)}>
                {editing ? <><Save className="w-4 h-4 mr-1" /> Save</> : <><Edit className="w-4 h-4 mr-1" /> Edit Profile</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Stats */}
          {[
            { label: "BMI", value: bmi, icon: Activity, color: "text-primary" },
            { label: "Risk Score", value: "52%", icon: TrendingUp, color: "text-health-warning" },
            { label: "Member Since", value: user.joinedDate, icon: Calendar, color: "text-health-info" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-display font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Personal Information */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName} disabled={!editing} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName} disabled={!editing} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="flex items-center gap-2" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} disabled={!editing} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age || ""} disabled={!editing} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={form.gender} disabled={!editing} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight || ""} disabled={!editing} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height || ""} disabled={!editing} onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Auto-Calculated BMI</p>
                <p className="text-2xl font-display font-bold">{bmi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Status</p>
                <Badge variant="outline" className="border-health-success text-health-success mt-1">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Security</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => toast.success("Password change email sent (simulated)")}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
