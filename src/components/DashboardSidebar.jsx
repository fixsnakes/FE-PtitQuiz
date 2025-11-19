import React from "react";
import { Link, useLocation } from "react-router-dom"; // 1. Import useLocation

const SIDEBAR_ITEMS = {
  teacher: [
    { label: "Tổng quan", path: "/dashboard/teacher" },
    { label: "Kỳ thi", path: "/dashboard/teacher/exams" },
    { label: "Ngân hàng câu hỏi", path: "/dashboard/teacher/questions" },
    { label: "Lớp học", path: "/teacher/classes" },
    { label: "Thông báo", path: "/dashboard/teacher/notifications" },
  ],
  student: [
    { label: "Trang chủ", path: "/dashboard/student" },
    { label: "Lịch thi", path: "/dashboard/student/schedule" },
    { label: "Luyện tập", path: "/dashboard/student/practice" },
    { label: "Kết quả", path: "/dashboard/student/results" },
    { label: "Thông báo", path: "/dashboard/student/notifications" },
  ],
};

export default function DashboardSidebar({ role = "student" }) {
  const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.student;
  const location = useLocation(); // 2. Lấy thông tin location hiện tại

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-indigo-600">PTIT Quiz</h1>
        <p className="text-sm text-slate-500">
          {role === "teacher" ? "Giáo viên" : "Học sinh"}
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          // 3. Kiểm tra xem đường dẫn hiện tại có trùng với item này không
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition 
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600" // Style khi đang chọn (Active)
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600" // Style mặc định
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Ghi chú</p>
        <p className="mt-1 text-slate-500">
          Một vài mô tả placeholder cho tính năng sắp ra mắt.
        </p>
      </div>
    </aside>
  );
}