import React from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function DashboardHeader({ role = "student", onLogout }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          aria-label="Chuyển đổi chế độ tối/sáng"
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {role === "teacher"
            ? "Bảng điều khiển Giáo viên"
            : "Bảng điều khiển Học sinh"}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/profile"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          aria-label="Hồ sơ cá nhân"
        >
          <FiUser className="text-lg" />
        </Link>
        <button
          onClick={onLogout}
          className="rounded-full border border-red-200 dark:border-red-800 px-3 py-2 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

