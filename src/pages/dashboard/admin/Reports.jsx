import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiTrendingUp, FiUsers, FiFileText, FiArrowUp, FiArrowDown } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import BarChart from "../../../components/charts/BarChart";
import LineChart from "../../../components/charts/LineChart";

// Constants
const PERIOD_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "7days", label: "7 ngày qua" },
  { value: "30days", label: "30 ngày qua" }
];

const COLOR_MAP = {
  green: "text-green-600",
  red: "text-red-600",
  purple: "text-purple-600",
  blue: "text-blue-600"
};

// Helper function
const getColorClass = (color) => COLOR_MAP[color] || "text-slate-600";

// Mock data
import { MOCK_REVENUE_DATA } from "./mockData/revenueData";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("30days");
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
      // TODO: Uncomment để dùng API thật
      // const response = await adminService.getRevenueReport({ group_by: "month" });
      // if (response.success) { setRevenueReport(response.data); }
      
      // MOCK DATA
      await new Promise(resolve => setTimeout(resolve, 300));
      setRevenueReport(MOCK_REVENUE_DATA);
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
              {/* Period Filter */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-medium text-slate-700">Khoảng thời gian:</span>
                  <div className="flex gap-4">
                    {PERIOD_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="period"
                          value={opt.value}
                          checked={period === opt.value}
                          onChange={(e) => setPeriod(e.target.value)}
                          className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500"
                        />
                        <span className="text-sm text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              {(() => {
                const summary = revenueReport.summary[period];
                return (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                    {[
                      { label: "Tổng tiền nạp", value: summary.current.deposit, color: "green", percent: summary.percentChange.deposit },
                      { label: "Tổng tiền rút", value: summary.current.withdrawal, color: "red", percent: summary.percentChange.withdrawal },
                      { label: "Tiền mua đề", value: summary.current.purchase, color: "purple", percent: summary.percentChange.purchase },
                      { label: "Doanh thu", value: summary.current.revenue, color: "blue", percent: summary.percentChange.revenue }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
                        <p className="text-sm font-medium text-slate-600">{item.label}</p>
                        <p className={`text-2xl font-bold mt-2 ${getColorClass(item.color)}`}>
                          {formatCurrency(item.value)}
                        </p>
                        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                          item.percent >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {item.percent >= 0 ? <FiArrowUp className="h-4 w-4" /> : <FiArrowDown className="h-4 w-4" />}
                          <span>{Math.abs(item.percent).toFixed(1)}%</span>
                          <span className="text-slate-500 font-normal ml-1">so với cùng kỳ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Monthly Revenue Bar Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <BarChart
                  data={revenueReport.monthly.map(m => m.revenue)}
                  categories={["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]}
                  color="#3b82f6"
                  title="Biến động doanh thu theo tháng (2025)"
                  height={300}
                />
              </div>

              {/* Daily Trend Line Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-6">
                  Biến động 30 ngày gần nhất
                </h3>
                <LineChart
                  data={[
                    { name: "Tiền nạp", data: revenueReport.daily.map(d => d.deposit) },
                    { name: "Tiền rút", data: revenueReport.daily.map(d => d.withdrawal) },
                    { name: "Tiền mua đề", data: revenueReport.daily.map(d => d.purchase) }
                  ]}
                  categories={revenueReport.daily.map((d, i) => `${i + 1}/12`)}
                />
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

