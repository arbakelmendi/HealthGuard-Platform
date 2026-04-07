import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { riskOverTimeData, healthTrendsData, aiInsights } from "@/lib/mockData";
import { motion } from "framer-motion";

const kpis = [
  { title: "Current Risk Level", value: "Medium", subtitle: "Updated 2h ago", icon: AlertTriangle, color: "text-health-warning", bg: "bg-health-warning/10" },
  { title: "Risk Score", value: "52%", subtitle: "+8% from last week", icon: Activity, color: "text-health-danger", bg: "bg-health-danger/10" },
  { title: "Health Score", value: "74/100", subtitle: "Good condition", icon: CheckCircle, color: "text-health-success", bg: "bg-health-success/10" },
  { title: "Predictions Made", value: "23", subtitle: "This month", icon: TrendingUp, color: "text-health-info", bg: "bg-health-info/10" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, John. Here's your health overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.title}</p>
                      <p className="text-2xl font-display font-bold mt-1">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Risk Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={riskOverTimeData}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 90%, 32%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(215, 90%, 32%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="month" fontSize={12} stroke="hsl(215, 12%, 50%)" />
                  <YAxis fontSize={12} stroke="hsl(215, 12%, 50%)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="risk" stroke="hsl(215, 90%, 32%)" fill="url(#riskGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Health Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={healthTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="week" fontSize={12} stroke="hsl(215, 12%, 50%)" />
                  <YAxis fontSize={12} stroke="hsl(215, 12%, 50%)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="bmi" stroke="hsl(215, 90%, 32%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="sleep" stroke="hsl(168, 72%, 40%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="stress" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <span className="w-2 h-2 rounded-full gradient-primary animate-pulse-glow" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    insight.type === "warning" ? "bg-health-warning/10" :
                    insight.type === "success" ? "bg-health-success/10" : "bg-health-info/10"
                  }`}
                >
                  <Badge variant="outline" className={`text-xs shrink-0 ${
                    insight.type === "warning" ? "border-health-warning text-health-warning" :
                    insight.type === "success" ? "border-health-success text-health-success" : "border-health-info text-health-info"
                  }`}>
                    {insight.type === "warning" ? "Alert" : insight.type === "success" ? "Positive" : "Info"}
                  </Badge>
                  <p className="text-sm">{insight.text}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
