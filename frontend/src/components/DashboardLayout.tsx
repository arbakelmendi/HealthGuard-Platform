import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareHeart,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCircle2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const userNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/symptoms", icon: MessageSquareHeart, label: "AI Assistant" },
  { to: "/risk-assessment", icon: Activity, label: "Risk" },
  { to: "/predictions", icon: BarChart3, label: "Predictions" },
  { to: "/recommendations", icon: Sparkles, label: "Recommendations" },
  { to: "/my-profile", icon: UserCircle2, label: "Profile" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const adminNav = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/predictions", icon: Brain, label: "Predictions" },
  { to: "/admin/datasets", icon: Database, label: "Datasets" },
  { to: "/admin/model-summary", icon: BarChart3, label: "Analytics" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const dashboardContainerClass = "w-full";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const nav = isAdmin ? adminNav : userNav;
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "HG";

  const isActive = (to: string) => to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const doLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`min-h-screen ${isAdmin ? "admin-console" : "bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_35%),linear-gradient(180deg,#eefcff_0%,#f8fbfd_45%,#ffffff_100%)]"}`}
    >
      <header className="sticky top-0 z-40 px-6 pt-4 md:px-8 lg:pl-28 lg:pr-8">
        <div
          className={`${dashboardContainerClass} flex items-center gap-4 rounded-3xl border px-4 py-4 backdrop-blur-xl md:px-6 ${
            isAdmin
              ? "border-cyan-300/10 bg-[linear-gradient(90deg,rgba(8,21,40,0.98),rgba(10,27,55,0.98))] shadow-[0_0_30px_rgba(0,255,255,0.06)]"
              : "border-white/60 bg-white/75 shadow-sm"
          }`}
        >
          <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2">
            <div className={`grid size-9 place-items-center rounded-xl ${isAdmin ? "bg-cyan-400/15 shadow-[0_0_22px_rgba(34,211,238,0.22)]" : "gradient-primary"}`}>
              {isAdmin ? <ShieldCheck className="size-5 text-white" /> : <Stethoscope className="size-5 text-white" />}
            </div>
            <div className="hidden sm:block">
              <div className={`font-display font-bold leading-none ${isAdmin ? "text-white" : "text-foreground"}`}>
                {isAdmin ? "HealthGuard Admin" : "HealthGuard"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {isAdmin ? "Operations console" : "AI Health Platform"}
              </div>
            </div>
          </Link>

          <div className="mx-auto hidden max-w-[720px] flex-1 md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search symptoms, predictions, users..."
                className={`h-11 rounded-2xl pl-9 shadow-sm ${
                  isAdmin
                    ? "border-white/10 bg-white/[0.04] text-white placeholder:text-slate-400"
                    : "border-white/70 bg-white/75"
                }`}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`relative ${isAdmin ? "text-cyan-100 hover:bg-cyan-400/10 hover:text-white" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"}`}
              onClick={() => navigate("/notifications")}
            >
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 rounded-2xl p-1 pr-3 transition ${isAdmin ? "bg-white/[0.04] text-white hover:bg-white/[0.08]" : "text-slate-800 hover:bg-white/70"}`}>
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-xs font-semibold text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">{user?.firstName ?? "Account"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/my-profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onClick={() => navigate("/")}>User dashboard</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={doLogout}><LogOut className="mr-2 size-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav aria-label="Primary" className={`${isAdmin ? "admin-sidebar" : "glass"} fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl p-2.5 lg:flex`}>
        {nav.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group relative grid size-12 place-items-center rounded-xl transition duration-200 ${
                active
                  ? isAdmin
                    ? "bg-gradient-to-br from-cyan-400 to-sky-400 text-white shadow-[0_0_28px_rgba(34,211,238,0.45)]"
                    : "gradient-primary text-white shadow-glow"
                  : isAdmin
                    ? "text-slate-200 hover:-translate-y-0.5 hover:bg-cyan-400/12 hover:text-white"
                    : "text-foreground/60 hover:bg-white/60 hover:text-foreground"
              }`}
            >
              <Icon className="relative z-10 size-5" />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs text-background opacity-0 transition group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <nav className={`${isAdmin ? "admin-header" : "glass"} fixed bottom-3 left-3 right-3 z-30 flex justify-around rounded-2xl p-2 lg:hidden`}>
        {nav.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 ${isActive(to) ? "text-primary" : "text-foreground/60"}`}>
            <Icon className="size-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>

      <main className="w-full px-6 pb-24 pt-6 md:px-8 lg:pl-28 lg:pr-8">
        <div className={dashboardContainerClass}>
          {children}
        </div>
      </main>
    </div>
  );
}
