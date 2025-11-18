import React from "react";
import { Navigate } from "react-router-dom";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("accessToken");
  const currentUser = getStoredUser();

  if (!token || !currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(currentUser.role)
  ) {
    const fallbackPath =
      currentUser.role === "teacher"
        ? "/dashboard/teacher"
        : currentUser.role === "student"
        ? "/dashboard/student"
        : "/auth/login";

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

