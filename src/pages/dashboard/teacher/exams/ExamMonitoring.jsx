import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiRefreshCw,
  FiUser,
  FiAlertTriangle,
  FiClock,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiMonitor,
  FiGlobe,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";
import { getExamCheatingLogs } from "../../../../services/cheatingLogService";
import formatDateTime from "../../../../utils/format_time";
import {
  initSocket,
  disconnectSocket,
  joinExamMonitoring,
  leaveExamMonitoring,
  onNewCheatingEvent,
} from "../../../../services/socketService";

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

// Component để hiển thị từng log item
function LogItem({ log }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatMetadata = (metadata, cheatingType) => {
    if (!metadata || typeof metadata !== 'object') return null;
    
    const items = [];
    if (metadata.timestamp) {
      items.push({
        label: "Thời gian",
        value: new Date(metadata.timestamp).toLocaleString("vi-VN"),
        icon: <FiClock className="text-slate-400" />
      });
    }
    if (metadata.user_agent) {
      items.push({
        label: "Trình duyệt",
        value: metadata.user_agent,
        icon: <FiGlobe className="text-slate-400" />
      });
    }
    // Chỉ hiển thị window_count cho multiple_tabs vì nó có ý nghĩa ở đó
    // Với tab_switch, window_count không có ý nghĩa vì đã chuyển tab rồi
    if (metadata.window_count !== undefined && cheatingType === 'multiple_tabs') {
      items.push({
        label: "Số cửa sổ",
        value: metadata.window_count,
        icon: <FiMonitor className="text-slate-400" />
      });
    }
    
    // Các field khác (trừ window_count nếu là tab_switch)
    Object.keys(metadata).forEach(key => {
      const excludedKeys = ['timestamp', 'user_agent'];
      // Bỏ window_count nếu là tab_switch
      if (cheatingType === 'tab_switch' && key === 'window_count') {
        return;
      }
      if (!excludedKeys.includes(key) && !(key === 'window_count' && cheatingType !== 'multiple_tabs')) {
        items.push({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: typeof metadata[key] === 'object' 
            ? JSON.stringify(metadata[key], null, 2)
            : String(metadata[key]),
          icon: <FiInfo className="text-slate-400" />
        });
      }
    });
    
    return items;
  };

  const metadataItems = log.metadata ? formatMetadata(log.metadata, log.cheating_type) : null;

  return (
    <div className="group transition hover:bg-slate-50">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header row */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  log.severity === 'critical' ? 'bg-red-100' :
                  log.severity === 'high' ? 'bg-orange-100' :
                  log.severity === 'medium' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  <FiAlertTriangle className={`text-lg ${
                    log.severity === 'critical' ? 'text-red-600' :
                    log.severity === 'high' ? 'text-orange-600' :
                    log.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FiUser className="text-slate-400 flex-shrink-0" />
                      <p className="font-semibold text-slate-900 truncate">
                        {log.student?.fullName || "Không tên"}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {log.student?.email || ""}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                        SEVERITY_COLORS[log.severity] ||
                        SEVERITY_COLORS.medium
                      }`}
                    >
                      {SEVERITY_LABELS[log.severity] || log.severity}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <FiClock className="text-slate-400" />
                    <span className="text-xs">
                      {log.detected_at
                        ? formatDateTime(log.detected_at)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-700">
                      {CHEATING_TYPE_LABELS[log.cheating_type] ||
                        log.cheating_type}
                    </span>
                  </div>
                </div>
                
                {log.description && (
                  <p className="text-sm text-slate-600 mt-2">
                    {log.description}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata details */}
            {metadataItems && metadataItems.length > 0 && (
              <div className="ml-14">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
                >
                  {isExpanded ? (
                    <>
                      <FiChevronUp />
                      Ẩn chi tiết
                    </>
                  ) : (
                    <>
                      <FiChevronDown />
                      Xem chi tiết
                    </>
                  )}
                </button>
                
                {isExpanded && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                    {metadataItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 mb-0.5">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-600 break-words">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamMonitoringPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [filter, setFilter] = useState({
    severity: "",
    type: "",
    studentId: "",
  });
  // Ref để track các log đã hiển thị toast (tránh hiển thị 2 lần)
  const notifiedLogIds = useRef(new Set());

  // Khởi tạo và kết nối WebSocket khi component mount
  useEffect(() => {
    if (examId) {
      loadData();
      
      // Khởi tạo WebSocket
      const socket = initSocket();
      
      // Lắng nghe sự kiện kết nối
      socket.on("connect", () => {
        setSocketConnected(true);
        joinExamMonitoring(examId);
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
      });

      // Cleanup khi unmount
      return () => {
        leaveExamMonitoring(examId);
        // Không disconnect socket hoàn toàn vì có thể đang dùng ở nơi khác
      };
    }
  }, [examId]);

  // Lắng nghe sự kiện gian lận mới qua WebSocket
  useEffect(() => {
    if (!examId || !isMonitoring) return;

    const unsubscribe = onNewCheatingEvent((data) => {
      // Chỉ xử lý nếu là exam đang theo dõi
      if (data.exam_id?.toString() === examId.toString()) {
        const logId = data.log.id;
        
        // Kiểm tra xem đã hiển thị toast cho log này chưa
        if (notifiedLogIds.current.has(logId)) {
          return; // Đã hiển thị rồi, bỏ qua
        }

        // Thêm log mới vào đầu danh sách
        setLogs((prevLogs) => {
          // Kiểm tra xem log đã tồn tại chưa (tránh duplicate)
          const exists = prevLogs.some((log) => log.id === logId);
          if (exists) {
            // Nếu đã tồn tại, đánh dấu đã thông báo
            notifiedLogIds.current.add(logId);
            return prevLogs;
          }
          
          // Thêm log mới và cập nhật statistics
          const newLogs = [data.log, ...prevLogs];
          updateStatistics(newLogs);
          
          return newLogs;
        });

        // Đánh dấu đã hiển thị toast và hiển thị thông báo (ra ngoài setLogs)
        notifiedLogIds.current.add(logId);
        toast.info(
          `Phát hiện gian lận mới: ${CHEATING_TYPE_LABELS[data.log.cheating_type] || data.log.cheating_type}`,
          { autoClose: 3000 }
        );
      }
    });

    return () => {
      unsubscribe();
      // Reset notified logs khi unmount hoặc dependencies thay đổi
      notifiedLogIds.current.clear();
    };
  }, [examId, isMonitoring]);

  // Hàm cập nhật statistics
  const updateStatistics = (logs) => {
    const studentStats = {};
    logs.forEach((log) => {
      const studentId = log.student_id;
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: log.student,
          total_events: 0,
          events_by_type: {},
          events_by_severity: {},
          first_event: log.detected_at,
          last_event: log.detected_at,
        };
      }
      studentStats[studentId].total_events++;
      studentStats[studentId].events_by_type[log.cheating_type] =
        (studentStats[studentId].events_by_type[log.cheating_type] || 0) + 1;
      studentStats[studentId].events_by_severity[log.severity] =
        (studentStats[studentId].events_by_severity[log.severity] || 0) + 1;
      if (new Date(log.detected_at) < new Date(studentStats[studentId].first_event)) {
        studentStats[studentId].first_event = log.detected_at;
      }
      if (new Date(log.detected_at) > new Date(studentStats[studentId].last_event)) {
        studentStats[studentId].last_event = log.detected_at;
      }
    });

    setStatistics({
      total_events: logs.length,
      total_students: Object.keys(studentStats).length,
      by_student: Object.values(studentStats),
      by_type: logs.reduce((acc, log) => {
        acc[log.cheating_type] = (acc[log.cheating_type] || 0) + 1;
        return acc;
      }, {}),
      by_severity: logs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {}),
    });
  };

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
      if (data.statistics) {
        setStatistics(data.statistics);
      } else {
        // Tạo statistics từ logs nếu backend không trả về
        updateStatistics(data.logs || []);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error(
        error?.body?.message || error?.message || "Không thể tải logs."
      );
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
        <header className="relative overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
                >
                  <FiArrowLeft />
                  Quay lại
                </button>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                  Giám sát gian lận
                </p>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                {exam?.title || "Đề thi"}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Theo dõi các hành vi gian lận trong thời gian thực
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadLogs}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                Làm mới
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMonitoring(!isMonitoring);
                  if (!isMonitoring) {
                    // Đảm bảo đã join room khi bật monitoring
                    joinExamMonitoring(examId);
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                  isMonitoring
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:shadow-md"
                }`}
              >
                <FiClock />
                {isMonitoring ? "Tắt giám sát" : "Bật giám sát"}
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-red-200 opacity-20 blur-2xl"></div>
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
              <div className="text-sm text-slate-500">Trạng thái kết nối</div>
              <div className="mt-1 flex items-center gap-2">
                {socketConnected ? (
                  <>
                    <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"></div>
                    <span className="text-lg font-semibold text-emerald-600">
                      {isMonitoring ? "Đang giám sát" : "Đã kết nối"}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-lg font-semibold text-red-600">
                      Mất kết nối
                    </span>
                  </>
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

        {/* Logs List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách sự kiện ({filteredLogs.length})
            </h2>
          </div>
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <FiAlertTriangle className="mx-auto mb-3 text-4xl text-slate-300" />
              <p className="text-sm text-slate-500">
                {logs.length === 0
                  ? "Chưa có sự kiện gian lận nào được ghi nhận."
                  : "Không có sự kiện nào khớp với bộ lọc."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ExamMonitoringPage;

