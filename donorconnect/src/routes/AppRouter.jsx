import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/shared/ScrollToTop';
import ProtectedRoute from '../components/shared/guards/ProtectedRoute';
import RoleGuard from '../components/shared/guards/RoleGuard';
import PublicLayout from '../components/shared/layout/PublicLayout';
import DashboardLayout from '../components/shared/layout/DashboardLayout';

// Public
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import PoliciesPage from '../pages/public/PoliciesPage';
import AwarenessPage from '../pages/public/AwarenessPage';
import ContactPage from '../pages/public/ContactPage';

// Auth
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import SetupAdminPage from '../pages/auth/SetupAdminPage';

// Admin
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AuditLogPage from '../pages/admin/AuditLogPage';
import SystemConfigPage from '../pages/admin/SystemConfigPage';
import ReportsPage from '../pages/admin/ReportsPage';
import NotificationsPage from '../pages/admin/NotificationsPage';

// Donor Service
import DonorListPage from '../pages/donor-service/DonorListPage';
import DonorRegisterPage from "../pages/donor-service/DonorRegisterPage";
import AppointmentsPage from '../pages/donor-service/AppointmentsPage';
import DrivesPage from '../pages/donor-service/DrivesPage';
import DeferralsPage from '../pages/donor-service/DeferralsPage';
import ScreeningPage from '../pages/donor-service/ScreeningPage';

// Blood Supply
import DonationsPage from '../pages/blood-supply/DonationsPage';
import BloodComponentsPage from '../pages/blood-supply/BloodComponentsPage';
import TestResultsPage from '../pages/blood-supply/TestResultsPage';
import QuarantineRecallPage from '../pages/blood-supply/QuarantineRecallPage';
import LabDashboardPage from '../pages/blood-supply/LabDashboardPage';

// Inventory
import {
  InventoryDashboardPage,
  StockOverviewPage,
  StockTransactionsPage,
  ExpiryWatchPage,
} from '../pages/inventory';

// Transfusion
import CrossmatchPage from '../pages/transfusion/CrossmatchPage';
import IssueBloodPage from '../pages/transfusion/IssueBloodPage';
import IssuedRecordsPage from '../pages/transfusion/IssuedRecordsPage';

// Safety & Billing
import ReactionsPage from '../pages/safety/ReactionsPage';
import LookbackPage from '../pages/safety/LookbackPage';
import BillingPage from '../pages/billing/BillingPage';

const ADMIN       = ['ROLE_ADMIN'];
const RECEPTION   = ['ROLE_ADMIN', 'ROLE_RECEPTION'];
const PHLEBOTOMIST= ['ROLE_ADMIN', 'ROLE_RECEPTION', 'ROLE_PHLEBOTOMIST'];
const LAB         = ['ROLE_ADMIN', 'ROLE_LAB_TECHNICIAN'];
const INVENTORY   = ['ROLE_ADMIN', 'ROLE_INVENTORY_CONTROLLER'];
const TRANSFUSION = ['ROLE_ADMIN', 'ROLE_TRANSFUSION_OFFICER'];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/"              element={<HomePage />} />
          <Route path="/about"         element={<AboutPage />} />
          <Route path="/policies"      element={<PoliciesPage />} />
          <Route path="/awareness"     element={<AwarenessPage />} />
          <Route path="/contact"       element={<ContactPage />} />
        </Route>

        {/* AUTH */}
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/setup"            element={<SetupAdminPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />

        {/* PROTECTED DASHBOARD */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Admin only */}
            <Route element={<RoleGuard allowed={ADMIN} />}>
              <Route path="/dashboard/admin"       element={<AdminOverviewPage />} />
              <Route path="/dashboard/users"       element={<UserManagementPage />} />
              <Route path="/dashboard/audit-logs"  element={<AuditLogPage />} />
              <Route path="/dashboard/config"      element={<SystemConfigPage />} />
              <Route path="/dashboard/reports"     element={<ReportsPage />} />
              <Route path="/dashboard/billing"     element={<BillingPage />} />
            </Route>

            {/* Donor Service */}
            <Route element={<RoleGuard allowed={RECEPTION} />}>
              <Route path="/dashboard/donors"              element={<DonorListPage />} />
              <Route path="/dashboard/donors/register"     element={<DonorRegisterPage />} />
              <Route path="/dashboard/donors/edit/:id"     element={<DonorRegisterPage />} />
              <Route path="/dashboard/appointments"        element={<AppointmentsPage />} />
              <Route path="/dashboard/drives"              element={<DrivesPage />} />
              <Route path="/dashboard/deferrals"           element={<DeferralsPage />} />
            </Route>
            <Route element={<RoleGuard allowed={PHLEBOTOMIST} />}>
              <Route path="/dashboard/screenings" element={<ScreeningPage />} />
            </Route>

            {/* Blood Supply */}
            <Route element={<RoleGuard allowed={LAB} />}>
              <Route path="/dashboard/lab" element={<LabDashboardPage />} />
              <Route path="/dashboard/donations" element={<DonationsPage />} />
              <Route path="/dashboard/components" element={<BloodComponentsPage />} />
              <Route path="/dashboard/test-results" element={<TestResultsPage />} />
              <Route path="/dashboard/quarantine" element={<QuarantineRecallPage />} />
            </Route>

            {/* Inventory */}
            <Route element={<RoleGuard allowed={INVENTORY} />}>
              <Route path="/dashboard/inventory" element={<InventoryDashboardPage />} />
              <Route path="/dashboard/stock-overview" element={<StockOverviewPage />} />
              <Route path="/dashboard/stock-transactions" element={<StockTransactionsPage />} />
              <Route path="/dashboard/expiry-watch" element={<ExpiryWatchPage />} />
            </Route>

            {/* Transfusion */}
            <Route element={<RoleGuard allowed={TRANSFUSION} />}>
              <Route path="/dashboard/crossmatch"    element={<CrossmatchPage />} />
              <Route path="/dashboard/issue"         element={<IssueBloodPage />} />
              <Route path="/dashboard/issue-records" element={<IssuedRecordsPage />} />
              <Route path="/dashboard/reactions"     element={<ReactionsPage />} />
              <Route path="/dashboard/lookback"      element={<LookbackPage />} />
            </Route>

            {/* All staff roles */}
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
