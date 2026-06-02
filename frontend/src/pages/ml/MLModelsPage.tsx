import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mlModelsData } from "@/lib/mockData";
import { Cpu, Clock } from "lucide-react";

export default function MLModelsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Cpu className="w-6 h-6" /> ML Models</h1>
          <p className="text-muted-foreground text-sm">All machine learning models organized by category.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Classification", count: mlModelsData.classification.length, color: "gradient-primary" },
            { label: "Clustering", count: mlModelsData.clustering.length, color: "gradient-risk-medium" },
          ].map((c) => (
            <Card key={c.label} className="shadow-card overflow-hidden">
              <div className={`h-1 ${c.color}`} />
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{c.label} Models</p>
                <p className="text-3xl font-display font-bold">{c.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold mb-3">Classification Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mlModelsData.classification.map((m) => (
              <Card key={m.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-display">{m.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Dataset: {m.dataset}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary">{m.version}</Badge>
                      <Badge variant="outline" className="border-health-success text-health-success">{m.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> Last trained: {m.lastTrained}</div>
                  {[
                    { label: "Accuracy", value: m.accuracy },
                    { label: "Precision", value: m.precision },
                    { label: "Recall", value: m.recall },
                    { label: "F1", value: m.f1 },
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{metric.label}</span><span className="font-mono">{(metric.value * 100).toFixed(1)}%</span></div>
                      <Progress value={metric.value * 100} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold mb-3">Clustering Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mlModelsData.clustering.map((m) => (
              <Card key={m.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-display">{m.name}</CardTitle>
                    <Badge variant="outline" className={m.status === "Active" ? "border-health-success text-health-success" : "border-muted-foreground text-muted-foreground"}>{m.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Silhouette</p>
                      <p className="text-lg font-display font-bold">{m.silhouette}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Clusters</p>
                      <p className="text-lg font-display font-bold">{m.clusters}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
