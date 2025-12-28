import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiFileText,
  FiFilter,
  FiLoader,
  FiSearch,
  FiUsers,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiMessageSquare,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getTeacherClasses } from "../../../../services/classService";
import { listExams, deleteExam } from "../../../../services/examService";
import { getCommentsByExam, deleteComment, createComment } from "../../../../services/examCommentService";
import formatDateTime from "../../../../utils/format_time";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "ongoing", label: "Đang diễn ra" },
  { value: "ended", label: "Đã kết thúc" },
];

function computeStatus({ start_time, end_time }) {
  const now = new Date();
  const start = start_time ? new Date(start_time) : null;
  const end = end_time ? new Date(end_time) : null;

  if (start && now < start) return "upcoming";
  if (start && end) {
    if (now >= start && now <= end) return "ongoing";
    if (now > end) return "ended";
  }
  if (end && now > end) return "ended";
  return "ongoing";
}

function statusBadge(status) {
  switch (status) {
    case "upcoming":
      return {
        label: "Sắp diễn ra",
        className: "bg-blue-50 text-blue-600 border-blue-200",
      };
    case "ongoing":
      return {
        label: "Đang diễn ra",
        className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      };
    case "ended":
      return {
        label: "Đã kết thúc",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
    default:
      return {
        label: "Không xác định",
        className: "bg-slate-100 text-slate-500 border-slate-200",
      };
  }
}

function normalizeExam(exam) {
  const status = computeStatus(exam);
  
  // Lấy danh sách classes (many-to-many)
  let classes = [];
  if (exam.classes && Array.isArray(exam.classes)) {
    classes = exam.classes;
  } else if (exam.class) {
    // Backward compatibility: nếu vẫn có class cũ
    classes = [exam.class];
  }
  
  // Tạo chuỗi hiển thị classes
  const classesDisplay = classes.length > 0 
    ? classes.map(cls => cls.className ?? cls.name ?? "Không tên").join(", ")
    : null;
  
  return {
    id: exam.id ?? exam.exam_id ?? exam._id,
    title: exam.title ?? "Không tiêu đề",
    description: exam.des ?? exam.description ?? "",
    minutes: exam.minutes ?? exam.duration ?? null,
    totalScore: exam.total_score ?? exam.totalScore ?? null,
    startTime: exam.start_time ?? exam.startTime ?? null,
    endTime: exam.end_time ?? exam.endTime ?? null,
    questionCount: exam.question_count ?? exam.questionsCount ?? exam.questionCount ?? 0,
    submissionCount:
      exam.submission_count ?? exam.attemptCount ?? exam.student_submissions ?? 0,
    status,
    classes: classes, // Array of classes
    classesDisplay: classesDisplay, // String for display
    className: classesDisplay, // For backward compatibility
    questionMethod:
      exam.question_creation_method ??
      exam.questionMethod ??
      exam.question_method ??
      null,
  };
}

export default function ExamListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    keyword: "",
    classId: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Comments management state
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    async function loadClasses() {
      setLoadingClasses(true);
      try {
        const response = await getTeacherClasses();
        setClasses(response ? (Array.isArray(response) ? response : response.data ?? []) : []);
      } catch (err) {
        console.error("Không thể tải lớp:", err);
      } finally {
        setLoadingClasses(false);
      }
    }
    loadClasses();
  }, []);

  const fetchExams = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await listExams({
        search: params.keyword,
        class_id: params.classId,
        status: params.status,
        start_time: params.startDate,
        end_time: params.endDate,
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.exams)
        ? response.exams
        : [];
      setExams(items.map(normalizeExam));
    } catch (err) {
      setError(
        err?.body?.message ||
          err?.message ||
          "Không thể tải danh sách đề thi. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchExams(filters);
  };

  const resetFilters = () => {
    const next = {
      keyword: "",
      classId: "",
      status: "",
      startDate: "",
      endDate: "",
    };
    setFilters(next);
    fetchExams(next);
  };

  // Load comments for selected exam
  const loadComments = async (examId) => {
    if (!examId) return;
    try {
      setCommentsLoading(true);
      const response = await getCommentsByExam(examId);
      setComments(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setCommentsLoading(false);
    }
  };

  // Open comments modal
  const handleOpenComments = async (examId) => {
    setSelectedExamId(examId);
    setShowCommentsModal(true);
    await loadComments(examId);
  };

  // Close comments modal
  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedExamId(null);
    setComments([]);
    setReplyingTo(null);
    setReplyText("");
    setNewCommentText("");
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }
    if (!selectedExamId) return;
    try {
      await createComment({
        exam_id: selectedExamId,
        text: newCommentText.trim(),
      });
      setNewCommentText("");
      toast.success("Đã thêm bình luận");
      await loadComments(selectedExamId);
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error(error.message || "Không thể thêm bình luận");
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    if (!selectedExamId) return;
    try {
      await createComment({
        exam_id: selectedExamId,
        text: replyText.trim(),
        parent_id: parentId,
      });
      setReplyText("");
      setReplyingTo(null);
      toast.success("Đã thêm phản hồi");
      await loadComments(selectedExamId);
    } catch (error) {
      console.error("Error creating reply:", error);
      toast.error(error.message || "Không thể thêm phản hồi");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await deleteComment(commentId);
      toast.success("Đã xóa bình luận");
      if (selectedExamId) {
        await loadComments(selectedExamId);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.message || "Không thể xóa bình luận");
    }
  };

  const filteredCountLabel = useMemo(() => {
    if (!filters.keyword && !filters.classId && !filters.status && !filters.startDate && !filters.endDate) {
      return "Tất cả đề thi của bạn";
    }
    return "Đã áp dụng bộ lọc";
  }, [filters]);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Bài thi
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Danh sách đề thi</h1>
              <p className="mt-1 text-sm text-slate-600">{filteredCountLabel}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
              >
                <FiFilter />
                Xóa lọc
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/teacher/exams/create")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
              >
                <FiFileText />
                Tạo đề thi mới
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-200 opacity-20 blur-2xl"></div>
        </header>

        {/* Compact Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Always visible search bar */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
                  <FiSearch className="mr-2 text-slate-400" />
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(event) => handleFilterChange("keyword", event.target.value)}
                    placeholder="Tìm kiếm đề thi..."
                    className="flex-1 text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
              >
                <FiFilter />
                Bộ lọc
                {showFilters ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                {(filters.status || filters.classId || filters.startDate || filters.endDate) && (
                  <span className="ml-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {[filters.status, filters.classId, filters.startDate, filters.endDate].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible advanced filters */}
          {showFilters && (
            <div className="border-t border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Trạng thái</label>
                  <select
                    value={filters.status}
                    onChange={(event) => handleFilterChange("status", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Lớp học</label>
                  <select
                    value={filters.classId}
                    onChange={(event) => handleFilterChange("classId", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Tất cả lớp</option>
                    {!loadingClasses &&
                      classes.map((cls) => (
                        <option key={cls.id ?? cls.classId} value={cls.id ?? cls.classId}>
                          {cls.className ?? cls.name ?? "Không tên"}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Khoảng thời gian</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(event) => handleFilterChange("startDate", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Từ ngày"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(event) => handleFilterChange("endDate", event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500">
                  {(filters.status || filters.classId || filters.startDate || filters.endDate) && (
                    <span>
                      Đang áp dụng <strong>{[filters.status, filters.classId, filters.startDate, filters.endDate].filter(Boolean).length}</strong> bộ lọc
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    Áp dụng
                  </button>
                  {(filters.status || filters.classId || filters.startDate || filters.endDate) && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                      <FiX className="h-3 w-3" />
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <FiLoader className="absolute inset-0 m-auto animate-pulse text-xl text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Đang tải danh sách đề thi...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2">
                  <FiFileText className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-red-900">Lỗi tải dữ liệu</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : exams.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-50">
                <FiFileText className="text-4xl text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-700">Không tìm thấy đề thi nào</h3>
              <p className="mb-6 text-sm text-slate-500">
                {Object.values(filters).some(v => v) 
                  ? "Thử điều chỉnh bộ lọc để tìm thấy đề thi phù hợp."
                  : "Bắt đầu tạo đề thi đầu tiên của bạn."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/dashboard/teacher/exams/create")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
              >
                <FiFileText />
                Tạo đề thi đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam, index) => {
                const badge = statusBadge(exam.status);
                return (
                  <div
                    key={exam.id}
                    className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-700">{exam.title}</h2>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          {exam.classes && exam.classes.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              <FiUsers className="h-3 w-3" />
                              {exam.classes.length} {exam.classes.length === 1 ? 'lớp' : 'lớp'}
                            </span>
                          )}
                          {!exam.classes && exam.className && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              <FiUsers className="h-3 w-3" />
                              1 lớp
                            </span>
                          )}
                        </div>
                        <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                          {exam.description || "Chưa có mô tả."}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 text-slate-700 shadow-sm transition-all hover:shadow-md">
                            <FiClock className="text-indigo-500" />
                            {exam.minutes ? `${exam.minutes} phút` : "Không giới hạn"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 text-slate-700 shadow-sm transition-all hover:shadow-md">
                            <FiFileText className="text-indigo-500" />
                            {exam.questionCount} câu hỏi
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-50 to-white px-3 py-1.5 text-slate-700 shadow-sm transition-all hover:shadow-md">
                            <FiUsers className="text-indigo-500" />
                            {exam.submissionCount} lượt làm
                          </span>
                          {exam.totalScore && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-1.5 font-semibold text-indigo-700 shadow-sm">
                              {exam.totalScore} điểm
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 text-sm shadow-sm">
                        <div className="flex items-start gap-2 text-slate-600">
                          <FiCalendar className="mt-0.5 text-indigo-500" />
                          <div className="space-y-1">
                            <p className="font-medium text-slate-700">
                              {exam.startTime
                                ? new Date(exam.startTime).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : "Không đặt lịch"}
                            </p>
                            <p className="text-xs text-slate-500">
                              → {exam.endTime
                                ? new Date(exam.endTime).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : "Không giới hạn"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {(() => {
                        const method = exam.questionMethod;
                        const targetPath = method
                          ? `/dashboard/teacher/exams/${exam.id}/questions/${
                              method === "text" ? "text" : "editor"
                            }`
                          : `/dashboard/teacher/exams/${exam.id}/questions`;
                        return (
                          <Link
                            to={targetPath}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5"
                          >
                            Quản lý câu hỏi
                          </Link>
                        );
                      })()}
                      <Link
                        to={`/dashboard/teacher/exams/${exam.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md hover:-translate-y-0.5"
                      >
                        Chỉnh sửa
                      </Link>
                      <Link
                        to={`/dashboard/teacher/exams/${exam.id}/results`}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-600 shadow-sm transition-all hover:bg-emerald-50 hover:shadow-md hover:-translate-y-0.5"
                      >
                        Xem kết quả
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenComments(exam.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2 text-xs font-semibold text-purple-600 shadow-sm transition-all hover:bg-purple-50 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <FiMessageSquare />
                        Quản lý bình luận
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow-md hover:-translate-y-0.5"
                        onClick={async () => {
                          if (!window.confirm(`Bạn chắc chắn muốn xóa đề thi "${exam.title}"?`)) {
                            return;
                          }
                          try {
                            const { deleteExam } = await import("../../../../services/examService");
                            await deleteExam(exam.id);
                            toast.success("Đã xóa đề thi thành công.");
                            fetchExams(filters);
                          } catch (err) {
                            toast.error(err?.body?.message || err?.message || "Không thể xóa đề thi.");
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Comments Management Modal */}
        {showCommentsModal && selectedExamId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 p-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Quản lý bình luận</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {exams.find(e => e.id === selectedExamId)?.title || "Đề thi"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => loadComments(selectedExamId)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <FiLoader className="animate-spin" />
                    Làm mới
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseComments}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* New Comment Form */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Viết bình luận mới</h3>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Nhập bình luận của bạn..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={!newCommentText.trim()}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đăng bình luận
                    </button>
                  </div>
                </div>

                {commentsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <FiLoader className="animate-spin text-3xl text-indigo-600" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
                    <FiMessageSquare className="mx-auto mb-2 text-4xl text-slate-300" />
                    <p>Chưa có bình luận nào</p>
                    <p className="mt-1 text-xs">Hãy là người đầu tiên bình luận!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        {/* Comment Header */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                              <span className="text-sm font-bold">
                                {comment.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {comment.user?.fullName || "Người dùng"}
                                {comment.user?.role && (
                                  <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                    {comment.user.role === "teacher" ? "Giáo viên" : "Học sinh"}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDateTime(comment.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            title="Xóa bình luận"
                          >
                            <FiTrash2 className="h-3 w-3" />
                            Xóa
                          </button>
                        </div>

                        {/* Comment Content */}
                        <p className="mb-3 text-slate-700 whitespace-pre-wrap">{comment.text}</p>

                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="mb-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {replyingTo === comment.id ? "Hủy phản hồi" : "Phản hồi"}
                        </button>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập phản hồi của bạn..."
                              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              rows={3}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyText.trim()}
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Đăng phản hồi
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="rounded-lg bg-slate-50 p-3">
                                <div className="mb-2 flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                                      <span className="text-xs font-bold">
                                        {reply.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {reply.user?.fullName || "Người dùng"}
                                        {reply.user?.role && (
                                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                                            {reply.user.role === "teacher" ? "GV" : "HS"}
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {formatDateTime(reply.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                    title="Xóa phản hồi"
                                  >
                                    <FiTrash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

