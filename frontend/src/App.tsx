import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MyProfilePage from "./pages/MyProfilePage";
import HealthProfilePage from "./pages/HealthProfilePage";
import SymptomsPage from "./pages/SymptomsPage";
import RiskAssessmentPage from "./pages/RiskAssessmentPage";
import PredictionsPage from "./pages/PredictionsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Admin pages
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import PredictionRecordsPage from "./pages/admin/PredictionRecordsPage";
import DatasetsPage from "./pages/admin/DatasetsPage";
import ModelSummaryPage from "./pages/admin/ModelSummaryPage";

// ML pages
import MLModelsPage from "./pages/ml/MLModelsPage";
import FeatureAnalysisPage from "./pages/ml/FeatureAnalysisPage";
import ModelTuningPage from "./pages/ml/ModelTuningPage";

const queryClient = new QueryClient();

function AuthPage({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/users" : "/"} replace />;
  }
  return <>{children}</>;
}

function HomeRoute() {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin/users" replace />;
  return <DashboardPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<AuthPage><LoginPage /></AuthPage>} />
            <Route path="/signup" element={<AuthPage><SignupPage /></AuthPage>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected user routes */}
            <Route path="/" element={<ProtectedRoute><HomeRoute /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
            <Route path="/health-profile" element={<ProtectedRoute><HealthProfilePage /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><SymptomsPage /></ProtectedRoute>} />
            <Route path="/risk-assessment" element={<ProtectedRoute><RiskAssessmentPage /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><PredictionsPage /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersManagementPage /></ProtectedRoute>} />
            <Route path="/admin/predictions" element={<ProtectedRoute requiredRole="admin"><PredictionRecordsPage /></ProtectedRoute>} />
            <Route path="/admin/datasets" element={<ProtectedRoute requiredRole="admin"><DatasetsPage /></ProtectedRoute>} />
            <Route path="/admin/model-summary" element={<ProtectedRoute requiredRole="admin"><ModelSummaryPage /></ProtectedRoute>} />

            {/* ML routes (admin only) */}
            <Route path="/ml/models" element={<ProtectedRoute requiredRole="admin"><MLModelsPage /></ProtectedRoute>} />
            <Route path="/ml/features" element={<ProtectedRoute requiredRole="admin"><FeatureAnalysisPage /></ProtectedRoute>} />
            <Route path="/ml/tuning" element={<ProtectedRoute requiredRole="admin"><ModelTuningPage /></ProtectedRoute>} />

            {/* Legacy admin route redirect */}
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
