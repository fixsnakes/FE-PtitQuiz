import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FiTrendingUp, FiFileText, FiArrowUp, FiArrowDown, FiChevronDown, FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
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

// Transaction type constants
const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
};

const TRANSACTION_TYPE_META = {
  [TRANSACTION_TYPES.DEPOSIT]: { label: "Nạp Tiền", badge: "bg-green-50 text-green-600" },
  [TRANSACTION_TYPES.WITHDRAW]: { label: "Rút Tiền", badge: "bg-red-50 text-red-600" },
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("30days");
  const [yearFilter, setYearFilter] = useState(2025);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchYear, setSearchYear] = useState("");
  const [revenueReport, setRevenueReport] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionFilters, setTransactionFilters] = useState({
    searchAccount: "",
    typeFilter: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 10
  });
  const dropdownRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Scroll to selected year when dropdown opens
  useEffect(() => {
    if (dropdownOpen && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    if (dropdownOpen) {
      setSearchYear("");
    }
  }, [dropdownOpen]);

  // Load revenue report
  const loadRevenueReport = async () => {
    try {
      setLoading(true);
      const params = {
        group_by: "month",
        year: yearFilter,
        period: period
      };
      
      const response = await adminService.getRevenueReport(params);
      if (response.success) {
        setRevenueReport(response.data);
      } else {
        toast.error(response.message || "Không thể tải báo cáo doanh thu");
      }
    } catch (error) {
      console.error("Error loading revenue report:", error);
      toast.error(error.body?.message || "Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Load transaction history
  const loadTransactionHistory = async () => {
    try {
      setTransactionLoading(true);
      
      // Build query parameters for server-side filtering
      const params = {
        page: transactionFilters.page,
        limit: transactionFilters.limit,
      };
      
      if (transactionFilters.searchAccount) {
        params.search = transactionFilters.searchAccount;
      }
      
      if (transactionFilters.typeFilter !== "all") {
        params.type = transactionFilters.typeFilter;
      }
      
      if (transactionFilters.dateFrom) {
        params.dateFrom = transactionFilters.dateFrom;
      }
      
      if (transactionFilters.dateTo) {
        params.dateTo = transactionFilters.dateTo;
      }
      
      const response = await adminService.getTransactionHistory(params);
      if (response.success) {
        setTransactionHistory(response.data);
      } else {
        toast.error(response.message || "Không thể tải lịch sử giao dịch");
      }
    } catch (error) {
      console.error("Error loading transaction history:", error);
      toast.error(error.body?.message || "Không thể tải lịch sử giao dịch");
    } finally {
      setTransactionLoading(false);
    }
  };

  // Track initial mount to avoid double API calls
  const isInitialMount = useRef(true);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "revenue") {
      loadRevenueReport();
    } else if (activeTab === "transactions") {
      loadTransactionHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Reload revenue report when period or year changes (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip on initial mount, already handled by tab change effect
    }
    
    if (activeTab === "revenue") {
      loadRevenueReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, yearFilter]);

  // Reload transactions when filters change (debounced for search)
  useEffect(() => {
    if (activeTab === "transactions") {
      const timeoutId = setTimeout(() => {
        loadTransactionHistory();
      }, transactionFilters.searchAccount ? 500 : 0);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionFilters, activeTab]);

  const tabs = [
    { id: "revenue", label: "Báo cáo doanh thu", icon: FiTrendingUp },
    { id: "transactions", label: "Lịch sử giao dịch", icon: FiFileText },
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-slate-900">
                    Biến động doanh thu theo tháng ({yearFilter})
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Năm:</label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white hover:bg-slate-50 transition-colors min-w-[80px]"
                      >
                        <span>{yearFilter}</span>
                        <FiChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden z-50 w-[200px]">
                          <div className="p-2 border-b border-slate-200">
                            <input
                              type="text"
                              value={searchYear}
                              onChange={(e) => setSearchYear(e.target.value)}
                              placeholder="Tìm năm..."
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto" style={{ maxHeight: '140px' }}>
                            {Array.from({ length: 2100 - 1990 + 1 }, (_, i) => 1990 + i)
                              .filter(year => searchYear === "" || year.toString().includes(searchYear))
                              .map(year => (
                              <button
                                key={year}
                                type="button"
                                ref={year === yearFilter ? selectedItemRef : null}
                                onClick={() => {
                                  setYearFilter(year);
                                  setDropdownOpen(false);
                                  setSearchYear("");
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 transition-colors ${
                                  year === yearFilter ? 'bg-red-100 text-red-600 font-medium' : 'text-slate-700'
                                }`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <BarChart
                  data={revenueReport.monthly.map(m => m.revenue)}
                  categories={["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]}
                  color="#3b82f6"
                  title=""
                  height={450}
                  showTrend={true}
                  trendColor="#ef4444"
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

          {/* Transaction History */}
          {activeTab === "transactions" && transactionHistory && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="space-y-4">
                  {/* First Row - 40% + 20% + 20% + 20% */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Account - 40% */}
                    <div className="md:w-[40%]">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tài khoản giao dịch
                      </label>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={transactionFilters.searchAccount}
                          onChange={(e) => setTransactionFilters({ ...transactionFilters, searchAccount: e.target.value })}
                          placeholder="Tìm kiếm theo tên hoặc email..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Type Filter - 20% */}
                    <div className="md:w-[20%]">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Loại giao dịch
                      </label>
                      <select
                        value={transactionFilters.typeFilter}
                        onChange={(e) => setTransactionFilters({ ...transactionFilters, typeFilter: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="all">Tất cả</option>
                        <option value={TRANSACTION_TYPES.DEPOSIT}>Nạp tiền</option>
                        <option value={TRANSACTION_TYPES.WITHDRAW}>Rút tiền</option>
                      </select>
                    </div>

                    {/* Date From - 20% */}
                    <div className="md:w-[20%]">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Từ ngày
                      </label>
                      <input
                        type="date"
                        value={transactionFilters.dateFrom}
                        onChange={(e) => {
                          const newDateFrom = e.target.value;
                          const updates = { dateFrom: newDateFrom };
                          if (transactionFilters.dateTo && newDateFrom > transactionFilters.dateTo) {
                            updates.dateTo = "";
                            toast.warning("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
                          }
                          setTransactionFilters({ ...transactionFilters, ...updates });
                        }}
                        max={transactionFilters.dateTo || undefined}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    {/* Date To - 20% */}
                    <div className="md:w-[20%]">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Đến ngày
                      </label>
                      <input
                        type="date"
                        value={transactionFilters.dateTo}
                        onChange={(e) => {
                          const newDateTo = e.target.value;
                          if (transactionFilters.dateFrom && newDateTo < transactionFilters.dateFrom) {
                            toast.error("Ngày kết thúc không thể nhỏ hơn ngày bắt đầu");
                            return;
                          }
                          setTransactionFilters({ ...transactionFilters, dateTo: newDateTo });
                        }}
                        min={transactionFilters.dateFrom || undefined}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Second Row - Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setTransactionFilters(prev => ({ ...prev, page: 1 }));
                      }}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Tìm kiếm
                    </button>
                    <button
                      onClick={() => setTransactionFilters({ searchAccount: "", typeFilter: "all", dateFrom: "", dateTo: "", page: 1, limit: 10 })}
                      className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition font-medium"
                    >
                      Đặt lại
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Người dùng
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Số tài khoản
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Tên tài khoản
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Ngân hàng
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Loại GD
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                          Số tiền
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                          Thời gian
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionLoading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : transactionHistory.transactions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12 text-slate-500">
                            Không có giao dịch nào
                          </td>
                        </tr>
                      ) : (
                        transactionHistory.transactions.map((transaction) => {
                            const typeMeta = TRANSACTION_TYPE_META[transaction.transactionType] || { label: transaction.transactionType, badge: "bg-slate-50 text-slate-600" };
                            
                            return (
                              <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4">
                                  <p className="font-medium text-slate-900">{transaction.user?.fullName}</p>
                                  <p className="text-xs text-slate-500">{transaction.user?.email}</p>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-700 font-mono">{transaction.user?.bankAccount}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-700">{transaction.user?.bankAccountName}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-700">{transaction.user?.bankName}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${typeMeta.badge}`}>
                                    {typeMeta.label}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 text-right font-semibold ${transaction.transferType === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.transferType === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600">
                                  {new Date(transaction.created_at).toLocaleString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {transactionHistory.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      Hiển thị {((transactionFilters.page - 1) * transactionFilters.limit) + 1} - {Math.min(transactionFilters.page * transactionFilters.limit, transactionHistory.pagination.total)} trong tổng số {transactionHistory.pagination.total} giao dịch
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTransactionFilters({ ...transactionFilters, page: transactionFilters.page - 1 })}
                        disabled={transactionFilters.page === 1}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-slate-600">
                        Trang {transactionFilters.page} / {transactionHistory.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setTransactionFilters({ ...transactionFilters, page: transactionFilters.page + 1 })}
                        disabled={transactionFilters.page === transactionHistory.pagination.totalPages}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

