import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUsers,
  FiFileText,
  FiBookOpen,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardOverview();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const popularExams = dashboardData?.popularExams || [];

  const stats = [
    {
      label: "Tổng người dùng",
      value: summary.totalUsers || 0,
      icon: FiUsers,
      color: "bg-blue-500",
      link: "/dashboard/admin/users",
      detail: `${summary.totalStudents || 0} Học sinh, ${
        summary.totalTeachers || 0
      } Giáo viên`,
    },
    {
      label: "Tổng đề thi",
      value: summary.totalExams || 0,
      icon: FiFileText,
      color: "bg-green-500",
      link: "/dashboard/admin/exams",
      detail: `${summary.activeSessions || 0} Đang diễn ra`,
    },
    {
      label: "Tổng lớp học",
      value: summary.totalClasses || 0,
      icon: FiBookOpen,
      color: "bg-purple-500",
      link: "/dashboard/admin/classes",
      detail: `Hoạt động`,
    },
    {
      label: "Doanh thu",
      value: formatCurrency(summary.totalRevenue || 0),
      icon: FiDollarSign,
      color: "bg-yellow-500",
      link: "/dashboard/admin/purchases",
      detail: `${summary.totalPurchases || 0} Giao dịch`,
    },
    {
      label: "Người dùng mới",
      value: summary.recentUsers || 0,
      icon: FiTrendingUp,
      color: "bg-indigo-500",
      link: "/dashboard/admin/users",
      detail: "30 ngày qua",
    },
    {
      label: "Phiên hoạt động",
      value: summary.activeSessions || 0,
      icon: FiActivity,
      color: "bg-pink-500",
      link: "#",
      detail: "Đang online",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Quản trị
        </h1>
        <p className="text-slate-600 mt-1">
          Tổng quan hệ thống PTIT Quiz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stat.detail}</p>
                </div>
                <div
                  className={`${stat.color} rounded-lg p-3 text-white flex items-center justify-center`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Popular Exams */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            Đề thi phổ biến
          </h2>
          <Link
            to="/dashboard/admin/exams"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        {popularExams.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Chưa có dữ liệu đề thi
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                    Tên đề thi
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                    Giáo viên
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                    Phí
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                    Lượt mua
                  </th>
                </tr>
              </thead>
              <tbody>
                {popularExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{exam.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-600">
                        {exam.creator?.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {exam.creator?.email}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(exam.fee)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold text-slate-800">
                        {exam.purchase_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/dashboard/admin/users"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiUsers className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Quản lý người dùng</h3>
          <p className="text-sm text-slate-600 mt-1">
            Thêm, sửa, xóa người dùng
          </p>
        </Link>

        <Link
          to="/dashboard/admin/exams"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiFileText className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Quản lý đề thi</h3>
          <p className="text-sm text-slate-600 mt-1">
            Xem và kiểm duyệt đề thi
          </p>
        </Link>

        <Link
          to="/dashboard/admin/reports"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiDollarSign className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Báo cáo doanh thu</h3>
          <p className="text-sm text-slate-600 mt-1">
            Thống kê và phân tích
          </p>
        </Link>

        <Link
          to="/dashboard/admin/notifications"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiActivity className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Gửi thông báo</h3>
          <p className="text-sm text-slate-600 mt-1">
            Broadcast cho người dùng
          </p>
        </Link>
      </div>
    </div>
  );
}

