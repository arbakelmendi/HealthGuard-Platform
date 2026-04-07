import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle, Zap } from "lucide-react";

type RiskResult = {
  level: "Low" | "Medium" | "High";
  score: number;
  explanation: string;
  factors: string[];
};

export default function RiskAssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  const runPrediction = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        level: "High",
        score: 72,
        explanation: "Based on your current BMI of 26.2, low physical activity (2 days/week), and elevated stress levels, our AI model has determined a high risk probability. Immediate lifestyle adjustments are recommended.",
        factors: ["Elevated BMI (26.2)", "Low physical activity", "High stress indicators", "Irregular sleep pattern"],
      });
      setLoading(false);
    }, 2000);
  };

  const riskStyle = result?.level === "High"
    ? { gradient: "gradient-risk-high", text: "text-health-danger", bg: "bg-health-danger/10" }
    : result?.level === "Medium"
    ? { gradient: "gradient-risk-medium", text: "text-health-warning", bg: "bg-health-warning/10" }
    : { gradient: "gradient-risk-low", text: "text-health-success", bg: "bg-health-success/10" };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> Risk Assessment
          </h1>
          <p className="text-muted-foreground text-sm">AI-powered health risk prediction engine.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display">Input Parameters</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Age</Label><Input type="number" defaultValue="32" /></div>
                <div className="space-y-2"><Label>BMI</Label><Input type="number" defaultValue="26.2" /></div>
                <div className="space-y-2"><Label>Blood Pressure</Label><Input defaultValue="130/85" /></div>
                <div className="space-y-2"><Label>Blood Sugar</Label><Input type="number" defaultValue="110" /></div>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select defaultValue="low">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recent Symptoms</Label>
                <Select defaultValue="headache">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="headache">Headache, Fatigue</SelectItem>
                    <SelectItem value="pain">Chest Pain</SelectItem>
                    <SelectItem value="breath">Shortness of Breath</SelectItem>
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
      </div>
    </DashboardLayout>
  );
}
