import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { predictionsApi, type AdminPredictionRecordResponse } from "@/lib/api";
import { AdminPageContainer } from "@/components/PageContainers";

export default function PredictionRecordsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [records, setRecords] = useState<AdminPredictionRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    predictionsApi.getAll()
      .then(setRecords)
      .catch(() => toast.error("Could not load prediction records."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((p) => {
    const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || p.riskLevel.toLowerCase() === riskFilter;
    return matchSearch && matchRisk;
  });

  const riskColor = (level: string) => {
    switch (level) {
      case "Low": return "border-health-success text-health-success";
      case "Medium": return "border-health-warning text-health-warning";
      case "High": return "border-health-danger text-health-danger";
      default: return "";
    }
  };

  return (
    <DashboardLayout>
      <AdminPageContainer>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><BarChart3 className="h-7 w-7 text-cyan-400" /> Prediction Records</h1>
          <p className="text-muted-foreground text-sm">View all prediction records across the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Predictions", value: records.length },
            { label: "High Risk", value: records.filter((p) => p.riskLevel === "High").length, color: "text-health-danger" },
            { label: "Medium Risk", value: records.filter((p) => p.riskLevel === "Medium").length, color: "text-health-warning" },
            { label: "Low Risk", value: records.filter((p) => p.riskLevel === "Low").length, color: "text-health-success" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-display font-bold ${s.color || "text-primary"}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base font-display">All Records</CardTitle>
            <div className="flex gap-3">
              <div className="relative w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by user…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">Loading prediction records...</TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">No prediction records found.</TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => (
                  <TableRow key={p.predictionId}>
                    <TableCell className="font-medium">{p.userName}</TableCell>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="outline" className={riskColor(p.riskLevel)}>{p.riskLevel}</Badge></TableCell>
                    <TableCell className="font-mono">{p.riskScore}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.modelName}</TableCell>
                    <TableCell><Badge variant="secondary">Completed</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Prediction #${p.predictionId}: ${p.explanation}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminPageContainer>
    </DashboardLayout>
  );
}
