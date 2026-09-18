import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { AppProvider, useApp } from '@/lib/AppContext';
import ScrollToTop from './components/ScrollToTop';

// Layout
import AppShell from '@/components/layout/AppShell';

// Auth pages
import LoginPage from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// App pages
import Dashboard from '@/pages/Dashboard';
import ComplaintList from '@/pages/ComplaintList';
import CreateComplaint from '@/pages/CreateComplaint';
import ComplaintDetails from '@/pages/ComplaintDetails';
import TransactionList from '@/pages/TransactionList';
import TransactionDetails from '@/pages/TransactionDetails';
import FundFlow from '@/pages/FundFlow';
import PredictionDashboard from '@/pages/PredictionDashboard';
import RunPrediction from '@/pages/RunPrediction';
import PredictionDetails from '@/pages/PredictionDetails';
import ModelPerformance from '@/pages/ModelPerformance';
import CaseList from '@/pages/CaseList';
import CreateCase from '@/pages/CreateCase';
import CaseDetails from '@/pages/CaseDetails';
import IntelligenceMap from '@/pages/IntelligenceMap';
import Reports from '@/pages/Reports';
import AuditLog from '@/pages/AuditLog';
import Administration from '@/pages/Administration';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

function ProtectedRoutes() {
  const { isAuthenticated } = useApp();
  // Also check localStorage directly as a fallback for fresh loads
  const storageAuth = localStorage.getItem('cyber_auth') === 'true';
  if (!isAuthenticated && !storageAuth) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function AppRoutes() {
  const { isAuthenticated } = useApp();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Complaints */}
        <Route path="/complaints" element={<ComplaintList />} />
        <Route path="/complaints/create" element={<CreateComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />

        {/* Transactions */}
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/fund-flow" element={<FundFlow />} />
        <Route path="/transactions/:id" element={<TransactionDetails />} />

        {/* Predictions */}
        <Route path="/predictions" element={<PredictionDashboard />} />
        <Route path="/predictions/run" element={<RunPrediction />} />
        <Route path="/predictions/performance" element={<ModelPerformance />} />
        <Route path="/predictions/:id" element={<PredictionDetails />} />

        {/* Cases */}
        <Route path="/cases" element={<CaseList />} />
        <Route path="/cases/create" element={<CreateCase />} />
        <Route path="/cases/:id" element={<CaseDetails />} />

        {/* Intelligence Map */}
        <Route path="/intelligence-map" element={<IntelligenceMap />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/audit" element={<AuditLog />} />

        {/* Administration */}
        <Route path="/administration" element={<Administration />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppProvider>
          <Router>
            <ScrollToTop />
            <AppRoutes />
          </Router>
          <Toaster />
        </AppProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;