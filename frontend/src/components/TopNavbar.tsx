import { Bell, Search, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function TopNavbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "??";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search anything..." className="pl-9 w-64 h-9 bg-secondary border-none text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" onClick={() => navigate("/notifications")}>
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-health-danger text-[10px] font-bold flex items-center justify-center text-primary-foreground">3</span>
        </Button>
        <div className="flex items-center gap-2 pl-2 border-l border-border cursor-pointer" onClick={() => navigate("/my-profile")}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "User"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => { logout(); navigate("/login"); }}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
