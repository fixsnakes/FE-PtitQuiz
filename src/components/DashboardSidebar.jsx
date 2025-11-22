import React from "react";
import { Link, useLocation } from "react-router-dom";
// 1. Import các icon từ thư viện react-icons (bộ Feather Icons)
import { 
  FiGrid, 
  FiFileText, 
  FiUsers, 
  FiBell, 
  FiHome, 
  FiHeart, 
  FiClock, 
  FiBarChart2,

} from "react-icons/fi";

import { SiGoogleclassroom  } from "react-icons/si";
import { CiUser } from "react-icons/ci";
import { MdPayment } from "react-icons/md";


const SIDEBAR_ITEMS = {
  teacher: [
    { label: "Tổng quan", path: "/dashboard/teacher", icon: FiGrid },
    { label: "Kỳ thi", path: "/dashboard/teacher/exams", icon: FiFileText },
    { label: "Lớp học", path: "/dashboard/teacher/classes", icon: FiUsers },
    { label: "Thông báo", path: "/dashboard/teacher/notifications", icon: FiBell },
    { label: "Ví của tôi", path: "/dashboard/wallet",icon: MdPayment},
    { label: "Tài Khoản", path: "/dashboard/profile", icon: CiUser },
  ],
  student: [
    { label: "Trang chủ", path: "/dashboard/student", icon: FiHome },
    { label: "Bài thi yêu thích", path: "/dashboard/student/favorite", icon: FiHeart },
    { label: "Truy cập gần đây", path: "/dashboard/student/recent", icon: FiClock },
    { label: "Kết quả thi", path: "/dashboard/student/results", icon: FiBarChart2 },
    { label: "Lớp học", path: "/dashboard/student/classes", icon: FiUsers },
    { label: "Thông báo", path: "/dashboard/notifications",icon: FiBell},
    { label: "Ví của tôi", path: "/dashboard/payment",icon: MdPayment},
    { label: "Tài Khoản", path: "/dashboard/profile", icon: CiUser },
  ],
};

export default function DashboardSidebar({ role = "student" }) {
  const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.student;
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
      <div className="mb-8 flex items-center gap-3">
        {/* Logo icon nhỏ trang trí (tùy chọn) */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            P
        </div>
        <div>
            <h1 className="text-xl font-bold text-indigo-600 leading-none">PTIT QUIZ</h1>
            <p className="text-xs text-slate-500 mt-1">
            {role === "teacher" ? "Giáo viên" : "Học sinh"}
            </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          
          // Lấy component Icon ra để render
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              // 2. Thêm flex, items-center, gap-3 để căn chỉnh icon và text
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition 
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                }
              `}
            >
              {/* 3. Render Icon */}
              <Icon className="h-5 w-5" /> 
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
            <FiBell className="h-4 w-4 text-indigo-500"/> 
            <span>Ghi chú</span>
        </div>
        <p className="mt-1 text-slate-500">
          Một vài mô tả placeholder cho tính năng sắp ra mắt.
        </p>
      </div>
    </aside>
  );
}