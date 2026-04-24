import { useEffect, useState } from "react";
import { Activity, Calendar, Edit, MapPin, Phone, Save, Shield, TrendingUp, User } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import type { UpdateProfileRequest } from "@/types/auth";

export default function MyProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    city: user?.city || "",
    age: user?.age,
    gender: user?.gender || "",
    weight: user?.weight,
    height: user?.height,
    bloodType: user?.bloodType || "",
    activityLevel: user?.activityLevel || "",
    chronicConditions: user?.chronicConditions || "",
    allergies: user?.allergies || "",
    smokingStatus: user?.smokingStatus || "",
  });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      city: user?.city || "",
      age: user?.age,
      gender: user?.gender || "",
      weight: user?.weight,
      height: user?.height,
      bloodType: user?.bloodType || "",
      activityLevel: user?.activityLevel || "",
      chronicConditions: user?.chronicConditions || "",
      allergies: user?.allergies || "",
      smokingStatus: user?.smokingStatus || "",
    });
  }, [user]);

  if (!user) return null;

  const bmi = form.weight && form.height ? (form.weight / (form.height / 100) ** 2).toFixed(1) : "-";

  const setField = <K extends keyof UpdateProfileRequest>(field: K, value: UpdateProfileRequest[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      toast.error("First and last name are required.");
      return;
    }
    if (form.age && (form.age < 1 || form.age > 120)) {
      toast.error("Age must be between 1 and 120.");
      return;
    }
    if (form.weight && form.weight <= 0) {
      toast.error("Weight must be positive.");
      return;
    }
    if (form.height && form.height <= 0) {
      toast.error("Height must be positive.");
      return;
    }
    try {
      await updateProfile(form);
      setEditing(false);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update profile.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal and health information.</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-20 h-20 text-2xl">
                <AvatarFallback className="gradient-primary text-primary-foreground font-display text-xl">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-display font-bold">{user.fullName}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="border-health-success text-health-success">
                    {user.status}
                  </Badge>
                </div>
              </div>
              <Button
                variant={editing ? "default" : "outline"}
                onClick={() => {
                  if (editing) {
                    void handleSave();
                    return;
                  }
                  setEditing(true);
                }}
              >
                {editing ? <><Save className="w-4 h-4 mr-1" /> Save</> : <><Edit className="w-4 h-4 mr-1" /> Edit Profile</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName || ""} disabled={!editing} onChange={(e) => setField("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName || ""} disabled={!editing} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone || ""} disabled={!editing} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city || ""} disabled={!editing} onChange={(e) => setField("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender || ""} disabled={!editing} onValueChange={(value) => setField("gender", value)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {["Female", "Male", "Non-binary", "Prefer not to say"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2"><Activity className="w-4 h-4" /> Health Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age || ""} disabled={!editing} onChange={(e) => setField("age", Number(e.target.value) || undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight || ""} disabled={!editing} onChange={(e) => setField("weight", Number(e.target.value) || undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height || ""} disabled={!editing} onChange={(e) => setField("height", Number(e.target.value) || undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select value={form.bloodType || ""} disabled={!editing} onValueChange={(value) => setField("bloodType", value)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={form.activityLevel || ""} disabled={!editing} onValueChange={(value) => setField("activityLevel", value)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Sedentary", "Light", "Moderate", "Active", "Very active"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Smoking Status</Label>
                <Select value={form.smokingStatus || ""} disabled={!editing} onValueChange={(value) => setField("smokingStatus", value)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Never", "Former", "Current", "Prefer not to say"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <Textarea value={form.chronicConditions || ""} disabled={!editing} onChange={(e) => setField("chronicConditions", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Allergies</Label>
                <Textarea value={form.allergies || ""} disabled={!editing} onChange={(e) => setField("allergies", e.target.value)} />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Auto-Calculated BMI</p>
                <p className="text-2xl font-display font-bold">{bmi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</p>
                <p className="text-sm font-medium">{form.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> City</p>
                <p className="text-sm font-medium">{form.city || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
