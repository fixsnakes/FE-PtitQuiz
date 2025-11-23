import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiBookOpen,
  FiDollarSign,
  FiBarChart2,
  FiBell,
  FiMessageSquare,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const ADMIN_NAV_ITEMS = [
  { label: "Tổng quan", path: "/dashboard/admin", icon: FiGrid, superAdminOnly: false },
  { label: "Quản lý người dùng", path: "/dashboard/admin/users", icon: FiUsers, superAdminOnly: true },
  { label: "Quản lý đề thi", path: "/dashboard/admin/exams", icon: FiFileText, superAdminOnly: false },
  { label: "Quản lý lớp học", path: "/dashboard/admin/classes", icon: FiBookOpen, superAdminOnly: false },
  { label: "Quản lý giao dịch", path: "/dashboard/admin/purchases", icon: FiDollarSign, superAdminOnly: false },
  { label: "Báo cáo thống kê", path: "/dashboard/admin/reports", icon: FiBarChart2, superAdminOnly: false },
  { label: "Thông báo", path: "/dashboard/admin/notifications", icon: FiBell, superAdminOnly: false },
  { label: "Kiểm duyệt nội dung", path: "/dashboard/admin/moderation", icon: FiMessageSquare, superAdminOnly: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    navigate("/auth/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-600 leading-none">
                ADMIN PANEL
              </h1>
              <p className="text-xs text-slate-500 mt-1">PTIT Quiz</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {ADMIN_NAV_ITEMS.filter(item => {
            // Show all items for superadmin, hide superAdminOnly items for admin
            if (item.superAdminOnly && currentUser?.role !== 'superadmin') {
              return false;
            }
            return true;
          }).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-red-50 text-red-600"
                    : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut className="h-5 w-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleSidebar}
          ></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-lg">
                  A
                </div>
                <div>
                  <h1 className="text-xl font-bold text-red-600 leading-none">
                    ADMIN PANEL
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">PTIT Quiz</p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="text-slate-500 hover:text-slate-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {ADMIN_NAV_ITEMS.filter(item => {
                // Show all items for superadmin, hide superAdminOnly items for admin
                if (item.superAdminOnly && currentUser?.role !== 'superadmin') {
                  return false;
                }
                return true;
              }).map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleSidebar}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-slate-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-slate-500 hover:text-slate-700 md:hidden"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-slate-800">
                Quản trị hệ thống
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {currentUser?.fullName || "Admin"}
                </p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-semibold">
                {currentUser?.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

