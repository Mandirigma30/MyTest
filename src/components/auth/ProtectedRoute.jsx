import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute.jsx — RespondaCare RBAC gate
 * Creates absolute "Walled Gardens" per blueprint Section 4.
 * Reads session role from localStorage and blocks unauthorized access.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const sessionRaw = localStorage.getItem('respondaCare_session');

  if (!sessionRaw) {
    return <Navigate to="/login" replace />;
  }

  let session = null;
  try {
    session = JSON.parse(sessionRaw);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!session?.role || !allowedRoles.includes(session.role)) {
    // Redirect to role-appropriate home, or login if invalid
    if (session?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (session?.role === 'responder') return <Navigate to="/responder/scanner" replace />;
    if (session?.role === 'resident') return <Navigate to="/resident/portal" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
