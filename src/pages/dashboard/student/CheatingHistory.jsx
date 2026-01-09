import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getStudentCheatingLogs } from "../../../services/cheatingLogService";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  AlertTriangle,
  ArrowLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
} from "lucide-react";

const SEVERITY_COLORS = {
  low: "bg-blue-50 border-blue-200 text-blue-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  high: "bg-orange-50 border-orange-200 text-orange-700",
  critical: "bg-red-50 border-red-200 text-red-700",
};

const TYPE_LABELS = {
  tab_switch: "Chuyển tab",
  window_blur: "Mất focus cửa sổ",
  fullscreen_exit: "Thoát fullscreen",
  copy_paste: "Copy/Paste",
  right_click: "Click chuột phải",
  keyboard_shortcut: "Phím tắt",
  multiple_tabs: "Nhiều tab",
  time_suspicious: "Thời gian trả lời bất thường",
  answer_pattern: "Mẫu trả lời bất thường",
  device_change: "Thay đổi thiết bị",
  ip_change: "Thay đổi IP",
  browser_change: "Thay đổi trình duyệt",
  other: "Khác",
};

export default function CheatingHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    exam_id: "",
    severity: "",
    type: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [pagination.page, filters.exam_id]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.exam_id) {
        params.exam_id = filters.exam_id;
      }

      const data = await getStudentCheatingLogs(params);
      setLogs(data.logs || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error loading cheating logs:", error);
      toast.error(
        error?.body?.message || error?.message || "Không thể tải lịch sử gian lận"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.type && log.cheating_type !== filters.type) return false;
    return true;
  });

  const uniqueExams = Array.from(
    new Set(logs.map((log) => log.exam?.id).filter(Boolean))
  ).map((id) => {
    const log = logs.find((l) => l.exam?.id === id);
    return {
      id,
      title: log?.exam?.title || "Không tên",
    };
  });

  const uniqueTypes = Array.from(
    new Set(logs.map((log) => log.cheating_type))
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const clearFilters = () => {
    setFilters({
      exam_id: "",
      severity: "",
      type: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    filters.exam_id !== "" || filters.severity !== "" || filters.type !== "";

  // Statistics
  const statistics = {
    total: logs.length,
    by_severity: logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {}),
    by_type: logs.reduce((acc, log) => {
      acc[log.cheating_type] = (acc[log.cheating_type] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/student")}
              className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <div>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Lịch sử gian lận của tôi
              </h1>
            </div>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">Tổng số sự kiện</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {pagination.total}
            </div>
          </div>
          {Object.entries(statistics.by_severity).map(([severity, count]) => (
            <div
              key={severity}
              className={`rounded-xl border p-4 shadow-sm ${
                SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium
              }`}
            >
              <div className="text-sm opacity-90">
                {severity === "low"
                  ? "Mức độ thấp"
                  : severity === "medium"
                  ? "Mức độ trung bình"
                  : severity === "high"
                  ? "Mức độ cao"
                  : "Mức độ nghiêm trọng"}
              </div>
              <div className="mt-1 text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                  Đang áp dụng
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Đề thi
                </label>
                <select
                  value={filters.exam_id}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, exam_id: e.target.value }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Tất cả đề thi</option>
                  {uniqueExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Mức độ
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, severity: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="critical">Nghiêm trọng</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Loại gian lận
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Logs List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách sự kiện ({filteredLogs.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm text-slate-500">
                {logs.length === 0
                  ? "Bạn chưa có lịch sử gian lận nào."
                  : "Không có sự kiện nào khớp với bộ lọc."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-6 transition hover:bg-slate-50 ${
                      SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.medium
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-semibold">
                            {TYPE_LABELS[log.cheating_type] || log.cheating_type}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium opacity-90">
                            {log.severity || "medium"}
                          </span>
                        </div>
                        {log.exam && (
                          <div className="mb-2 flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">{log.exam.title}</span>
                          </div>
                        )}
                        {log.description && (
                          <p className="mb-2 text-sm opacity-90">{log.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs opacity-75">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.detected_at).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Trang {pagination.page} / {pagination.totalPages} (
                      {pagination.total} sự kiện)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

