import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { healthRecordsApi, type HealthRecordPayload, type HealthRecordResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function HealthProfilePage() {
  const { user } = useAuth();
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("female");
  const [weight, setWeight] = useState("78");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState([5]);
  const [sleep, setSleep] = useState([7]);
  const [dietType, setDietType] = useState("mixed");
  const [smokingStatus, setSmokingStatus] = useState("never");
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [bloodSugar, setBloodSugar] = useState("95");
  const [cholesterol, setCholesterol] = useState("190");
  const [stressLevel, setStressLevel] = useState([4]);
  const [symptoms, setSymptoms] = useState("none");
  const [latestRecord, setLatestRecord] = useState<HealthRecordResponse | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    healthRecordsApi.getLatestHealthRecord(Number(user.id))
      .then((record) => {
        setLatestRecord(record);
        setAge(String(record.age));
        setGender(record.gender || user.gender || "female");
        setWeight(String(record.weightKg || record.weight));
        setHeight(String(record.heightCm || record.height));
        setBloodPressure(record.bloodPressure || `${record.systolicBp}/${record.diastolicBp}`);
        setBloodSugar(String(record.bloodSugar || record.glucose));
        setCholesterol(String(record.cholesterol || 190));
        setActivity([activityLevelToDays(record.activityLevel)]);
        setSleep([Number(record.sleepHours || 7)]);
        setSmokingStatus(record.smokingStatus?.toLowerCase() || "never");
        setStressLevel([Number(record.stressLevel || 4)]);
        setSymptoms(record.symptoms || "none");
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error("Could not load your latest health profile.");
        }
      });
  }, [user?.id, user?.gender]);

  const bmi = weight && height ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : "-";

  const parseBloodPressure = () => {
    const match = bloodPressure.trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
    if (!match) return null;

    return {
      systolicBp: Number(match[1]),
      diastolicBp: Number(match[2]),
    };
  };

  const activityLevel = (days: number) => {
    if (days <= 1) return "Sedentary";
    if (days <= 3) return "Low";
    if (days <= 5) return "Moderate";
    return "High";
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Please sign in before saving your health profile.");
      return;
    }

    const bp = parseBloodPressure();
    if (!bp) {
      toast.error("Blood pressure must be written like 120/80.");
      return;
    }

    const payload: HealthRecordPayload = {
      userId: Number(user.id),
      age: Number(age),
      gender,
      weight: Number(weight),
      height: Number(height),
      weightKg: Number(weight),
      heightCm: Number(height),
      bloodPressure: `${bp.systolicBp}/${bp.diastolicBp}`,
      systolicBp: bp.systolicBp,
      diastolicBp: bp.diastolicBp,
      heartRate: 70,
      glucose: Number(bloodSugar),
      bloodSugar: Number(bloodSugar),
      cholesterol: Number(cholesterol),
      activityLevel: activityLevel(activity[0]),
      sleepHours: sleep[0],
      stressLevel: stressLevel[0],
      smokingStatus,
      symptoms,
    };

    setSaving(true);
    try {
      const saved = latestRecord
        ? await healthRecordsApi.updateHealthRecord(latestRecord.id, payload)
        : await healthRecordsApi.saveHealthRecord(payload);

      setLatestRecord(saved);
      toast.success("Health profile updated successfully!");
    } catch (error) {
      const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response?.data;
      const firstError = response?.errors ? Object.values(response.errors)[0]?.[0] : undefined;
      toast.error(firstError ?? response?.message ?? "Could not save health profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-display font-bold">Health Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal health information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Auto-calculated BMI</p>
                <p className="text-3xl font-display font-bold text-primary">{bmi}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display">Lifestyle</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Physical Activity (days/week): {activity[0]}</Label>
                <Slider value={activity} onValueChange={setActivity} max={7} min={0} step={1} />
              </div>
              <div className="space-y-3">
                <Label>Average Sleep (hours): {sleep[0]}</Label>
                <Slider value={sleep} onValueChange={setSleep} max={12} min={3} step={0.5} />
              </div>
              <div className="space-y-2">
                <Label>Diet Type</Label>
                <Select value={dietType} onValueChange={setDietType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Smoking Status</Label>
                <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Stress Level: {stressLevel[0]}</Label>
                <Slider value={stressLevel} onValueChange={setStressLevel} max={10} min={0} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card md:col-span-2">
            <CardHeader><CardTitle className="text-base font-display">Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Blood Sugar (mg/dL)</Label>
                  <Input type="number" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cholesterol (mg/dL)</Label>
                  <Input type="number" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Family History</Label>
                  <Select defaultValue="none">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="heart">Heart Disease</SelectItem>
                      <SelectItem value="cancer">Cancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Recent Symptoms</Label>
                <Select value={symptoms} onValueChange={setSymptoms}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="headache fatigue">Headache, Fatigue</SelectItem>
                    <SelectItem value="chest pain">Chest Pain</SelectItem>
                    <SelectItem value="shortness of breath">Shortness of Breath</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground px-8">
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </DashboardLayout>
  );
}

const activityLevelToDays = (level: string) => {
  switch (level?.toLowerCase()) {
    case "sedentary": return 1;
    case "low": return 3;
    case "moderate": return 5;
    case "high": return 7;
    default: return 5;
  }
};
