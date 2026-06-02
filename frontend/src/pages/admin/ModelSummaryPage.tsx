import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Medal, Target, TrendingUp, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageContainer } from "@/components/PageContainers";
import {
  modelSummaryApi,
  type ClassificationModelSummary,
  type ClusteringModelSummary,
  type ModelSummaryResponse,
} from "@/services/modelSummaryApi";

type RankedClassificationModel = ClassificationModelSummary & {
  rank: number;
  isBest: boolean;
};

function MetricBar({ label, value }: { label: string; value?: number | null }) {
  const normalized = typeof value === "number" ? value : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{formatPercent(value)}</span>
      </div>
      <Progress value={normalized * 100} className="h-2" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6 text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  );
}

function formatPercent(value?: number | null) {
  return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "N/A";
}

function formatMetric(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(3) : "N/A";
}

function formatDate(value?: string | null) {
  return value || "N/A";
}

function toFiniteNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatJsonValue(value: unknown): string {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value)) return `[${value.join(", ")}]`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Hyperparameters({ values }: { values?: Record<string, unknown> | null }) {
  const entries = Object.entries(values ?? {});

  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">Best hyperparameters: N/A</p>;
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">Best Hyperparameters</p>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <Badge key={key} variant="secondary" className="font-mono text-[11px]">
            {key}: {formatJsonValue(value)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ConfusionMatrix({ matrix }: { matrix?: number[][] | null }) {
  if (!matrix || matrix.length === 0) {
    return <p className="text-xs text-muted-foreground">Confusion matrix: N/A</p>;
  }

  const cells = [
    { label: "True Negative", shortLabel: "TN", value: matrix[0]?.[0], tone: "border-health-success/50 bg-health-success/10 text-health-success" },
    { label: "False Positive", shortLabel: "FP", value: matrix[0]?.[1], tone: "border-health-warning/50 bg-health-warning/10 text-health-warning" },
    { label: "False Negative", shortLabel: "FN", value: matrix[1]?.[0], tone: "border-destructive/50 bg-destructive/10 text-destructive" },
    { label: "True Positive", shortLabel: "TP", value: matrix[1]?.[1], tone: "border-health-success/50 bg-health-success/10 text-health-success" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">Confusion Matrix</p>
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-2">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-center text-[11px] font-medium text-muted-foreground">
          <div />
          <div className="rounded bg-muted/60 px-2 py-1">Predicted 0</div>
          <div className="rounded bg-muted/60 px-2 py-1">Predicted 1</div>

          <div className="flex items-center justify-end rounded bg-muted/60 px-2 py-1 text-right">Actual 0</div>
          {cells.slice(0, 2).map((cell) => (
            <div key={cell.shortLabel} className={`min-w-0 rounded border px-2 py-2 ${cell.tone}`}>
              <div className="text-[10px] font-semibold uppercase">{cell.shortLabel}</div>
              <div className="text-[11px] leading-tight text-foreground">{cell.label}</div>
              <div className="mt-1 font-mono text-lg font-bold text-foreground">{cell.value ?? "N/A"}</div>
            </div>
          ))}

          <div className="flex items-center justify-end rounded bg-muted/60 px-2 py-1 text-right">Actual 1</div>
          {cells.slice(2).map((cell) => (
            <div key={cell.shortLabel} className={`min-w-0 rounded border px-2 py-2 ${cell.tone}`}>
              <div className="text-[10px] font-semibold uppercase">{cell.shortLabel}</div>
              <div className="text-[11px] leading-tight text-foreground">{cell.label}</div>
              <div className="mt-1 font-mono text-lg font-bold text-foreground">{cell.value ?? "N/A"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassificationCard({ model }: { model: RankedClassificationModel }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-display">{model.modelName}</CardTitle>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="secondary">Rank #{model.rank}</Badge>
            {model.isBest && <Badge className="bg-health-success text-white">Best Model</Badge>}
            <Badge variant="outline" className="border-health-success text-health-success">{model.status}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Dataset: {model.datasetName} - Last trained: {formatDate(model.trainingDate)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <MetricBar label="Accuracy" value={model.accuracy} />
        <MetricBar label="Precision" value={model.precision} />
        <MetricBar label="Recall" value={model.recall} />
        <MetricBar label="F1 Score" value={model.f1Score} />
        <ConfusionMatrix matrix={model.confusionMatrix} />
        <Hyperparameters values={model.bestHyperparameters} />
      </CardContent>
    </Card>
  );
}

function ClusteringCard({ model }: { model: ClusteringModelSummary }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-display">{model.modelName}</CardTitle>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="secondary">{model.modelType}</Badge>
            <Badge variant="outline" className={model.status === "Active" ? "border-health-success text-health-success" : "border-muted-foreground text-muted-foreground"}>{model.status}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Dataset: {model.datasetName} - Last trained: {formatDate(model.trainingDate)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Algorithm</p>
            <p className="text-lg font-display font-bold">{model.algorithmName || model.modelName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Clusters</p>
            <p className="text-lg font-display font-bold">{model.numberOfClusters ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Silhouette Score</p>
            <p className="text-lg font-display font-bold">{formatMetric(model.silhouetteScore)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cluster/Class Match</p>
            <p className="text-lg font-display font-bold">{formatMetric(toFiniteNumber(model.labelComparison?.score))}</p>
          </div>
        </div>
        {model.labelComparison && (
          <p className="text-xs text-muted-foreground">
            Label comparison: {String(model.labelComparison.metric ?? "Score")} {String(model.labelComparison.score ?? "N/A")}
          </p>
        )}
        {model.pcaVisualization && (
          <p className="text-xs text-muted-foreground">
            PCA visualization: {String(model.pcaVisualization.components ?? "N/A")} components, {String(model.pcaVisualization.xAxis ?? "PCA 1")} vs {String(model.pcaVisualization.yAxis ?? "PCA 2")}
          </p>
        )}
        <Hyperparameters values={model.bestHyperparameters} />
      </CardContent>
    </Card>
  );
}

function ComparisonTable({ models }: { models: RankedClassificationModel[] }) {
  if (models.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">Classification Comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3">Rank</th>
              <th className="py-2 pr-3">Model</th>
              <th className="py-2 pr-3">Dataset</th>
              <th className="py-2 pr-3">Accuracy</th>
              <th className="py-2 pr-3">Precision</th>
              <th className="py-2 pr-3">Recall</th>
              <th className="py-2 pr-3">F1-score</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id || model.modelName} className="border-b last:border-0">
                <td className="py-2 pr-3 font-mono">#{model.rank}</td>
                <td className="py-2 pr-3 font-medium">{model.modelName}</td>
                <td className="py-2 pr-3 text-muted-foreground">{model.datasetName}</td>
                <td className="py-2 pr-3 font-mono">{formatPercent(model.accuracy)}</td>
                <td className="py-2 pr-3 font-mono">{formatPercent(model.precision)}</td>
                <td className="py-2 pr-3 font-mono">{formatPercent(model.recall)}</td>
                <td className="py-2 pr-3 font-mono">{formatPercent(model.f1Score)}</td>
                <td className="py-2 pr-3">{model.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function MetricsChart({ models }: { models: RankedClassificationModel[] }) {
  if (models.length === 0) return null;

  const chartData = models.map((model) => ({
    name: model.modelName,
    Accuracy: Math.round((model.accuracy ?? 0) * 1000) / 10,
    Precision: Math.round((model.precision ?? 0) * 1000) / 10,
    Recall: Math.round((model.recall ?? 0) * 1000) / 10,
    "F1-score": Math.round((model.f1Score ?? 0) * 1000) / 10,
  }));

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">Metrics Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, ""]} />
            <Legend />
            <Bar dataKey="Accuracy" fill="#14B8C4" />
            <Bar dataKey="Precision" fill="#22C55E" />
            <Bar dataKey="Recall" fill="#F59E0B" />
            <Bar dataKey="F1-score" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function ModelSummaryPage() {
  const [summary, setSummary] = useState<ModelSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    modelSummaryApi.get()
      .then((data) => {
        if (!isMounted) return;
        setSummary(data);
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Model summary data could not be loaded.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const rankedClassification = useMemo<RankedClassificationModel[]>(() => {
    const sorted = [...(summary?.classification ?? [])].sort((a, b) => (b.f1Score ?? -1) - (a.f1Score ?? -1));
    const bestId = sorted[0]?.id;
    return sorted.map((model, index) => ({
      ...model,
      rank: index + 1,
      isBest: !!bestId && model.id === bestId,
    }));
  }, [summary]);

  const clusteringModels = summary?.clustering ?? [];

  const allModels = useMemo(() => [
    ...rankedClassification,
    ...clusteringModels,
  ], [clusteringModels, rankedClassification]);

  const bestModel = rankedClassification[0] ?? null;

  const averageAccuracy = useMemo(() => {
    const values = rankedClassification
      .map((model) => model.accuracy)
      .filter((value): value is number => typeof value === "number");
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }, [rankedClassification]);

  const averageF1 = useMemo(() => {
    const values = rankedClassification
      .map((model) => model.f1Score)
      .filter((value): value is number => typeof value === "number");
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }, [rankedClassification]);

  const lastTrainingDate = useMemo(() => {
    const dates = allModels
      .map((model) => model.trainingDate)
      .filter((value): value is string => !!value)
      .sort((a, b) => b.localeCompare(a));
    return dates[0] ?? null;
  }, [allModels]);

  return (
    <DashboardLayout>
      <AdminPageContainer>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Brain className="h-7 w-7 text-cyan-400" /> Model Summary</h1>
          <p className="text-muted-foreground text-sm">Overview of all trained models and their performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Models", value: loading ? "..." : allModels.length, icon: Brain, color: "text-primary" },
            { label: "Active Models", value: loading ? "..." : allModels.filter((m) => m.status === "Active").length, icon: Zap, color: "text-health-success" },
            { label: "Best Accuracy", value: loading ? "..." : formatPercent(bestModel?.accuracy), icon: Target, color: "text-health-info" },
            { label: "Avg. F1 Score", value: loading ? "..." : formatPercent(averageF1), icon: TrendingUp, color: "text-health-warning" },
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

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2"><Medal className="size-4 text-health-warning" /> ML Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Models Trained</p>
              <p className="text-lg font-display font-bold">{loading ? "..." : allModels.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Performing Model</p>
              <p className="text-lg font-display font-bold">{loading ? "..." : bestModel?.modelName ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Accuracy</p>
              <p className="text-lg font-display font-bold">{loading ? "..." : formatPercent(averageAccuracy)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average F1-score</p>
              <p className="text-lg font-display font-bold">{loading ? "..." : formatPercent(averageF1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Training Date</p>
              <p className="text-lg font-display font-bold">{loading ? "..." : formatDate(lastTrainingDate)}</p>
            </div>
          </CardContent>
        </Card>

        {loading && <EmptyState message="Loading model summary data..." />}
        {error && <EmptyState message={error} />}

        {!loading && !error && (
          <Tabs defaultValue="classification">
            <TabsList>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="clustering">Clustering</TabsTrigger>
            </TabsList>

            <TabsContent value="classification">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rankedClassification.length === 0 && <EmptyState message="No classification model results are available." />}
                {rankedClassification.map((model) => <ClassificationCard key={model.id || model.modelName} model={model} />)}
              </div>
              <div className="mt-4 space-y-4">
                <ComparisonTable models={rankedClassification} />
                <MetricsChart models={rankedClassification} />
              </div>
            </TabsContent>

            <TabsContent value="clustering">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clusteringModels.length === 0 && <EmptyState message="No clustering model results are available." />}
                {clusteringModels.map((model) => <ClusteringCard key={model.id || model.modelName} model={model} />)}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </AdminPageContainer>
    </DashboardLayout>
  );
}
