import React from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";

export default function DashboardHeader({ role = "student", onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur ">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {role === "teacher"
            ? "Bảng điều khiển Giáo viên"
            : "Bảng điều khiển Học sinh"}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/profile"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="Hồ sơ cá nhân"
        >
          <FiUser className="text-lg" />
        </Link>
        <button
          onClick={onLogout}
          className="rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

