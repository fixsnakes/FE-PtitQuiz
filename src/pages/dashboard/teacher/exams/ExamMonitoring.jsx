import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiRefreshCw,
  FiUser,
  FiAlertTriangle,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";
import { getExamCheatingLogs } from "../../../../services/cheatingLogService";
import formatDateTime from "../../../../utils/format_time";

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const SEVERITY_LABELS = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  critical: "Nghiêm trọng",
};

const CHEATING_TYPE_LABELS = {
  tab_switch: "Chuyển tab",
  window_blur: "Mất focus cửa sổ",
  fullscreen_exit: "Thoát fullscreen",
  copy_paste: "Copy/Paste",
  right_click: "Click chuột phải",
  keyboard_shortcut: "Phím tắt",
  multiple_tabs: "Nhiều tab",
  time_suspicious: "Thời gian bất thường",
  answer_pattern: "Mẫu trả lời bất thường",
  device_change: "Thay đổi thiết bị",
  ip_change: "Thay đổi IP",
  browser_change: "Thay đổi trình duyệt",
  other: "Khác",
};

function ExamMonitoringPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filter, setFilter] = useState({
    severity: "",
    type: "",
    studentId: "",
  });

  useEffect(() => {
    if (examId) {
      loadData();
    }
  }, [examId]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLogs();
      }, 5000); // Refresh mỗi 5 giây
      return () => clearInterval(interval);
    }
  }, [autoRefresh, examId, filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examResponse] = await Promise.all([
        getExamDetail(examId),
        loadLogs(),
      ]);
      setExam(examResponse);
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể tải dữ liệu."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await getExamCheatingLogs(examId);
      setLogs(data.logs || []);
      setStatistics(data.statistics || null);
    } catch (error) {
      console.error("Error loading logs:", error);
      if (!autoRefresh) {
        toast.error(
          error?.body?.message || error?.message || "Không thể tải logs."
        );
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter.severity && log.severity !== filter.severity) return false;
    if (filter.type && log.cheating_type !== filter.type) return false;
    if (filter.studentId && log.student_id?.toString() !== filter.studentId)
      return false;
    return true;
  });

  const uniqueStudents = Array.from(
    new Set(logs.map((log) => log.student_id))
  ).map((id) => {
    const log = logs.find((l) => l.student_id === id);
    return {
      id,
      name: log?.student?.fullName || "Không tên",
      email: log?.student?.email || "",
    };
  });

  const uniqueTypes = Array.from(
    new Set(logs.map((log) => log.cheating_type))
  );

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-3xl text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
              Quay lại
            </button>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Giám sát gian lận
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {exam?.title || "Đề thi"}
            </h1>
            <p className="text-sm text-slate-500">
              Theo dõi các hành vi gian lận trong thời gian thực
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadLogs}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                autoRefresh
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FiClock />
              {autoRefresh ? "Tắt tự động" : "Bật tự động"}
            </button>
          </div>
        </header>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Tổng sự kiện</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {statistics.total_events || logs.length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Số học sinh</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {statistics.total_students || uniqueStudents.length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Mức độ cao</div>
              <div className="mt-1 text-2xl font-bold text-red-600">
                {(statistics.by_severity?.high || 0) +
                  (statistics.by_severity?.critical || 0)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Đang theo dõi</div>
              <div className="mt-1 flex items-center gap-2">
                {autoRefresh ? (
                  <>
                    <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"></div>
                    <span className="text-lg font-semibold text-emerald-600">
                      Hoạt động
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-semibold text-slate-400">
                    Tạm dừng
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FiFilter className="text-slate-500" />
            <h3 className="font-semibold text-slate-900">Bộ lọc</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Mức độ nghiêm trọng
              </label>
              <select
                value={filter.severity}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, severity: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Loại gian lận
              </label>
              <select
                value={filter.type}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {CHEATING_TYPE_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Học sinh
              </label>
              <select
                value={filter.studentId}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, studentId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả</option>
                {uniqueStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách sự kiện ({filteredLogs.length})
            </h2>
          </div>
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              {logs.length === 0
                ? "Chưa có sự kiện gian lận nào được ghi nhận."
                : "Không có sự kiện nào khớp với bộ lọc."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Thời gian</th>
                    <th className="px-4 py-3 text-left">Học sinh</th>
                    <th className="px-4 py-3 text-left">Loại</th>
                    <th className="px-4 py-3 text-left">Mô tả</th>
                    <th className="px-4 py-3 text-center">Mức độ</th>
                    <th className="px-4 py-3 text-left">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {log.detected_at
                          ? formatDateTime(log.detected_at)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">
                              {log.student?.fullName || "Không tên"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {log.student?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700">
                          {CHEATING_TYPE_LABELS[log.cheating_type] ||
                            log.cheating_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                            SEVERITY_COLORS[log.severity] ||
                            SEVERITY_COLORS.medium
                          }`}
                        >
                          {SEVERITY_LABELS[log.severity] || log.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-xs text-indigo-600 hover:text-indigo-700">
                              Xem chi tiết
                            </summary>
                            <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs">
                              <pre className="whitespace-pre-wrap text-slate-700">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </details>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ExamMonitoringPage;

