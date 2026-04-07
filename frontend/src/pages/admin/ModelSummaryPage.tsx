import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mlModelsData } from "@/lib/mockData";
import { Brain, TrendingUp, Target, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{(value * 100).toFixed(1)}%</span>
      </div>
      <Progress value={value * 100} className="h-2" />
    </div>
  );
}

export default function ModelSummaryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Brain className="w-6 h-6" /> Model Summary</h1>
          <p className="text-muted-foreground text-sm">Overview of all trained models and their performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Models", value: Object.values(mlModelsData).flat().length, icon: Brain, color: "text-primary" },
            { label: "Active Models", value: Object.values(mlModelsData).flat().filter(m => m.status === "Active").length, icon: Zap, color: "text-health-success" },
            { label: "Best Accuracy", value: "93.0%", icon: Target, color: "text-health-info" },
            { label: "Avg. F1 Score", value: "88.3%", icon: TrendingUp, color: "text-health-warning" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-display font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="classification">
          <TabsList>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="regression">Regression</TabsTrigger>
            <TabsTrigger value="clustering">Clustering</TabsTrigger>
          </TabsList>

          <TabsContent value="classification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mlModelsData.classification.map((m) => (
                <Card key={m.id} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display">{m.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{m.version}</Badge>
                        <Badge variant="outline" className="border-health-success text-health-success">{m.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Dataset: {m.dataset} · Last trained: {m.lastTrained}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <MetricBar label="Accuracy" value={m.accuracy} />
                    <MetricBar label="Precision" value={m.precision} />
                    <MetricBar label="Recall" value={m.recall} />
                    <MetricBar label="F1 Score" value={m.f1} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regression">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mlModelsData.regression.map((m) => (
                <Card key={m.id} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display">{m.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{m.version}</Badge>
                        <Badge variant="outline" className={m.status === "Training" ? "border-health-warning text-health-warning" : "border-health-success text-health-success"}>{m.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Dataset: {m.dataset} · Last trained: {m.lastTrained}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">RMSE</p>
                        <p className="text-lg font-display font-bold">{m.rmse}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">MAE</p>
                        <p className="text-lg font-display font-bold">{m.mae}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">R²</p>
                        <p className="text-lg font-display font-bold">{m.r2}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clustering">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mlModelsData.clustering.map((m) => (
                <Card key={m.id} className="shadow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display">{m.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{m.version}</Badge>
                        <Badge variant="outline" className={m.status === "Active" ? "border-health-success text-health-success" : "border-muted-foreground text-muted-foreground"}>{m.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Dataset: {m.dataset} · Last trained: {m.lastTrained}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Silhouette Score</p>
                        <p className="text-lg font-display font-bold">{m.silhouette}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Clusters</p>
                        <p className="text-lg font-display font-bold">{m.clusters}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
