import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated users to the login page, while saving their intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    // Redirect non-admin users away from admin-only routes
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
