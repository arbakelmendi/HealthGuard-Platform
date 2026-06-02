import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageContainer } from "@/components/PageContainers";
import { reportsApi, type AnalysisReport, type ClassificationModel, type ClassificationReport, type PredictionHistoryItem, type ReportFormat, type ReportsSummary } from "@/services/reportsApi";

const COLORS = ["hsl(152, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(215, 90%, 32%)"];
const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString();
}

function getMatrixCells(model: ClassificationModel | null) {
  const matrix = model?.confusionMatrix;
  if (!matrix || matrix.length < 2 || matrix[0].length < 2 || matrix[1].length < 2) {
    return null;
  }

  return [
    { label: "True Negative", short: "TN", value: matrix[0][0], className: "bg-health-success/20 text-health-success" },
    { label: "False Positive", short: "FP", value: matrix[0][1], className: "bg-health-danger/20 text-health-danger" },
    { label: "False Negative", short: "FN", value: matrix[1][0], className: "bg-health-danger/20 text-health-danger" },
    { label: "True Positive", short: "TP", value: matrix[1][1], className: "bg-health-success/20 text-health-success" },
  ];
}

function metricChartData(models: ClassificationModel[]) {
  return models.map((model) => ({
    name: model.modelName,
    accuracy: model.accuracy === null || model.accuracy === undefined ? 0 : Math.round(model.accuracy * 1000) / 10,
    precision: model.precision === null || model.precision === undefined ? 0 : Math.round(model.precision * 1000) / 10,
    recall: model.recall === null || model.recall === undefined ? 0 : Math.round(model.recall * 1000) / 10,
    f1: model.f1Score === null || model.f1Score === undefined ? 0 : Math.round(model.f1Score * 1000) / 10,
  }));
}

function getTrendKeys(trends: Array<Record<string, string | number>>) {
  return Array.from(new Set(trends.flatMap((row) => Object.keys(row).filter((key) => key !== "month"))));
}

