import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { predictionHistoryData, riskOverTimeData } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function PredictionsPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? predictionHistoryData : predictionHistoryData.filter(p => p.riskLevel === filter);

  const riskColor = (level: string) =>
    level === "High" ? "gradient-risk-high text-primary-foreground" :
    level === "Medium" ? "gradient-risk-medium text-primary-foreground" :
    "gradient-risk-low text-primary-foreground";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Predictions</h1>
          <p className="text-muted-foreground text-sm">History of AI risk predictions and trends.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base font-display">Prediction Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(215, 12%, 50%)" />
                <YAxis fontSize={12} stroke="hsl(215, 12%, 50%)" />
                <Tooltip />
                <Bar dataKey="risk" fill="hsl(215, 90%, 32%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activity" fill="hsl(168, 72%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Past Predictions</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Key Factors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.date}</TableCell>
                    <TableCell><Badge className={riskColor(p.riskLevel)}>{p.riskLevel}</Badge></TableCell>
                    <TableCell className="font-mono font-semibold">{p.score}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.factors}</TableCell>
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
