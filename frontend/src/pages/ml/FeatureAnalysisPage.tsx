import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featureImportanceData, correlationData } from "@/lib/mockData";
import { FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function FeatureAnalysisPage() {
  const selected = featureImportanceData.filter((f) => f.selected);
  const removed = featureImportanceData.filter((f) => !f.selected);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><FlaskConical className="w-6 h-6" /> Feature Analysis</h1>
          <p className="text-muted-foreground text-sm">Analyze feature importance, correlations, and selection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Features</p>
              <p className="text-2xl font-display font-bold">{featureImportanceData.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Selected Features</p>
              <p className="text-2xl font-display font-bold text-health-success">{selected.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Removed Features</p>
              <p className="text-2xl font-display font-bold text-health-danger">{removed.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Importance Chart */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Feature Importance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis type="number" domain={[0, 0.25]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportanceData.map((entry, i) => (
                    <Cell key={i} fill={entry.selected ? "hsl(215, 90%, 32%)" : "hsl(214, 20%, 90%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selected Features */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-health-success" /> Selected Features</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selected.map((f) => (
                  <div key={f.feature} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <span className="text-sm font-medium">{f.feature}</span>
                    <Badge variant="secondary">{(f.importance * 100).toFixed(0)}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Removed Features */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><XCircle className="w-4 h-4 text-health-danger" /> Removed Features</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {removed.map((f) => (
                  <div key={f.feature} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <span className="text-sm font-medium text-muted-foreground">{f.feature}</span>
                    <Badge variant="outline">{(f.importance * 100).toFixed(0)}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Correlation Heatmap (simplified) */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Feature Correlations</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {correlationData.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg text-center text-xs"
                  style={{
                    backgroundColor: c.value > 0
                      ? `hsl(215, 90%, ${80 - Math.abs(c.value) * 40}%)`
                      : `hsl(0, 72%, ${80 - Math.abs(c.value) * 30}%)`,
                    color: Math.abs(c.value) > 0.5 ? "white" : "inherit",
                  }}
                >
                  <p className="font-medium">{c.x} ↔ {c.y}</p>
                  <p className="font-mono text-sm mt-1">{c.value > 0 ? "+" : ""}{c.value.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Ranking */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Feature Ranking</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featureImportanceData.map((f, i) => (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{f.feature}</span>
                      <span className="text-xs font-mono text-muted-foreground">{(f.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${f.importance * 400}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
