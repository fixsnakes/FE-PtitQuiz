import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiTrendingUp, FiUsers, FiFileText } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import BarChart from "../../../components/charts/BarChart";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [loading, setLoading] = useState(false);
  const [revenueReport, setRevenueReport] = useState(null);
  const [userActivityReport, setUserActivityReport] = useState(null);
  const [examStatsReport, setExamStatsReport] = useState(null);

  useEffect(() => {
    if (activeTab === "revenue") {
      loadRevenueReport();
    } else if (activeTab === "users") {
      loadUserActivityReport();
    } else if (activeTab === "exams") {
      loadExamStatsReport();
    }
  }, [activeTab]);

  const loadRevenueReport = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRevenueReport({
        group_by: "month",
      });
      if (response.success) {
        setRevenueReport(response.data);
      }
    } catch (error) {
      console.error("Error loading revenue report:", error);
      toast.error("Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivityReport = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserActivityReport();
      if (response.success) {
        setUserActivityReport(response.data);
      }
    } catch (error) {
      console.error("Error loading user activity report:", error);
      toast.error("Không thể tải báo cáo hoạt động người dùng");
    } finally {
      setLoading(false);
    }
  };

  const loadExamStatsReport = async () => {
    try {
      setLoading(true);
      const response = await adminService.getExamStatsReport();
      if (response.success) {
        setExamStatsReport(response.data);
      }
    } catch (error) {
      console.error("Error loading exam stats report:", error);
      toast.error("Không thể tải báo cáo thống kê đề thi");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "revenue", label: "Báo cáo doanh thu", icon: FiTrendingUp },
    { id: "users", label: "Hoạt động người dùng", icon: FiUsers },
    { id: "exams", label: "Thống kê đề thi", icon: FiFileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Báo cáo thống kê</h1>
        <p className="text-slate-600 mt-1">
          Xem các báo cáo và thống kê chi tiết
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          {/* Revenue Report */}
          {activeTab === "revenue" && revenueReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Tổng doanh thu
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(revenueReport.summary?.totalRevenue)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Tổng giao dịch
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {revenueReport.summary?.totalPurchases}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Giá trị TB
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {formatCurrency(revenueReport.summary?.avgPurchaseValue)}
                  </p>
                </div>
              </div>

              {/* Top Earning Exams */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Đề thi thu nhập cao nhất
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Đề thi
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Giáo viên
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                          Lượt mua
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                          Doanh thu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueReport.topEarningExams?.map((item) => (
                        <tr
                          key={item.exam_id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-3 px-4 font-medium">
                            {item.exam?.title}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {item.exam?.creator?.fullName}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {item.purchase_count}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-green-600">
                            {formatCurrency(item.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                {(() => {
                  const monthlyData = Array(12).fill(0);
                  const revenueByPeriod = revenueReport.revenueByPeriod || [];
                  revenueByPeriod.forEach(item => {
                    if (item.period) {
                      const periodParts = item.period.split('-');
                      if (periodParts.length === 2) {
                        const month = parseInt(periodParts[1]);
                        const monthIndex = month - 1;
                        
                        if (monthIndex >= 0 && monthIndex < 12) {
                          monthlyData[monthIndex] = parseFloat(item.revenue) || 0;
                        }
                      }
                    }
                  });
                    
                  return (
                    <BarChart
                      data={monthlyData}
                      categories={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
                      color="#465fff"
                      title="Báo cáo doanh thu theo tháng"
                      height={240}
                    />
                  );
                })()}
              </div>
            </div>
          )}

          {/* User Activity Report */}
          {activeTab === "users" && userActivityReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Tổng người dùng
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {userActivityReport.summary?.totalUsers}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Trung bình mỗi ngày
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {userActivityReport.summary?.averageUsersPerDay}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Người dùng hoạt động nhiều nhất
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Học sinh
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                          Số bài đã nộp
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                          Điểm TB
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivityReport.mostActiveUsers?.map((user) => (
                        <tr
                          key={user.student_id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium">
                              {user.student?.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.student?.email}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {user.submission_count}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-green-600">
                            {user.avg_score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Exam Stats Report */}
          {activeTab === "exams" && examStatsReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Tổng đề thi
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {examStatsReport.summary?.totalExams}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Tổng lượt nộp
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {examStatsReport.summary?.totalSubmissions}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Điểm TB
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {examStatsReport.summary?.avgScoreOverall}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-600">
                    Tỷ lệ đạt
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {examStatsReport.summary?.passRate}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

