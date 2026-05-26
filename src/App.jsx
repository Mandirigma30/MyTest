import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import EnrollPage from './pages/EnrollPage';
import UIRPage from './pages/UIRPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Access control gates */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/enroll" element={<EnrollPage />} />
        <Route path="/uir" element={<UIRPage />} />
        
        {/* Fallback secure redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
