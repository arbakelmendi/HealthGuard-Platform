import { useEffect, useState } from "react";
import { Activity, Calendar, Edit, Phone, Save, Shield, TrendingUp, User, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import type { UpdateProfileRequest } from "@/types/auth";
import { UserPageContainer } from "@/components/PageContainers";

const chronicConditionOptions = [
  "Diabetes (Type 1)", "Diabetes (Type 2)", "Prediabetes", "Hypertension (High Blood Pressure)",
  "Heart Disease", "Coronary Artery Disease", "Heart Failure", "Arrhythmia", "Asthma",
  "Chronic Obstructive Pulmonary Disease (COPD)", "Chronic Kidney Disease", "Liver Disease",
  "Stroke History", "High Cholesterol (Hyperlipidemia)", "Arthritis", "Osteoporosis",
  "Thyroid Disorder", "Cancer", "Depression", "Anxiety Disorder", "Epilepsy / Seizure Disorder",
  "Autoimmune Disease", "Sleep Apnea", "Obesity", "None", "Other",
];

const allergyOptions = [
  "Pollen", "Dust", "Mold", "Pet Dander", "Insect Stings", "Peanuts", "Tree Nuts",
  "Milk / Dairy", "Eggs", "Soy", "Wheat / Gluten", "Fish", "Shellfish", "Sesame",
  "Penicillin", "Antibiotics (Other)", "Aspirin", "Ibuprofen / NSAIDs", "Latex",
  "Contrast Dye", "Fragrances / Perfumes", "None", "Other",
];

const parseMulti = (value?: string) => value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

const toggleMultiValue = (current: string | undefined, option: string) => {
  const selected = parseMulti(current);
  if (option === "None") return selected.includes("None") ? "" : "None";

  const withoutNone = selected.filter((item) => item !== "None");
  const next = withoutNone.includes(option)
    ? withoutNone.filter((item) => item !== option)
    : [...withoutNone, option];

  return next.join(", ");
};

export default function MyProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileRequest>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
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
      <UserPageContainer>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
            <UserCircle className="h-6 w-6 text-[#14B8C4] stroke-[2.25]" /> My Profile
          </h1>
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
              <MultiSelectPanel
                title="Chronic Conditions"
                options={chronicConditionOptions}
                value={form.chronicConditions}
                disabled={!editing}
                onChange={(option) => setField("chronicConditions", toggleMultiValue(form.chronicConditions, option))}
              />
              <MultiSelectPanel
                title="Allergies"
                options={allergyOptions}
                value={form.allergies}
                disabled={!editing}
                onChange={(option) => setField("allergies", toggleMultiValue(form.allergies, option))}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Auto-Calculated BMI</p>
                <p className="text-2xl font-display font-bold">{bmi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</p>
                <p className="text-sm font-medium">{form.phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </UserPageContainer>
    </DashboardLayout>
  );
}

function MultiSelectPanel({
  title,
  options,
  value,
  disabled,
  onChange,
}: {
  title: string;
  options: string[];
  value?: string;
  disabled: boolean;
  onChange: (option: string) => void;
}) {
  const selected = parseMulti(value);

  return (
    <div className="rounded-2xl border bg-white/65 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="text-sm font-semibold text-foreground">{title}</Label>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{selected.length} selected</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className={`flex min-h-9 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] leading-snug transition ${
                disabled ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5"
              } ${
                checked
                  ? "border-cyan-400 bg-cyan-50 text-cyan-800 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]"
                  : "border-border/70 bg-white/55 text-foreground hover:bg-white"
              }`}
            >
              <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => onChange(option)} />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
