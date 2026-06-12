import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  Droplet,
  Heart,
  LayoutDashboard,
  Loader2,
  MessageSquareHeart,
  Moon,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPageContainer } from "@/components/PageContainers";
import { useNotifications } from "@/contexts/NotificationsContext";
import { dashboardApi, type DashboardResponse } from "@/services/dashboardApi";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const formatRelativeTime = (value: string) => {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  if (elapsedMinutes < 1) return "Now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatShortDate(value);
};

const scoreText = (score: number | null) => score === null ? "No data" : `${score}`;

export default function DashboardPage() {
  const { setUnreadCount } = useNotifications();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getMine();
      setDashboard(data);
      setUnreadCount(data.notificationsCount);
    } catch {
      setError("Could not load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const trendSummary = useMemo(() => {
    if (!dashboard || dashboard.weeklyTrend.length < 2) {
      return {
        title: "More data is needed for a trend.",
        description: "Add another health record or prediction to see how your score changes.",
      };
    }

    const first = dashboard.weeklyTrend[0].score;
    const last = dashboard.weeklyTrend[dashboard.weeklyTrend.length - 1].score;
    const change = last - first;
    if (change === 0) {
      return { title: "Your score is stable.", description: "There was no score change across your latest records." };
    }

    return {
      title: change > 0 ? "You're trending up." : "Your score needs attention.",
      description: `Your calculated health score changed by ${Math.abs(change)} point${Math.abs(change) === 1 ? "" : "s"} across your latest records.`,
    };
  }, [dashboard]);

  if (loading) {
    return (
      <DashboardLayout>
        <UserPageContainer>
          <Card className="rounded-3xl">
            <CardContent className="flex min-h-[420px] items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading your health dashboard...
            </CardContent>
          </Card>
        </UserPageContainer>
      </DashboardLayout>
    );
  }

  if (error || !dashboard) {
    return (
      <DashboardLayout>
        <UserPageContainer>
          <Card className="rounded-3xl">
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="size-8 text-health-danger" />
              <h1 className="mt-4 font-display text-xl font-semibold">Dashboard unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button className="mt-5" onClick={() => void loadDashboard()}>
                <RefreshCw className="mr-2 size-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        </UserPageContainer>
      </DashboardLayout>
    );
  }

  const pillars = [
    { label: "Cardio", value: dashboard.cardioScore, icon: Heart },
    { label: "Sleep", value: dashboard.sleepScore, icon: Moon },
    { label: "Hydration", value: dashboard.hydrationScore, icon: Droplet },
    { label: "Stress", value: dashboard.stressScore, icon: Brain },
  ];

  return (
    <DashboardLayout>
      <UserPageContainer>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{formatDate(dashboard.currentDate)}</p>
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              <LayoutDashboard className="h-7 w-7 text-[#14B8C4] stroke-[2.25]" /> Hello, {dashboard.userName}.
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
                  {dashboard.healthScore !== null && (
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
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - dashboard.healthScore / 100) }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                    />
                  )}
                  <defs>
                    <linearGradient id="healthScoreGradient" x1="0" x2="1">
                      <stop offset="0%" stopColor="hsl(186 72% 42%)" />
                      <stop offset="100%" stopColor="hsl(45 92% 58%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="font-display text-5xl font-bold gradient-text">
                      {dashboard.healthScore ?? "--"}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">HealthScore</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Latest data</p>
                  <h2 className="mt-1 text-2xl font-bold">
                    {dashboard.healthScore === null ? "No health data yet." : trendSummary.title}
                  </h2>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {dashboard.healthScore === null
                      ? "Add your first health record or generate a prediction to calculate your score."
                      : trendSummary.description}
                  </p>
                </div>
                <div className="h-24">
                  {dashboard.weeklyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboard.weeklyTrend}>
                        <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <Tooltip labelFormatter={(value) => formatShortDate(String(value))} contentStyle={{ borderRadius: 16, border: "0", boxShadow: "var(--shadow-soft)" }} />
                        <Line type="monotone" dataKey="score" stroke="hsl(186 72% 42%)" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed text-xs text-muted-foreground">
                      No trend data yet
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pillars.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="glass-card rounded-2xl p-3">
                      <Icon className="size-4 text-primary" />
                      <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
                      <div className={value === null ? "text-xs text-muted-foreground" : "font-semibold"}>{scoreText(value)}</div>
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
                <Badge className="border-0 bg-primary/10 text-primary">Latest</Badge>
              </div>
              {dashboard.aiInsights.length === 0 ? (
                <EmptyState text="Generate your first prediction to receive AI insights." to="/risk-assessment" action="New prediction" />
              ) : (
                <div className="space-y-3">
                  {dashboard.aiInsights.map((insight, index) => (
                    <motion.div key={`${insight.title}-${index}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="flex gap-3 rounded-2xl bg-white/60 p-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl gradient-soft">
                        {insight.type === "warning" ? <AlertTriangle className="size-4 text-amber-600" /> : <Sparkles className="size-4 text-primary" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{insight.title}</div>
                        <div className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">{insight.message}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Today's wellness</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Activity recorded today.</p>
                </div>
                <TrendingUp className="size-5 text-primary" />
              </div>
              {dashboard.todayWellness.length === 0 ? (
                <EmptyState text="No health activity recorded today." />
              ) : (
                <ol className="relative pl-6">
                  <span className="absolute bottom-1 left-2 top-1 w-px bg-border" />
                  {dashboard.todayWellness.map((item, index) => (
                    <li key={`${item.title}-${item.date}-${index}`} className="relative pb-5 last:pb-0">
                      <span className={`absolute -left-[18px] top-1 size-3 rounded-full ring-4 ring-white ${item.tone === "ok" ? "bg-primary" : "bg-amber-400"}`} />
                      <div className="text-[11px] text-muted-foreground">{formatTime(item.date)}</div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {[
              { to: "/symptoms", icon: MessageSquareHeart, title: "Symptoms", desc: "Log health changes" },
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
              <SectionHeader title="Recent predictions" to="/predictions" action="View all" />
              {dashboard.recentPredictions.length === 0 ? (
                <EmptyState text="No predictions yet. Generate your first prediction." to="/risk-assessment" action="New prediction" />
              ) : (
                <div className="space-y-2">
                  {dashboard.recentPredictions.map((prediction) => (
                    <Link key={prediction.id} to="/predictions" className="flex items-center gap-4 rounded-2xl p-3 hover:bg-white/70">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{prediction.riskLevel} risk assessment</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {formatShortDate(prediction.createdAt)} · {prediction.contributingFactors.join(", ") || "No contributing factors reported"}
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full gradient-primary" style={{ width: `${prediction.riskScore}%` }} />
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">{prediction.riskScore}% risk</div>
                      </div>
                      <Badge variant="outline" className="rounded-full">{prediction.riskLevel}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <SectionHeader title="Top recommendations" to="/recommendations" action="View all" />
              {dashboard.recommendationsSummary.length === 0 ? (
                <EmptyState text="No saved recommendations yet. Generate a prediction to start building your plan." to="/risk-assessment" action="New prediction" />
              ) : (
                <div className="space-y-2">
                  {dashboard.recommendationsSummary.map((recommendation) => (
                    <Link key={recommendation.id} to="/recommendations" className="flex gap-3 rounded-2xl p-3 transition hover:bg-white/70">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl gradient-soft text-primary">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{recommendation.title}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{recommendation.content}</div>
                      </div>
                      <Badge variant="outline" className="shrink-0 rounded-full">{recommendation.priority}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <SectionHeader title="Latest symptoms" to="/symptoms" action="View all" />
              {dashboard.latestSymptoms.length === 0 ? (
                <EmptyState text="No symptoms logged yet." to="/symptoms" action="Log symptom" />
              ) : (
                <div className="space-y-2">
                  {dashboard.latestSymptoms.map((symptom) => (
                    <Link key={symptom.id} to="/symptoms" className="flex items-center gap-3 rounded-2xl p-3 hover:bg-white/70">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <MessageSquareHeart className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{symptom.symptom}</div>
                        <div className="text-xs text-muted-foreground">{symptom.duration} · {formatRelativeTime(symptom.createdAt)}</div>
                      </div>
                      <Badge variant="outline" className="rounded-full">{symptom.severity}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  {dashboard.notificationsCount > 0 && <Badge>{dashboard.notificationsCount} unread</Badge>}
                </div>
                <Link to="/notifications" className="text-xs font-medium text-primary">Open inbox</Link>
              </div>
              {dashboard.recentNotifications.length === 0 ? (
                <EmptyState text="No notifications yet." />
              ) : (
                <div className="space-y-2">
                  {dashboard.recentNotifications.map((notification) => (
                    <Link key={notification.id} to="/notifications" className="flex gap-3 rounded-2xl p-3 hover:bg-white/70">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Bell className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{notification.title}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{notification.message}</div>
                      </div>
                      <div className="whitespace-nowrap text-[11px] text-muted-foreground">{formatRelativeTime(notification.createdAt)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </UserPageContainer>
    </DashboardLayout>
  );
}

function SectionHeader({ title, to, action }: { title: string; to: string; action: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Link to={to} className="text-xs font-medium text-primary">{action}</Link>
    </div>
  );
}

function EmptyState({ text, to, action }: { text: string; to?: string; action?: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-white/45 p-5 text-center text-sm text-muted-foreground">
      <p>{text}</p>
      {to && action && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link to={to}>{action}</Link>
        </Button>
      )}
    </div>
  );
}
