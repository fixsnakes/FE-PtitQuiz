import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FiTrendingUp, 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiTarget
} from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("30days");
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when API is ready
      // const response = await adminService.getAnalytics({ timeRange });
      // if (response.success) {
      //   setAnalyticsData(response.data);
      // }

      // MOCK DATA for development
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalyticsData({
        overview: {
          totalUsers: 15234,
          activeUsers: 8456,
          totalRevenue: 125000000,
          conversionRate: 12.5
        },
        growth: {
          users: 15.2,
          revenue: 23.4,
          exams: 8.7,
          engagement: 5.3
        }
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Không thể tải dữ liệu phân tích");
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: "7days", label: "7 ngày qua" },
    { value: "30days", label: "30 ngày qua" },
    { value: "90days", label: "90 ngày qua" },
    { value: "1year", label: "1 năm qua" }
  ];

  const metricCards = [
    {
      title: "Tổng người dùng",
      value: analyticsData?.overview.totalUsers || 0,
      icon: FiUsers,
      color: "bg-blue-500",
      growth: analyticsData?.growth.users || 0
    },
    {
      title: "Người dùng hoạt động",
      value: analyticsData?.overview.activeUsers || 0,
      icon: FiActivity,
      color: "bg-green-500",
      growth: analyticsData?.growth.engagement || 0
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(analyticsData?.overview.totalRevenue || 0),
      icon: FiDollarSign,
      color: "bg-yellow-500",
      growth: analyticsData?.growth.revenue || 0
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: `${analyticsData?.overview.conversionRate || 0}%`,
      icon: FiTarget,
      color: "bg-purple-500",
      growth: analyticsData?.growth.exams || 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phân tích số liệu</h1>
          <p className="text-slate-600 mt-1">
            Theo dõi và phân tích chi tiết hoạt động của hệ thống
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Khoảng thời gian:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card, index) => {
              const Icon = card.icon;
              const isPositive = card.growth >= 0;
              
              return (
                <div key={index} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      <FiTrendingUp className={`h-4 w-4 ${!isPositive && "rotate-180"}`} />
                      <span>{Math.abs(card.growth).toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 rounded-lg p-2">
                  <FiBarChart2 className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Tăng trưởng người dùng</h3>
              </div>
              <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <FiBarChart2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Biểu đồ tăng trưởng người dùng</p>
                  <p className="text-sm text-slate-400 mt-1">Sẽ hiển thị khi có dữ liệu</p>
                </div>
              </div>
            </div>

            {/* Revenue Distribution Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-100 rounded-lg p-2">
                  <FiPieChart className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Phân bổ doanh thu</h3>
              </div>
              <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <FiPieChart className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Biểu đồ phân bổ doanh thu</p>
                  <p className="text-sm text-slate-400 mt-1">Sẽ hiển thị khi có dữ liệu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Thống kê chi tiết</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Chỉ số
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                      Hiện tại
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                      Trước đó
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                      Thay đổi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm text-slate-700">Người dùng đăng ký mới</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">1,234</td>
                    <td className="py-3 px-4 text-sm text-slate-500 text-right">1,072</td>
                    <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">+15.1%</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm text-slate-700">Đề thi được tạo</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">456</td>
                    <td className="py-3 px-4 text-sm text-slate-500 text-right">419</td>
                    <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">+8.8%</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm text-slate-700">Lượt thi</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">8,901</td>
                    <td className="py-3 px-4 text-sm text-slate-500 text-right">7,234</td>
                    <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">+23.0%</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm text-slate-700">Doanh thu trung bình/ngày</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">{formatCurrency(4166667)}</td>
                    <td className="py-3 px-4 text-sm text-slate-500 text-right">{formatCurrency(3375000)}</td>
                    <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">+23.5%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-slate-700">Tỷ lệ hoàn thành thi</td>
                    <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">87.5%</td>
                    <td className="py-3 px-4 text-sm text-slate-500 text-right">84.2%</td>
                    <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">+3.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