function getHistoryUserLabel(item: PredictionHistoryItem) {
  const name = item.userName?.trim();
  if (name) return name;
  if (item.userEmail) return item.userEmail;
  return `User #${item.userId}`;
}

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [classification, setClassification] = useState<ClassificationReport | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [reportType, setReportType] = useState("all");
  const [format, setFormat] = useState<ReportFormat>("json");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, classificationData, analysisData, historyData] = await Promise.all([
        reportsApi.getSummary(),
        reportsApi.getClassification(),
        reportsApi.getAnalysis(),
        reportsApi.getHistory(),
      ]);

      setSummary(summaryData);
      setClassification(classificationData);
      setAnalysis(analysisData);
      setHistory(historyData);
    } catch (err) {
      setError("Reports could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const models = useMemo(
    () => [...(classification?.models ?? [])].sort((a, b) => (b.f1Score ?? -1) - (a.f1Score ?? -1)),
    [classification],
  );
  const bestModel = classification?.bestModel ?? models[0] ?? null;
  const matrixCells = getMatrixCells(bestModel);
  const comparisonData = metricChartData(models);
  const trendKeys = getTrendKeys(analysis?.modelUsageTrends ?? []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await reportsApi.generate({ from: fromDate, to: toDate, reportType, format });
      toast.success("Report generated.");
      await loadReports();
    } catch (err) {
      toast.error("Report generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      await reportsApi.exportAll(format);
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPrediction = async (predictionId: number) => {
    try {
      await reportsApi.exportAll(format, predictionId);
      toast.success("Prediction export downloaded.");
    } catch (err) {
      toast.error("Download failed.");
    }
  };

  return (
    <DashboardLayout>
      <AdminPageContainer>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-display font-bold">
              <FileText className={isAdmin ? "h-7 w-7 text-cyan-400" : "h-6 w-6 text-[#14B8C4] stroke-[2.25]"} /> Reports
            </h1>
            <p className="text-muted-foreground text-sm">
              Generate, analyze, and export {isAdmin ? "All Users" : "personal"} health reports.
            </p>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-glow" onClick={handleExportAll} disabled={exporting || loading}>
            <Download className="w-4 h-4 mr-2" /> Export All
          </Button>
        </div>

        {error && <ErrorState message={error} />}

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Generate Report</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerate} className="gradient-primary text-primary-foreground w-full" disabled={generating}>
                  <FileText className="w-4 h-4 mr-1" /> Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Predictions</p>
                {isAdmin && <p className="text-[11px] text-muted-foreground">All Users</p>}
                <p className="text-2xl font-display font-bold text-primary">{summary.predictionCount}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Health Records</p>
                <p className="text-2xl font-display font-bold text-primary">{summary.healthRecordCount}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Generated Reports</p>
                <p className="text-2xl font-display font-bold text-primary">{summary.generatedReportCount}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Average Risk Score</p>
                <p className="text-2xl font-display font-bold text-primary">{summary.averageRiskScore}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="classification">
          <TabsList>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="classification" className="space-y-4">
            {loading ? (
              <EmptyState message="Loading classification reports..." />
            ) : models.length === 0 ? (
              <EmptyState message="No classification model results are available." />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Accuracy", value: formatPercent(bestModel?.accuracy) },
                    { label: "Precision", value: formatPercent(bestModel?.precision) },
                    { label: "Recall", value: formatPercent(bestModel?.recall) },
                    { label: "F1-Score", value: formatPercent(bestModel?.f1Score) },
                  ].map((m) => (
                    <Card key={m.label} className="shadow-card">
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-2xl font-display font-bold text-primary">{m.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base font-display flex items-center justify-between">
                        Confusion Matrix
                        <Badge variant="secondary">{bestModel?.modelName}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {matrixCells ? (
                        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                          {matrixCells.map((cell) => (
                            <div key={cell.short} className={`p-4 rounded-lg text-center ${cell.className}`}>
                              <p className="text-xs font-semibold text-foreground">{cell.label} ({cell.short})</p>
                              <p className="text-2xl font-display font-bold">{cell.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="No confusion matrix is available for this model." />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader><CardTitle className="text-base font-display">Model Comparison</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="accuracy" fill="hsl(215, 90%, 32%)" name="Accuracy %" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="f1" fill="hsl(168, 72%, 40%)" name="F1 %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-card">
                  <CardHeader><CardTitle className="text-base font-display">Classification Model Ranking</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Dataset</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Precision</TableHead>
                          <TableHead>Recall</TableHead>
                          <TableHead>F1-score</TableHead>
                          <TableHead>Training Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {models.map((model, index) => (
                          <TableRow key={model.modelName}>
                            <TableCell>#{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {model.modelName}
                              {index === 0 && <Badge className="ml-2">Best Model</Badge>}
                            </TableCell>
                            <TableCell>{model.datasetName || "N/A"}</TableCell>
                            <TableCell>{formatPercent(model.accuracy)}</TableCell>
                            <TableCell>{formatPercent(model.precision)}</TableCell>
                            <TableCell>{formatPercent(model.recall)}</TableCell>
                            <TableCell>{formatPercent(model.f1Score)}</TableCell>
                            <TableCell>{formatDate(model.trainingDate)}</TableCell>
                            <TableCell>{model.status || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {loading ? (
              <EmptyState message="Loading analysis reports..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-card">
                  <CardHeader><CardTitle className="text-base font-display">Risk Distribution</CardTitle></CardHeader>
                  <CardContent>
                    {(analysis?.riskDistribution.length ?? 0) === 0 ? (
                      <EmptyState message="No prediction risk distribution is available yet." />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={analysis?.riskDistribution ?? []} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={100} label={({ level, percentage }) => `${level}: ${percentage}%`}>
                            {(analysis?.riskDistribution ?? []).map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader><CardTitle className="text-base font-display">Top Feature Importance</CardTitle></CardHeader>
                  <CardContent>
                    {(analysis?.featureImportance.length ?? 0) === 0 ? (
                      <EmptyState message="Feature importance data is not available in the exported ML results." />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={(analysis?.featureImportance ?? []).slice(0, 5)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                          <XAxis type="number" tickFormatter={(v) => `${(Number(v) * 100).toFixed(0)}%`} />
                          <YAxis type="category" dataKey="feature" width={100} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                          <Bar dataKey="importance" fill="hsl(215, 90%, 32%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-card md:col-span-2">
                  <CardHeader><CardTitle className="text-base font-display">Model Usage Trends</CardTitle></CardHeader>
                  <CardContent>
                    {(analysis?.modelUsageTrends.length ?? 0) === 0 || trendKeys.length === 0 ? (
                      <EmptyState message="No model usage trend data is available yet." />
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={analysis?.modelUsageTrends ?? []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {trendKeys.map((key, index) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} name={key} strokeWidth={2} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                {loading ? (
                  <EmptyState message="Loading prediction history..." />
                ) : history.length === 0 ? (
                  <EmptyState message="No prediction history is available yet." />
                ) : (
                  <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          {isAdmin && <TableHead>User</TableHead>}
                          <TableHead>Risk Level</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Factors</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((p) => (
                        <TableRow key={p.predictionId}>
                          <TableCell className="text-sm">{formatDate(p.date)}</TableCell>
                          {isAdmin && (
                            <TableCell className="text-sm">
                              <div className="font-medium">{getHistoryUserLabel(p)}</div>
                              {p.userEmail && <div className="text-xs text-muted-foreground">{p.userEmail}</div>}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">{p.riskLevel}</TableCell>
                          <TableCell className="font-mono">{p.riskScore}%</TableCell>
                          <TableCell className="text-sm">{p.modelName || "N/A"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.contributingFactors.join(", ") || "N/A"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadPrediction(p.predictionId)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminPageContainer>
    </DashboardLayout>
  );
}
