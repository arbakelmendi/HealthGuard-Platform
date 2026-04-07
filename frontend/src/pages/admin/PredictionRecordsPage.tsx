import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allPredictionRecords } from "@/lib/mockData";
import { BarChart3, Search, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PredictionRecordsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const filtered = allPredictionRecords.filter((p) => {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Prediction Records</h1>
          <p className="text-muted-foreground text-sm">View all prediction records across the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Predictions", value: allPredictionRecords.length },
            { label: "High Risk", value: allPredictionRecords.filter((p) => p.riskLevel === "High").length, color: "text-health-danger" },
            { label: "Medium Risk", value: allPredictionRecords.filter((p) => p.riskLevel === "Medium").length, color: "text-health-warning" },
            { label: "Low Risk", value: allPredictionRecords.filter((p) => p.riskLevel === "Low").length, color: "text-health-success" },
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
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.userName}</TableCell>
                    <TableCell className="text-sm">{p.date}</TableCell>
                    <TableCell><Badge variant="outline" className={riskColor(p.riskLevel)}>{p.riskLevel}</Badge></TableCell>
                    <TableCell className="font-mono">{p.score}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.model}</TableCell>
                    <TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing details for prediction #${p.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
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
