import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardLayout({ role = "student", children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <DashboardSidebar role={role} />

      <div className="flex flex-1 flex-col">
        <DashboardHeader role={role} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto p-6 dark:bg-slate-900">{children}</main>
      </div>
    </div>
  );
}

