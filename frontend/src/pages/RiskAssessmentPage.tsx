import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { healthRecordsApi, predictionsApi, type HealthRecordResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { toast } from "sonner";
import { UserPageContainer } from "@/components/PageContainers";

type RiskResult = {
  level: "Low" | "Medium" | "High";
  score: number;
  explanation: string;
  factors: string[];
};

type ValidationErrors = Record<string, string[]>;

const parseBloodPressure = (bloodPressure: string) => {
  const match = bloodPressure?.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  return {
    systolicBp: match ? Number(match[1]) : 0,
    diastolicBp: match ? Number(match[2]) : 0,
  };
};

export default function RiskAssessmentPage() {
  const { user } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [latestRecord, setLatestRecord] = useState<HealthRecordResponse | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [form, setForm] = useState({
    age: user?.age?.toString() ?? "32",
    gender: user?.gender ?? "female",
    heightCm: user?.height?.toString() ?? "170",
    weightKg: user?.weight?.toString() ?? "76",
    systolicBp: "130",
    diastolicBp: "85",
    bloodSugar: "110",
    cholesterol: "210",
    activityLevel: user?.activityLevel?.toLowerCase() ?? "low",
    sleepHours: "6.5",
    stressLevel: "5",
    smokingStatus: user?.smokingStatus?.toLowerCase() ?? "never",
    symptoms: "headache fatigue",
  });

  useEffect(() => {
    if (!user?.id) return;

    healthRecordsApi.getLatestHealthRecord(Number(user.id))
      .then((record) => {
        const parsedBp = parseBloodPressure(record.bloodPressure);
        setLatestRecord(record);
        setForm({
          age: String(record.age),
          gender: record.gender || "female",
          heightCm: String(record.heightCm || record.height),
          weightKg: String(record.weightKg || record.weight),
          systolicBp: String(record.systolicBp || parsedBp.systolicBp || 120),
          diastolicBp: String(record.diastolicBp || parsedBp.diastolicBp || 80),
          bloodSugar: String(record.bloodSugar || record.glucose),
          cholesterol: String(record.cholesterol || 190),
          activityLevel: record.activityLevel?.toLowerCase() || "low",
          sleepHours: String(record.sleepHours || 7),
          stressLevel: String(record.stressLevel || 4),
          smokingStatus: record.smokingStatus?.toLowerCase() || "never",
          symptoms: record.symptoms || "none",
        });
        setHasChanges(false);
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error("Could not load your latest health profile.");
        }
      });
  }, [user?.id]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setHasChanges(true);
  };

  const fieldError = (field: string) => validationErrors[field]?.[0] ?? validationErrors[`$.${field}`]?.[0];

  const runPrediction = async () => {
    if (!user?.id) {
      toast.error("Please sign in before running a prediction.");
      return;
    }

    setLoading(true);
    setResult(null);
    setValidationErrors({});

    try {
      const prediction = await predictionsApi.predict({
        userId: Number(user.id),
        healthRecordId: latestRecord && !hasChanges ? latestRecord.id : undefined,
        age: Number(form.age),
        gender: form.gender,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        systolicBp: Number(form.systolicBp),
        diastolicBp: Number(form.diastolicBp),
        bloodSugar: Number(form.bloodSugar),
        cholesterol: Number(form.cholesterol),
        activityLevel: form.activityLevel,
        sleepHours: Number(form.sleepHours),
        stressLevel: Number(form.stressLevel),
        smokingStatus: form.smokingStatus,
        symptoms: form.symptoms,
      });

      setResult({
        level: prediction.riskLevel,
        score: prediction.riskScore,
        explanation: prediction.explanation,
        factors: prediction.contributingFactors,
      });
      await refreshUnreadCount();
    } catch (error) {
      const response = (error as { response?: { data?: { errors?: ValidationErrors; message?: string } } }).response?.data;
      if (response?.errors) {
        setValidationErrors(response.errors);
      }
      toast.error(response?.message ?? "Prediction failed. Please review your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const riskStyle = result?.level === "High"
    ? { gradient: "gradient-risk-high", text: "text-health-danger", bg: "bg-health-danger/10" }
    : result?.level === "Medium"
    ? { gradient: "gradient-risk-medium", text: "text-health-warning", bg: "bg-health-warning/10" }
    : { gradient: "gradient-risk-low", text: "text-health-success", bg: "bg-health-success/10" };

  return (
    <DashboardLayout>
      <UserPageContainer>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
            <Brain className="h-6 w-6 text-[#14B8C4] stroke-[2.25]" /> Risk Assessment
          </h1>
          <p className="text-muted-foreground text-sm">AI-powered health risk prediction engine.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display">Input Parameters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={form.age} onChange={(e) => updateField("age", e.target.value)} />
                  {fieldError("Age") && <p className="text-xs text-health-danger">{fieldError("Age")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={form.heightCm} onChange={(e) => updateField("heightCm", e.target.value)} />
                  {fieldError("HeightCm") && <p className="text-xs text-health-danger">{fieldError("HeightCm")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={form.weightKg} onChange={(e) => updateField("weightKg", e.target.value)} />
                  {fieldError("WeightKg") && <p className="text-xs text-health-danger">{fieldError("WeightKg")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Systolic BP</Label>
                  <Input type="number" value={form.systolicBp} onChange={(e) => updateField("systolicBp", e.target.value)} />
                  {fieldError("SystolicBp") && <p className="text-xs text-health-danger">{fieldError("SystolicBp")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Diastolic BP</Label>
                  <Input type="number" value={form.diastolicBp} onChange={(e) => updateField("diastolicBp", e.target.value)} />
                  {fieldError("DiastolicBp") && <p className="text-xs text-health-danger">{fieldError("DiastolicBp")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Blood Sugar</Label>
                  <Input type="number" value={form.bloodSugar} onChange={(e) => updateField("bloodSugar", e.target.value)} />
                  {fieldError("BloodSugar") && <p className="text-xs text-health-danger">{fieldError("BloodSugar")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cholesterol</Label>
                  <Input type="number" value={form.cholesterol} onChange={(e) => updateField("cholesterol", e.target.value)} />
                  {fieldError("Cholesterol") && <p className="text-xs text-health-danger">{fieldError("Cholesterol")}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={form.activityLevel} onValueChange={(value) => updateField("activityLevel", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sleep Hours</Label>
                  <Input type="number" step="0.5" value={form.sleepHours} onChange={(e) => updateField("sleepHours", e.target.value)} />
                  {fieldError("SleepHours") && <p className="text-xs text-health-danger">{fieldError("SleepHours")}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Stress Level</Label>
                  <Input type="number" value={form.stressLevel} onChange={(e) => updateField("stressLevel", e.target.value)} />
                  {fieldError("StressLevel") && <p className="text-xs text-health-danger">{fieldError("StressLevel")}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Smoking Status</Label>
                <Select value={form.smokingStatus} onValueChange={(value) => updateField("smokingStatus", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recent Symptoms</Label>
                <Select value={form.symptoms} onValueChange={(value) => updateField("symptoms", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="headache fatigue">Headache, Fatigue</SelectItem>
                    <SelectItem value="chest pain">Chest Pain</SelectItem>
                    <SelectItem value="shortness of breath">Shortness of Breath</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={runPrediction} disabled={loading} className="w-full gradient-primary text-primary-foreground">
                {loading ? (
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 animate-pulse-glow" /> Analyzing...</span>
                ) : (
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> Run Prediction</span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="shadow-card h-full flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 animate-pulse-glow flex items-center justify-center">
                      <Brain className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="font-display font-semibold">AI Model Processing...</p>
                    <p className="text-sm text-muted-foreground mt-1">Analyzing health parameters</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {!loading && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Card className="shadow-card overflow-hidden">
                  <div className={`h-2 ${riskStyle.gradient}`} />
                  <CardHeader>
                    <CardTitle className="text-base font-display">Prediction Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl ${riskStyle.bg} flex items-center justify-center`}>
                        {result.level === "High" ? <AlertTriangle className={`w-8 h-8 ${riskStyle.text}`} /> :
                         <CheckCircle className={`w-8 h-8 ${riskStyle.text}`} />}
                      </div>
                      <div>
                        <Badge className={`${riskStyle.gradient} text-primary-foreground text-sm px-3 py-1`}>{result.level} Risk</Badge>
                        <p className="text-3xl font-display font-bold mt-1">{result.score}%</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Risk Score</p>
                      <Progress value={result.score} className="h-3" />
                    </div>
                    <div className={`p-4 rounded-lg ${riskStyle.bg}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> AI Explanation
                      </p>
                      <p className="text-sm">{result.explanation}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Contributing Factors</p>
                      <div className="flex flex-wrap gap-2">
                        {result.factors.map(f => (
                          <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {!loading && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="shadow-card h-full flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-display font-medium text-muted-foreground">Run a prediction to see results</p>
                    <p className="text-xs text-muted-foreground mt-1">Fill in the parameters and click "Run Prediction"</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </UserPageContainer>
    </DashboardLayout>
  );
}
