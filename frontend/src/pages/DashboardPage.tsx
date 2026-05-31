import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  Droplet,
  Heart,
  LayoutDashboard,
  MessageSquareHeart,
  Moon,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiInsights, healthTrendsData, notificationsData, predictionHistoryData } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { UserPageContainer } from "@/components/PageContainers";

const pillars = [
  { label: "Cardio", value: 88, icon: Heart },
  { label: "Sleep", value: 79, icon: Moon },
  { label: "Hydration", value: 62, icon: Droplet },
  { label: "Stress", value: 84, icon: Brain },
];

const timeline = [
  { time: "08:10", title: "Profile synced", desc: "Latest vitals are ready for prediction.", tone: "ok" },
  { time: "11:45", title: "Hydration below target", desc: "Recommendation priority increased.", tone: "warn" },
  { time: "15:20", title: "Risk trend stable", desc: "No acute movement in the last prediction.", tone: "ok" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.firstName || "there";
  const healthScore = 82;

  return (
    <DashboardLayout>
      <UserPageContainer>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              <LayoutDashboard className="h-7 w-7 text-[#14B8C4] stroke-[2.25]" /> Good morning, {displayName}.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/symptoms"><MessageSquareHeart className="mr-2 size-4" />Log symptom</Link>
            </Button>
            <Button asChild>
              <Link to="/risk-assessment"><Plus className="mr-2 size-4" />New prediction</Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 md:p-8">
            <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <div className="relative mx-auto size-48">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#healthScoreGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - healthScore / 100) }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="healthScoreGradient" x1="0" x2="1">
                      <stop offset="0%" stopColor="hsl(186 72% 42%)" />
                      <stop offset="100%" stopColor="hsl(45 92% 58%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="font-display text-5xl font-bold gradient-text">{healthScore}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">HealthScore</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">This week</p>
                  <h2 className="mt-1 text-2xl font-bold">You're trending up.</h2>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">Cardio and sleep pillars improved. Hydration needs attention.</p>
                </div>
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthTrendsData}>
                      <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: "0", boxShadow: "var(--shadow-soft)" }} />
                      <Line type="monotone" dataKey="sleep" stroke="hsl(186 72% 42%)" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pillars.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="glass-card rounded-2xl p-3">
                      <Icon className="size-4 text-primary" />
                      <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
                      <div className="font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI insights</h3>
                <Badge className="border-0 bg-primary/10 text-primary">Today</Badge>
              </div>
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <motion.div key={insight.text} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="flex gap-3 rounded-2xl bg-white/60 p-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl gradient-soft">
                      {insight.type === "warning" ? <AlertTriangle className="size-4 text-amber-600" /> : <Sparkles className="size-4 text-primary" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{insight.type === "warning" ? "Action suggested" : "Insight"}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{insight.text}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Today's wellness</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Your day, scored in real time.</p>
                </div>
                <TrendingUp className="size-5 text-primary" />
              </div>
              <ol className="relative pl-6">
                <span className="absolute bottom-1 left-2 top-1 w-px bg-border" />
                {timeline.map((item) => (
                  <li key={item.time} className="relative pb-5 last:pb-0">
                    <span className={`absolute -left-[18px] top-1 size-3 rounded-full ring-4 ring-white ${item.tone === "ok" ? "bg-primary" : "bg-amber-400"}`} />
                    <div className="text-[11px] text-muted-foreground">{item.time}</div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {[
              { to: "/symptoms", icon: MessageSquareHeart, title: "Assistant", desc: "Ask about symptoms" },
              { to: "/my-profile", icon: Heart, title: "Profile", desc: "Refine inputs" },
              { to: "/reports", icon: TrendingUp, title: "Reports", desc: "Health exports" },
              { to: "/predictions", icon: Activity, title: "History", desc: "Past predictions" },
            ].map(({ to, icon: Icon, title, desc }) => (
              <Link key={to} to={to} className="glass-card block rounded-3xl p-5 transition hover:-translate-y-1">
                <div className="grid size-11 place-items-center rounded-2xl gradient-soft">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="mt-3 font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent predictions</h3>
                <Link to="/predictions" className="text-xs font-medium text-primary">View all</Link>
              </div>
              <div className="space-y-2">
                {predictionHistoryData.slice(0, 4).map((prediction) => (
                  <div key={prediction.id} className="flex items-center gap-4 rounded-2xl p-3 hover:bg-white/70">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{prediction.riskLevel} risk assessment</div>
                      <div className="text-xs text-muted-foreground">{prediction.date} · {prediction.factors}</div>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full gradient-primary" style={{ width: `${prediction.score}%` }} />
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{prediction.score}% risk</div>
                    </div>
                    <Badge variant="outline" className="rounded-full">{prediction.riskLevel}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <Link to="/notifications" className="text-xs font-medium text-primary">Open inbox</Link>
              </div>
              <div className="space-y-2">
                {notificationsData.slice(0, 4).map((notification) => (
                  <div key={notification.id} className="flex gap-3 rounded-2xl p-3 hover:bg-white/70">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Bell className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{notification.title}</div>
                      <div className="text-xs text-muted-foreground">{notification.message}</div>
                    </div>
                    <div className="whitespace-nowrap text-[11px] text-muted-foreground">{notification.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </UserPageContainer>
    </DashboardLayout>
  );
}
