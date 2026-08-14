import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DbProvider } from '@/context/DbContext';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import SupervisorDashboard from '@/pages/dashboards/SupervisorDashboard';
import EmployeeDashboard from '@/pages/dashboards/EmployeeDashboard';
import CountriesPage from '@/pages/CountriesPage';
import BranchesPage from '@/pages/BranchesPage';
import EmployeesPage from '@/pages/EmployeesPage';
import AttendancePage from '@/pages/AttendancePage';
import TasksPage from '@/pages/TasksPage';
import InventoryPage from '@/pages/InventoryPage';
import VendorsPage from '@/pages/VendorsPage';
import FinancePage from '@/pages/FinancePage';
import OrdersPage from '@/pages/OrdersPage';
import ReportsPage from '@/pages/ReportsPage';
import ApprovalsPage from '@/pages/ApprovalsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import LeadsPage from '@/pages/LeadsPage';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'supervisor') return <SupervisorDashboard />;
  return <EmployeeDashboard />;
}

function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} />
      <main className="pt-14 sm:pt-16 pb-6 sm:pb-8 px-3 sm:px-4 lg:px-6 lg:ml-64">
        <div className="max-w-[1600px] mx-auto mt-3 sm:mt-4">
          <Routes>
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/countries" element={<RoleGuard roles={['admin']}><CountriesPage /></RoleGuard>} />
            <Route path="/branches" element={<RoleGuard roles={['admin']}><BranchesPage /></RoleGuard>} />
            <Route path="/employees" element={<RoleGuard roles={['admin', 'supervisor']}><EmployeesPage /></RoleGuard>} />
            <Route path="/attendance" element={<RoleGuard roles={['admin', 'supervisor', 'employee']}><AttendancePage /></RoleGuard>} />
            <Route path="/tasks" element={<RoleGuard roles={['admin', 'supervisor', 'employee']}><TasksPage /></RoleGuard>} />
            <Route path="/inventory" element={<RoleGuard roles={['admin', 'supervisor']}><InventoryPage /></RoleGuard>} />
            <Route path="/vendors" element={<RoleGuard roles={['admin']}><VendorsPage /></RoleGuard>} />
            <Route path="/finance" element={<RoleGuard roles={['admin']}><FinancePage /></RoleGuard>} />
            <Route path="/orders" element={<RoleGuard roles={['admin', 'supervisor']}><OrdersPage /></RoleGuard>} />
            <Route path="/reports" element={<RoleGuard roles={['admin', 'supervisor']}><ReportsPage /></RoleGuard>} />
            <Route path="/approvals" element={<RoleGuard roles={['admin', 'supervisor']}><ApprovalsPage /></RoleGuard>} />
            <Route path="/notifications" element={<RoleGuard roles={['admin', 'supervisor', 'employee']}><NotificationsPage /></RoleGuard>} />
            <Route path="/settings" element={<RoleGuard roles={['admin']}><SettingsPage /></RoleGuard>} />
            <Route path="/leads" element={<RoleGuard roles={['admin', 'supervisor']}><LeadsPage /></RoleGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DbProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </DbProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

