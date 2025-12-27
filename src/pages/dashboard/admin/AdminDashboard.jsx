import React, { useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
} from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import LineChart from "../../../components/charts/LineChart";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffectOnce(() => {
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
  const dailyStats = dashboardData?.charts?.dailyStats || [];

  // Tính toán số đề thi miễn phí và trả phí từ API
  const totalExams = summary.totalExams || 0;
  const freeExams = summary.freeExams || 0;
  const paidExams = summary.paidExams || (totalExams - freeExams);

  // Format dữ liệu cho biểu đồ
  const chartCategories = dailyStats.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  });

  const chartSeries = [
    {
      name: 'Người dùng mới',
      data: dailyStats.map(item => item.newUsers || 0),
    },
    {
      name: 'Đề thi mới',
      data: dailyStats.map(item => item.newExams || 0),
    },
    {
      name: 'Lượt thi',
      data: dailyStats.map(item => item.examSessions || 0),
    },
  ];

  const stats = [
    {
      label: "Tổng người dùng",
      value: summary.totalUsers || 0,
      icon: FiUsers,
      color: "bg-blue-500",
      detail: `${summary.totalStudents || 0} Học sinh, ${summary.totalTeachers || 0} Giáo viên`,
    },
    {
      label: "Doanh thu",
      value: formatCurrency(summary.totalRevenue || 0),
      icon: FiDollarSign,
      color: "bg-yellow-500",
      detail: `${summary.totalPurchases || 0} Giao dịch`,
    },
    {
      label: "Tổng đề thi",
      value: totalExams,
      icon: FiTrendingUp,
      color: "bg-indigo-500",
      detail: `${freeExams} Miễn phí, ${paidExams} Trả phí`,
    },
    {
      label: "Phiên hoạt động",
      value: summary.activeSessions || 0,
      icon: FiActivity,
      color: "bg-pink-500",
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-6"
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
            </div>
          );
        })}
      </div>

      {/* Chart: 30 Days Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            Thống kê 30 ngày gần nhất
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Biểu đồ theo dõi người dùng mới, đề thi mới và lượt thi theo ngày
          </p>
        </div>
        <LineChart
          data={chartSeries}
          categories={chartCategories}
          loading={loading}
        />
      </div>

      {/* Popular Exams */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            Đề thi phổ biến
          </h2>
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
          to="/dashboard/admin/withdrawals"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiDollarSign className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Quản lý rút tiền</h3>
          <p className="text-sm text-slate-600 mt-1">
            Xử lý yêu cầu rút tiền
          </p>
        </Link>

        <Link
          to="/dashboard/admin/reports"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiBarChart2 className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Báo cáo thống kê</h3>
          <p className="text-sm text-slate-600 mt-1">
            Xem báo cáo hệ thống
          </p>
        </Link>

        <Link
          to="/dashboard/admin/analytics"
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition"
        >
          <FiTrendingUp className="h-8 w-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Phân tích số liệu</h3>
          <p className="text-sm text-slate-600 mt-1">
            Phân tích dữ liệu chi tiết
          </p>
        </Link>
      </div>
    </div>
  );
}

