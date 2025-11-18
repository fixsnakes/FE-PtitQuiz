import React from "react";
import { Navigate } from "react-router-dom";

function getRedirectPath() {
  try {
    const stored = localStorage.getItem("currentUser");
    const user = stored ? JSON.parse(stored) : null;
    if (user?.role === "teacher") return "/dashboard/teacher";
    if (user?.role === "student") return "/dashboard/student";
  } catch {
    // ignore JSON errors
  }
  return "/auth/login";
}

export default function RoleRedirect() {
  const path = getRedirectPath();
  return <Navigate to={path} replace />;
}

