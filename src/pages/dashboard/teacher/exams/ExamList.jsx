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
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getTeacherClasses } from "../../../../services/classService";
import { listExams, deleteExam } from "../../../../services/examService";

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
    className:
      exam.class?.className ?? exam.class_name ?? exam.className ?? exam.class?.name ?? null,
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

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Tìm kiếm</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
                <FiSearch className="mr-2 text-slate-400" />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(event) => handleFilterChange("keyword", event.target.value)}
                  placeholder="Tìm theo tên đề thi"
                  className="flex-1 text-sm text-slate-700 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(event) => handleFilterChange("status", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Lớp học</label>
              <select
                value={filters.classId}
                onChange={(event) => handleFilterChange("classId", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Từ ngày</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => handleFilterChange("startDate", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Đến ngày</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => handleFilterChange("endDate", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
            >
              Áp dụng bộ lọc
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
            >
              Đặt lại
            </button>
          </div>
        </section>

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
                          {exam.className && (
                            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              {exam.className}
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
      </div>
    </DashboardLayout>
  );
}

