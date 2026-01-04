import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getRoleBasedPath } from "../utils/auth";

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
    return <Navigate to={getRoleBasedPath(currentUser.role)} replace />;
  }

  return children;
}

