import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tuningHistoryData, mlModelsData, datasetsData } from "@/lib/mockData";
import { SlidersHorizontal, Play, Save, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ModelTuningPage() {
  const [selectedModel, setSelectedModel] = useState("random-forest");
  const [selectedDataset, setSelectedDataset] = useState("heart-disease");
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);

  const startTraining = () => {
    setTraining(true);
    setProgress(0);
    setTrainingComplete(false);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTraining(false);
          setTrainingComplete(true);
          toast.success("Model training complete!");
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><SlidersHorizontal className="w-6 h-6" /> Model Tuning</h1>
          <p className="text-muted-foreground text-sm">Configure, tune, and retrain machine learning models.</p>
        </div>

        {/* Configuration */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Training Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random-forest">Random Forest</SelectItem>
                    <SelectItem value="neural-network">Neural Network</SelectItem>
                    <SelectItem value="logistic-regression">Logistic Regression</SelectItem>
                    <SelectItem value="xgboost">XGBoost Regressor</SelectItem>
                    <SelectItem value="knn">K-Nearest Neighbors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dataset</Label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {datasetsData.filter((d) => d.status === "Active").map((d) => (
                      <SelectItem key={d.id} value={d.name.toLowerCase().replace(/ /g, "-")}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Variable</Label>
                <Select defaultValue="risk-level">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk-level">Risk Level</SelectItem>
                    <SelectItem value="risk-score">Risk Score</SelectItem>
                    <SelectItem value="blood-pressure">Blood Pressure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hyperparameters */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Hyperparameters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">n_estimators</Label>
                <Input type="number" defaultValue="200" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">max_depth</Label>
                <Input type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">learning_rate</Label>
                <Input type="number" step="0.001" defaultValue="0.01" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">min_samples_split</Label>
                <Input type="number" defaultValue="5" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="gradient-primary text-primary-foreground" onClick={startTraining} disabled={training}>
                <Play className="w-4 h-4 mr-2" /> {training ? "Training…" : "Retrain Model"}
              </Button>
              <Button variant="outline" onClick={() => toast.success("Model version saved!")} disabled={!trainingComplete}>
                <Save className="w-4 h-4 mr-2" /> Save New Version
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <AnimatePresence>
          {(training || trainingComplete) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    {training ? <Clock className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 text-health-success" />}
                    {training ? "Training in Progress…" : "Training Complete"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                  <p className="text-sm text-muted-foreground">{Math.min(Math.round(progress), 100)}% complete</p>
                  {trainingComplete && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground">Before</p>
                        <p className="text-lg font-display font-bold">88.0%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground">After</p>
                        <p className="text-lg font-display font-bold text-health-success">91.4%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground">Improvement</p>
                        <p className="text-lg font-display font-bold text-health-success">+3.4%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground">Training Time</p>
                        <p className="text-lg font-display font-bold">42s</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tuning History */}
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Tuning History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Parameters</TableHead>
                  <TableHead>Before</TableHead>
                  <TableHead>After</TableHead>
                  <TableHead>Improvement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuningHistoryData.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.model}</TableCell>
                    <TableCell className="text-sm">{t.date}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{t.params}</TableCell>
                    <TableCell className="font-mono">{(t.beforeAccuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono">{(t.afterAccuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell><Badge variant="outline" className="border-health-success text-health-success">{t.improvement}</Badge></TableCell>
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
