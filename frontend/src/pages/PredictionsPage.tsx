import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { predictionsApi, type PredictHealthRiskResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Activity, AlertTriangle, BarChart3, Eye, FileText, Sparkles, TrendingUp } from "lucide-react";
import { UserPageContainer } from "@/components/PageContainers";

const riskBadgeClass = (level: string) =>
  level === "High" ? "border-health-danger/30 bg-health-danger/10 text-health-danger" :
  level === "Medium" ? "border-health-warning/30 bg-health-warning/10 text-health-warning" :
  "border-health-success/30 bg-health-success/10 text-health-success";

const riskAccentClass = (level: string) =>
  level === "High" ? "text-health-danger" :
  level === "Medium" ? "text-health-warning" :
  level === "Low" ? "text-health-success" :
  "text-muted-foreground";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PredictionsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [predictions, setPredictions] = useState<PredictHealthRiskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictHealthRiskResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    predictionsApi.getByUser(Number(user.id))
      .then(setPredictions)
      .catch(() => toast.error("Could not load prediction history."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = filter === "all" ? predictions : predictions.filter(p => p.riskLevel === filter);

  const sortedPredictions = useMemo(
    () => [...predictions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [predictions],
  );

  const stats = useMemo(() => {
    const total = predictions.length;
    const average = total ? Math.round(predictions.reduce((sum, item) => sum + item.riskScore, 0) / total) : 0;
    const latest = predictions[0];
    const highest = total ? Math.max(...predictions.map((item) => item.riskScore)) : 0;

    return {
      total,
      average,
      latestRiskLevel: latest?.riskLevel ?? "-",
      highest,
    };
  }, [predictions]);

  const riskTrendData = useMemo(() => {
    const byDay = new Map<string, { label: string; timestamp: number; total: number; count: number }>();

    sortedPredictions.forEach((prediction) => {
      const date = new Date(prediction.createdAt);
      const key = date.toISOString().slice(0, 10);
      const current = byDay.get(key) ?? {
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        timestamp: date.getTime(),
        total: 0,
        count: 0,
      };
      byDay.set(key, { ...current, total: current.total + prediction.riskScore, count: current.count + 1 });
    });

    return Array.from(byDay.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((value) => ({
        date: value.label,
        averageRisk: Math.round(value.total / value.count),
        predictions: value.count,
      }));
  }, [sortedPredictions]);

  const insights = useMemo(() => {
    if (predictions.length === 0) {
      return ["Run your first prediction to unlock personalized health insights."];
    }

    const next: string[] = [];
    const latest = predictions[0];
    const first = sortedPredictions[0];
    const last = sortedPredictions[sortedPredictions.length - 1];
    const riskDelta = first && last ? last.riskScore - first.riskScore : 0;
    const factorCounts = new Map<string, number>();

    predictions.forEach((prediction) => {
      prediction.contributingFactors.forEach((factor) => {
        factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
      });
    });

    if (latest) {
      next.push(`Latest result is ${latest.riskLevel} risk at ${latest.riskScore}%.`);
    }

    if (predictions.length > 1) {
      if (riskDelta >= 5) {
        next.push(`Risk score is trending up by ${riskDelta} points across your history.`);
      } else if (riskDelta <= -5) {
        next.push(`Risk score is trending down by ${Math.abs(riskDelta)} points across your history.`);
      } else {
        next.push("Risk score is relatively stable across your recent predictions.");
      }
    }

    const topFactors = Array.from(factorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([factor]) => factor);

    if (topFactors.length > 0) {
      next.push(`Recurring factors: ${topFactors.join(", ")}.`);
    }

    if (stats.average >= 70) {
      next.push("Average risk is high; review recommendations and consider a clinical follow-up.");
    } else if (stats.average >= 40) {
      next.push("Average risk is moderate; lifestyle changes may lower future scores.");
    } else {
      next.push("Average risk is currently low; keep tracking changes over time.");
    }

    return next;
  }, [predictions, sortedPredictions, stats.average]);

  const statCards = [
    { label: "Total Predictions", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Average Risk Score", value: stats.total ? `${stats.average}%` : "-", icon: Activity, color: "text-health-info" },
    { label: "Latest Risk Level", value: stats.latestRiskLevel, icon: AlertTriangle, color: riskAccentClass(stats.latestRiskLevel) },
    { label: "Highest Risk Score", value: stats.total ? `${stats.highest}%` : "-", icon: TrendingUp, color: "text-health-warning" },
  ];

  return (
    <DashboardLayout>
      <UserPageContainer>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
            <BarChart3 className="h-6 w-6 text-[#14B8C4] stroke-[2.25]" /> Predictions
          </h1>
          <p className="text-muted-foreground text-sm">History of AI risk predictions and trends.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="shadow-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/8">
                  <Icon className={`size-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-display text-xl font-bold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Average Risk Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {riskTrendData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center rounded-xl border border-dashed bg-white/45 text-sm text-muted-foreground">
                Trend data will appear after your first prediction.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="riskTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(187, 76%, 42%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(187, 76%, 42%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="date" fontSize={12} stroke="hsl(215, 12%, 50%)" />
                  <YAxis domain={[0, 100]} fontSize={12} stroke="hsl(215, 12%, 50%)" />
                  <Tooltip formatter={(value) => [`${value}%`, "Average Risk"]} />
                  <Area type="monotone" dataKey="averageRisk" stroke="hsl(187, 76%, 42%)" strokeWidth={3} fill="url(#riskTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2"><Sparkles className="size-4 text-[#14B8C4]" /> Health Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {insights.map((insight) => (
                <div key={insight} className="rounded-xl border bg-white/55 p-3 text-sm text-muted-foreground">
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Past Predictions</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-xl border bg-white/45 p-8 text-center text-sm text-muted-foreground">Loading predictions...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-white/45 p-8 text-center">
                <BarChart3 className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                <p className="font-display font-semibold">{predictions.length === 0 ? "No predictions yet" : "No predictions match this filter"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {predictions.length === 0 ? "Run a risk assessment to start building your prediction history." : "Try another risk level filter."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9">Date</TableHead>
                    <TableHead className="h-9">Risk</TableHead>
                    <TableHead className="h-9">Score</TableHead>
                    <TableHead className="h-9">Health Data</TableHead>
                    <TableHead className="h-9">Key Factors</TableHead>
                    <TableHead className="h-9 text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.predictionId}>
                      <TableCell className="py-2 text-xs text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                      <TableCell className="py-2"><Badge variant="outline" className={riskBadgeClass(p.riskLevel)}>{p.riskLevel}</Badge></TableCell>
                      <TableCell className="py-2 font-mono text-sm font-semibold">{p.riskScore}%</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {p.healthRecord
                          ? `BMI ${Number(p.healthRecord.bmi).toFixed(1)}, BP ${p.healthRecord.bloodPressure}`
                          : p.healthRecordId
                          ? `Record #${p.healthRecordId}`
                          : "No linked record"}
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate py-2 text-xs text-muted-foreground">
                        {p.contributingFactors.join(", ") || "None significant"}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setSelectedPrediction(p)}>
                          <Eye className="mr-1 size-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedPrediction} onOpenChange={(open) => !open && setSelectedPrediction(null)}>
          <DialogContent className="max-w-2xl">
            {selectedPrediction && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display">Prediction Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className={riskBadgeClass(selectedPrediction.riskLevel)}>{selectedPrediction.riskLevel} Risk</Badge>
                    <span className="font-mono text-lg font-semibold">{selectedPrediction.riskScore}%</span>
                    <span className="text-sm text-muted-foreground">{formatDateTime(selectedPrediction.createdAt)}</span>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explanation</p>
                    <p className="text-sm">{selectedPrediction.explanation}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contributing Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPrediction.contributingFactors.length ? selectedPrediction.contributingFactors : ["None significant"]).map((factor) => (
                        <Badge key={factor} variant="outline" className="text-xs">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border bg-white/45 p-3">
                      <p className="text-xs text-muted-foreground">Model</p>
                      <p className="text-sm font-medium">{selectedPrediction.modelName}</p>
                    </div>
                    <div className="rounded-xl border bg-white/45 p-3">
                      <p className="text-xs text-muted-foreground">Health Record</p>
                      <p className="text-sm font-medium">
                        {selectedPrediction.healthRecord
                          ? `BMI ${Number(selectedPrediction.healthRecord.bmi).toFixed(1)}, BP ${selectedPrediction.healthRecord.bloodPressure}`
                          : selectedPrediction.healthRecordId
                          ? `Record #${selectedPrediction.healthRecordId}`
                          : "No linked record"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </UserPageContainer>
    </DashboardLayout>
  );
}
