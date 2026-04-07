import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { symptomHistoryData } from "@/lib/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

export default function SymptomsPage() {
  const [search, setSearch] = useState("");
  const filtered = symptomHistoryData.filter(s =>
    s.symptom.toLowerCase().includes(search.toLowerCase())
  );

  const severityColor = (s: string) =>
    s === "Severe" ? "bg-health-danger/10 text-health-danger border-health-danger" :
    s === "Moderate" ? "bg-health-warning/10 text-health-warning border-health-warning" :
    "bg-health-success/10 text-health-success border-health-success";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Symptoms</h1>
            <p className="text-muted-foreground text-sm">Log and track your symptoms over time.</p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base font-display">Log New Symptom</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Symptom</Label>
                <Input placeholder="e.g. Headache" />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input placeholder="e.g. 2 hours" />
              </div>
              <div className="flex items-end">
                <Button onClick={() => toast.success("Symptom logged!")} className="gradient-primary text-primary-foreground w-full">
                  <Plus className="w-4 h-4 mr-1" /> Log
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Symptom History</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-48 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symptom</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{s.date}</TableCell>
                    <TableCell className="font-medium">{s.symptom}</TableCell>
                    <TableCell><Badge variant="outline" className={severityColor(s.severity)}>{s.severity}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.duration}</TableCell>
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
