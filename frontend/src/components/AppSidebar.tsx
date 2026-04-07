import {
  LayoutDashboard, User, Stethoscope, Activity, TrendingUp,
  Lightbulb, FileText, Bell, Shield, Settings, Users,
  Database, Brain, BarChart3, Cpu, FlaskConical, SlidersHorizontal, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const userItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Profile", url: "/my-profile", icon: User },
  { title: "Health Profile", url: "/health-profile", icon: Stethoscope },
  { title: "Symptoms", url: "/symptoms", icon: Activity },
  { title: "Risk Assessment", url: "/risk-assessment", icon: TrendingUp },
  { title: "Predictions", url: "/predictions", icon: BarChart3 },
  { title: "Recommendations", url: "/recommendations", icon: Lightbulb },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminMainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Prediction Records", url: "/admin/predictions", icon: BarChart3 },
  { title: "Datasets", url: "/admin/datasets", icon: Database },
  { title: "Model Summary", url: "/admin/model-summary", icon: Brain },
];

const adminMLItems = [
  { title: "ML Models", url: "/ml/models", icon: Cpu },
  { title: "Feature Analysis", url: "/ml/features", icon: FlaskConical },
  { title: "Model Tuning", url: "/ml/tuning", icon: SlidersHorizontal },
];

const adminSystemItems = [
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Admin Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin, logout, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const renderItems = (items: typeof userItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar pt-4">
        {/* Logo */}
        {!collapsed ? (
          <div className="px-6 pb-4 mb-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-sidebar-primary-foreground">HealthGuard</span>
            </div>
            <p className="text-xs text-sidebar-foreground/60 mt-1">AI Health Intelligence</p>
          </div>
        ) : (
          <div className="flex justify-center pb-4 mb-2 border-b border-sidebar-border">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        )}

        {isAdmin ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                {!collapsed && "Admin"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems(adminMainItems)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                {!collapsed && "Machine Learning"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems(adminMLItems)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                {!collapsed && "System"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems(adminSystemItems)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
              {!collapsed && "Main"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderItems(userItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Logout */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} className="text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent transition-colors cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
