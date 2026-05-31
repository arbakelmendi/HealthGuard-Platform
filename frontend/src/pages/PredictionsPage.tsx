import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { predictionsApi, type PredictHealthRiskResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PredictionsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [predictions, setPredictions] = useState<PredictHealthRiskResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    predictionsApi.getByUser(Number(user.id))
      .then(setPredictions)
      .catch(() => toast.error("Could not load prediction history."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = filter === "all" ? predictions : predictions.filter(p => p.riskLevel === filter);

  const riskOverTimeData = useMemo(() => {
    const byMonth = new Map<string, { total: number; count: number }>();

    predictions.forEach((prediction) => {
      const date = new Date(prediction.createdAt);
      const month = date.toLocaleString(undefined, { month: "short" });
      const current = byMonth.get(month) ?? { total: 0, count: 0 };
      byMonth.set(month, { total: current.total + prediction.riskScore, count: current.count + 1 });
    });

    return Array.from(byMonth.entries()).map(([month, value]) => ({
      month,
      risk: Math.round(value.total / value.count),
      predictions: value.count,
    }));
  }, [predictions]);

  const riskColor = (level: string) =>
    level === "High" ? "gradient-risk-high text-primary-foreground" :
    level === "Medium" ? "gradient-risk-medium text-primary-foreground" :
    "gradient-risk-low text-primary-foreground";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Predictions</h1>
          <p className="text-muted-foreground text-sm">History of AI risk predictions and trends.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-display">Prediction Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(215, 12%, 50%)" />
                <YAxis fontSize={12} stroke="hsl(215, 12%, 50%)" />
                <Tooltip />
                <Bar dataKey="risk" fill="hsl(215, 90%, 32%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictions" fill="hsl(168, 72%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Health Data</TableHead>
                  <TableHead>Key Factors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Loading predictions...</TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No predictions found.</TableCell>
                  </TableRow>
                )}
                {filtered.map(p => (
                  <TableRow key={p.predictionId}>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Badge className={riskColor(p.riskLevel)}>{p.riskLevel}</Badge></TableCell>
                    <TableCell className="font-mono font-semibold">{p.riskScore}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.healthRecord
                        ? `BMI ${Number(p.healthRecord.bmi).toFixed(1)}, BP ${p.healthRecord.bloodPressure}`
                        : p.healthRecordId
                        ? `Record #${p.healthRecordId}`
                        : "No linked record"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.contributingFactors.join(", ") || "None significant"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
