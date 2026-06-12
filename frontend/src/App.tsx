import { lazy, Suspense, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const Index = lazy(() => import("./pages/Index"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MyProfilePage = lazy(() => import("./pages/MyProfilePage"));
const HealthProfilePage = lazy(() => import("./pages/HealthProfilePage"));
const SymptomsPage = lazy(() => import("./pages/SymptomsPage"));
const RiskAssessmentPage = lazy(() => import("./pages/RiskAssessmentPage"));
const PredictionsPage = lazy(() => import("./pages/PredictionsPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const UsersManagementPage = lazy(() => import("./pages/admin/UsersManagementPage"));
const PredictionRecordsPage = lazy(() => import("./pages/admin/PredictionRecordsPage"));
const DatasetsPage = lazy(() => import("./pages/admin/DatasetsPage"));
const ModelSummaryPage = lazy(() => import("./pages/admin/ModelSummaryPage"));

const MLModelsPage = lazy(() => import("./pages/ml/MLModelsPage"));
const FeatureAnalysisPage = lazy(() => import("./pages/ml/FeatureAnalysisPage"));
const ModelTuningPage = lazy(() => import("./pages/ml/ModelTuningPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
}

function AuthPage({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />;
  }
  return <>{children}</>;
}

function HomeRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Index />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <DashboardPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public auth routes */}
                <Route path="/login" element={<AuthPage><LoginPage /></AuthPage>} />
                <Route path="/signup" element={<AuthPage><SignupPage /></AuthPage>} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/" element={<HomeRoute />} />

                {/* Protected user routes */}
                <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><DashboardPage /></ProtectedRoute>} />
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
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UsersManagementPage /></ProtectedRoute>} />
                <Route path="/admin/predictions" element={<ProtectedRoute requiredRole="admin"><PredictionRecordsPage /></ProtectedRoute>} />
                <Route path="/admin/datasets" element={<ProtectedRoute requiredRole="admin"><DatasetsPage /></ProtectedRoute>} />
                <Route path="/admin/model-summary" element={<ProtectedRoute requiredRole="admin"><ModelSummaryPage /></ProtectedRoute>} />

                {/* ML routes (admin only) */}
                <Route path="/ml/models" element={<ProtectedRoute requiredRole="admin"><MLModelsPage /></ProtectedRoute>} />
                <Route path="/ml/features" element={<ProtectedRoute requiredRole="admin"><FeatureAnalysisPage /></ProtectedRoute>} />
                <Route path="/ml/tuning" element={<ProtectedRoute requiredRole="admin"><ModelTuningPage /></ProtectedRoute>} />

                {/* Legacy admin route redirect */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
