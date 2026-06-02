import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, Database, FileText, Settings, ShieldAlert, Users } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthRecordsApi, predictionsApi, type AdminPredictionRecordResponse, type HealthRecordResponse } from "@/lib/api";
import { usersApi } from "@/services/usersApi";
import type { AuthUser } from "@/types/auth";
import { toast } from "sonner";
import { AdminPageContainer } from "@/components/PageContainers";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [predictions, setPredictions] = useState<AdminPredictionRecordResponse[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [nextUsers, nextPredictions] = await Promise.all([
          usersApi.list(),
          predictionsApi.getAll(),
        ]);

        const recordResults = await Promise.allSettled(
          nextUsers.map((user) => healthRecordsApi.getUserHealthRecords(Number(user.id))),
        );
        const nextRecords = recordResults.flatMap((result) => result.status === "fulfilled" ? result.value : []);

        if (!alive) return;
        setUsers(nextUsers);
        setPredictions(nextPredictions);
        setHealthRecords(nextRecords);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load admin dashboard data.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const latestUsers = useMemo(() => [...users].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5), [users]);
  const latestPredictions = useMemo(() => [...predictions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5), [predictions]);
  const latestRecords = useMemo(() => [...healthRecords].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5), [healthRecords]);
  const getHealthRecordUserLabel = (record: HealthRecordResponse) => {
    const name = record.userName?.trim();
    if (name) return name;
    if (record.userEmail) return record.userEmail;
    return `User #${record.userId}`;
  };

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, tone: "text-cyan-300" },
    { label: "Total Health Records", value: healthRecords.length, icon: Database, tone: "text-sky-300" },
    { label: "Total Predictions", value: predictions.length, icon: BarChart3, tone: "text-emerald-300" },
    { label: "High Risk Cases", value: predictions.filter((item) => item.riskLevel === "High").length, icon: ShieldAlert, tone: "text-red-300" },
  ];

  return (
    <DashboardLayout>
      <AdminPageContainer>
        <section className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="border-0 bg-cyan-400/10 text-cyan-200">Operations Console</Badge>
              <div className="mt-4 flex items-center gap-3">
                <Activity className="h-7 w-7 text-cyan-400" />
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">Admin Dashboard</h1>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Monitor platform usage, user growth, prediction activity, and high-risk cases from the connected HealthGuard backend.
              </p>
            </div>
            <div className="text-sm text-slate-400">{loading ? "Syncing live data..." : "Live backend data"}</div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-3 font-display text-3xl font-bold text-slate-50">{value}</p>
                  </div>
                  <div className="grid size-11 place-items-center rounded-2xl bg-white/8">
                    <Icon className={`size-5 ${tone}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-50">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-3">
              <ActivityList
                title="Latest registered users"
                empty="No users yet."
                items={latestUsers.map((user) => ({
                  id: user.id,
                  title: user.fullName,
                  meta: `${user.email} · ${new Date(user.createdAt).toLocaleDateString()}`,
                }))}
              />
              <ActivityList
                title="Latest predictions"
                empty="No predictions yet."
                items={latestPredictions.map((prediction) => ({
                  id: prediction.predictionId,
                  title: `${prediction.userName} · ${prediction.riskLevel}`,
                  meta: `${prediction.riskScore}% · ${new Date(prediction.createdAt).toLocaleDateString()}`,
                }))}
              />
              <ActivityList
                title="Latest health records"
                empty="No health records yet."
                items={latestRecords.map((record) => ({
                  id: record.id,
                  title: getHealthRecordUserLabel(record),
                  meta: `BMI ${Number(record.bmi).toFixed(1)} · ${new Date(record.createdAt).toLocaleDateString()}`,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="text-slate-50">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { to: "/admin/users", icon: Users, label: "Manage Users", desc: "Create, edit, and deactivate accounts" },
                { to: "/admin/predictions", icon: BarChart3, label: "View Predictions", desc: "Review all AI risk records" },
                { to: "/reports", icon: FileText, label: "View Reports", desc: "Open analytics and exports" },
                { to: "/settings", icon: Settings, label: "System Settings", desc: "Update platform preferences" },
              ].map(({ to, icon: Icon, label, desc }) => (
                <Link key={to} to={to} className="group flex items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-900/45 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10">
                  <div className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200 transition group-hover:bg-cyan-400/20">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-50">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </AdminPageContainer>
    </DashboardLayout>
  );
}

function ActivityList({ title, empty, items }: { title: string; empty: string; items: Array<{ id: string | number; title: string; meta: string }> }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      <div className="space-y-2">
        {items.length === 0 && <p className="rounded-2xl bg-slate-900/45 p-3 text-sm text-slate-400">{empty}</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3">
            <p className="truncate text-sm font-medium text-slate-50">{item.title}</p>
            <p className="mt-1 truncate text-xs text-slate-400">{item.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
