import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const roleHome = (role?: UserRole) => (role === "admin" ? "/admin/users" : "/");

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.status !== "active") {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={roleHome(user?.role)} replace />;
  }

  return <>{children}</>;
}
