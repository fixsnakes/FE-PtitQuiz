import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser, getRoleBasedPath } from "../utils/auth";

export default function RoleRedirect() {
  const user = getStoredUser();
  const path = getRoleBasedPath(user?.role);
  return <Navigate to={path} replace />;
}

