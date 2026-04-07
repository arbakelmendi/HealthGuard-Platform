import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { predictionHistoryData, confusionMatrixData, predVsActualData, riskDistributionData, modelUsageTrendsData, featureImportanceData } from "@/lib/mockData";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(152, 60%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm">Generate, analyze, and export health reports.</p>
          </div>
          <Button variant="outline" onClick={() => toast.success("Exported!")}>
            <Download className="w-4 h-4 mr-2" /> Export All
          </Button>
        </div>

        {/* Generate Report */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Generate Report</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" defaultValue="2026-03-01" />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" defaultValue="2026-04-07" />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => toast.success("Report generated!")} className="gradient-primary text-primary-foreground w-full">
                  <FileText className="w-4 h-4 mr-1" /> Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="classification">
          <TabsList>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="regression">Regression</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Classification Reports */}
          <TabsContent value="classification" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Accuracy", value: "91.0%" },
                { label: "Precision", value: "90.0%" },
                { label: "Recall", value: "92.0%" },
                { label: "F1-Score", value: "91.0%" },
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
              {/* Confusion Matrix */}
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base font-display">Confusion Matrix</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                    <div className="p-4 rounded-lg bg-health-success/20 text-center">
                      <p className="text-xs text-muted-foreground">True Positive</p>
                      <p className="text-2xl font-display font-bold text-health-success">{confusionMatrixData.truePositive}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-health-danger/20 text-center">
                      <p className="text-xs text-muted-foreground">False Positive</p>
                      <p className="text-2xl font-display font-bold text-health-danger">{confusionMatrixData.falsePositive}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-health-danger/20 text-center">
                      <p className="text-xs text-muted-foreground">False Negative</p>
                      <p className="text-2xl font-display font-bold text-health-danger">{confusionMatrixData.falseNegative}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-health-success/20 text-center">
                      <p className="text-xs text-muted-foreground">True Negative</p>
                      <p className="text-2xl font-display font-bold text-health-success">{confusionMatrixData.trueNegative}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model Comparison */}
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base font-display">Model Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: "Logistic Reg.", accuracy: 87, f1: 87 },
                      { name: "KNN", accuracy: 82, f1: 82 },
                      { name: "Random Forest", accuracy: 91, f1: 91 },
                      { name: "Neural Net", accuracy: 93, f1: 93 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="accuracy" fill="hsl(215, 90%, 32%)" name="Accuracy %" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="f1" fill="hsl(168, 72%, 40%)" name="F1 %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Regression Reports */}
          <TabsContent value="regression" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "MAE", value: "2.3" },
                { label: "MSE", value: "8.4" },
                { label: "RMSE", value: "3.1" },
                { label: "R²", value: "0.92" },
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
                <CardHeader><CardTitle className="text-base font-display">Predicted vs Actual</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                      <XAxis dataKey="actual" name="Actual" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="predicted" name="Predicted" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Scatter data={predVsActualData} fill="hsl(215, 90%, 32%)" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base font-display">Residual Analysis</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={predVsActualData.map((d) => ({ residual: d.predicted - d.actual, index: d.actual }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                      <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="residual" fill="hsl(168, 72%, 40%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Reports */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Distribution */}
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base font-display">Risk Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={riskDistributionData} dataKey="count" nameKey="level" cx="50%" cy="50%" outerRadius={100} label={({ level, percentage }) => `${level}: ${percentage}%`}>
                        {riskDistributionData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Feature Importance (Top 5) */}
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base font-display">Top Feature Importance</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={featureImportanceData.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                      <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                      <YAxis type="category" dataKey="feature" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                      <Bar dataKey="importance" fill="hsl(215, 90%, 32%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Model Usage Trends */}
              <Card className="shadow-card md:col-span-2">
                <CardHeader><CardTitle className="text-base font-display">Model Usage Trends</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={modelUsageTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="randomForest" stroke="hsl(215, 90%, 32%)" name="Random Forest" strokeWidth={2} />
                      <Line type="monotone" dataKey="neuralNetwork" stroke="hsl(168, 72%, 40%)" name="Neural Network" strokeWidth={2} />
                      <Line type="monotone" dataKey="logistic" stroke="hsl(38, 92%, 50%)" name="Logistic Reg." strokeWidth={2} />
                      <Line type="monotone" dataKey="xgboost" stroke="hsl(0, 72%, 51%)" name="XGBoost" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Factors</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictionHistoryData.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{p.date}</TableCell>
                        <TableCell className="font-medium">{p.riskLevel}</TableCell>
                        <TableCell className="font-mono">{p.score}%</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.factors}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toast.success("Downloaded!")}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
