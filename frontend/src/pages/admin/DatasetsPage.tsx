import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { datasetsData } from "@/lib/mockData";
import { Database, Upload, Eye, Archive, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function DatasetsPage() {
  const statusColor = (status: string) => {
    switch (status) {
      case "Active": return "border-health-success text-health-success";
      case "Processing": return "border-health-warning text-health-warning";
      case "Archived": return "border-muted-foreground text-muted-foreground";
      default: return "";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Database className="w-6 h-6" /> Datasets</h1>
            <p className="text-muted-foreground text-sm">Manage training and evaluation datasets.</p>
          </div>
          <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("Upload dialog opened (simulated)")}>
            <Upload className="w-4 h-4 mr-2" /> Upload Dataset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Datasets", value: datasetsData.length },
            { label: "Active", value: datasetsData.filter((d) => d.status === "Active").length, color: "text-health-success" },
            { label: "Total Records", value: datasetsData.reduce((a, d) => a + d.records, 0).toLocaleString() },
            { label: "Classification", value: datasetsData.filter((d) => d.type === "Classification").length, color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-display font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">All Datasets</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasetsData.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="secondary">{d.type}</Badge></TableCell>
                    <TableCell className="font-mono">{d.records.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{d.uploadDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.source}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColor(d.status)}>{d.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing ${d.name}`)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Replace initiated")}><RefreshCw className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.warning(`${d.name} archived`)}><Archive className="w-4 h-4" /></Button>
                      </div>
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
