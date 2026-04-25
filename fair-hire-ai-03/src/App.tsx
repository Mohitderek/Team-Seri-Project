import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import JobsPage from "@/pages/JobsPage";
import UploadPage from "@/pages/UploadPage";
import CandidatesPage from "@/pages/CandidatesPage";
import InterviewsPage from "@/pages/InterviewsPage";
import AuditLogPage from "@/pages/AuditLogPage";
import CompliancePage from "@/pages/CompliancePage";
import OverridesPage from "@/pages/OverridesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute roles={["admin"]}><JobsPage /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute roles={["admin"]}><UploadPage /></ProtectedRoute>} />
      <Route path="/candidates" element={<ProtectedRoute><CandidatesPage /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute roles={["admin"]}><AuditLogPage /></ProtectedRoute>} />
      <Route path="/compliance" element={<ProtectedRoute roles={["admin"]}><CompliancePage /></ProtectedRoute>} />
      <Route path="/overrides" element={<ProtectedRoute roles={["admin"]}><OverridesPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
