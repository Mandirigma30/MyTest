import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterResidentPage from './pages/RegisterResidentPage';
import RegisterResponderPage from './pages/RegisterResponderPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin pages
import DashboardPage from './pages/DashboardPage';
import EnrollPage from './pages/EnrollPage';
import ResidentsDirectoryPage from './pages/ResidentsDirectoryPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';

// First Responder pages
import ScannerPage from './pages/ScannerPage';
import UIRPage from './pages/UIRPage';
import MapPage from './pages/MapPage';

// Resident pages
import ResidentPortalPage from './pages/ResidentPortalPage';
import SosPage from './pages/SosPage';
import EducationPage from './pages/EducationPage';
import NotificationsPage from './pages/NotificationsPage';
import QRCardPage from './pages/QRCardPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/resident"  element={<RegisterResidentPage />} />
        <Route path="/register/responder" element={<RegisterResponderPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ══════════════════════════════════════════
            Walled Garden 1: First Responders
        ══════════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={['responder']} />}>
          <Route path="/responder/scanner" element={<ScannerPage />} />
          <Route path="/responder/uir"     element={<UIRPage />} />
          <Route path="/responder/map"     element={<MapPage />} />
          {/* Legacy redirects */}
          <Route path="/scanner"  element={<Navigate to="/responder/scanner" replace />} />
        </Route>

        {/* ══════════════════════════════════════════
            Walled Garden 2: Admins / BHW
        ══════════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard"  element={<DashboardPage />} />
          <Route path="/admin/enrollment" element={<EnrollPage />} />
          <Route path="/admin/residents"  element={<ResidentsDirectoryPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/settings"   element={<SettingsPage />} />
          <Route path="/admin/map"        element={<MapPage />} />
          <Route path="/admin/reports"    element={<ReportsPage />} />
          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/enroll"    element={<Navigate to="/admin/enrollment" replace />} />
          <Route path="/uir"       element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* ══════════════════════════════════════════
            Walled Garden 3: Residents / Patients
        ══════════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={['resident']} />}>
          <Route path="/resident/portal"        element={<ResidentPortalPage />} />
          <Route path="/resident/sos"           element={<SosPage />} />
          <Route path="/resident/education"     element={<EducationPage />} />
          <Route path="/resident/notifications" element={<NotificationsPage />} />
          <Route path="/resident/qr"            element={<QRCardPage />} />
          <Route path="/resident/map"           element={<MapPage />} />
        </Route>

        {/* ── Fallback: redirect unknowns to login ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
