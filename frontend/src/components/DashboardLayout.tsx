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
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/predictions", icon: Brain, label: "Predictions" },
  { to: "/admin/datasets", icon: Database, label: "Datasets" },
  { to: "/admin/model-summary", icon: BarChart3, label: "Analytics" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

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
    <div className={`min-h-screen ${isAdmin ? "admin-console" : ""}`}>
      <header className="sticky top-0 z-40 px-4 pt-4 md:px-8">
        <div className="glass flex items-center gap-4 rounded-2xl px-4 py-3 md:px-6">
          <Link to={isAdmin ? "/admin/users" : "/"} className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl gradient-primary">
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

          <div className="mx-auto hidden max-w-xl flex-1 md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search symptoms, predictions, users..." className="pl-9" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-1 pr-3 transition hover:bg-white/60">
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

      <nav aria-label="Primary" className="glass fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 rounded-2xl p-2 lg:flex">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`group relative grid size-11 place-items-center rounded-xl transition ${
                active ? "gradient-primary text-white shadow-glow" : "text-foreground/60 hover:bg-white/60 hover:text-foreground"
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

      <nav className="glass fixed bottom-3 left-3 right-3 z-30 flex justify-around rounded-2xl p-2 lg:hidden">
        {nav.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 ${isActive(to) ? "text-primary" : "text-foreground/60"}`}>
            <Icon className="size-5" />
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 md:px-8 lg:pl-24">
        {children}
      </main>
    </div>
  );
}
