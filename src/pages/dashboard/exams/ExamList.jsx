import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiFilter,
  FiLoader,
  FiSearch,
  FiUsers,
  FiClock,
} from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getTeacherClasses } from "../../../services/classService";
import { listExams } from "../../../services/examService";

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
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Kỳ thi
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Danh sách đề thi</h1>
            <p className="text-sm text-slate-500">{filteredCountLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              <FiFilter />
              Xóa lọc
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/teacher/exams/create")}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow"
            >
              + Tạo đề thi mới
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700">Tìm kiếm</label>
              <div className="mt-1 flex items-center rounded-lg border border-slate-200 px-3 py-2">
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
              <label className="text-sm font-medium text-slate-700">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(event) => handleFilterChange("status", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Lớp học</label>
              <select
                value={filters.classId}
                onChange={(event) => handleFilterChange("classId", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
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
              <label className="text-sm font-medium text-slate-700">Từ ngày</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => handleFilterChange("startDate", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Đến ngày</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => handleFilterChange("endDate", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Đặt lại
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <FiLoader className="animate-spin" />
              Đang tải danh sách đề thi...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center text-slate-500">
              <p>Không tìm thấy đề thi nào.</p>
              <button
                type="button"
                onClick={() => navigate("/dashboard/teacher/exams/create")}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600"
              >
                Tạo đề thi đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => {
                const badge = statusBadge(exam.status);
                return (
                  <div
                    key={exam.id}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-slate-900">{exam.title}</h2>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                          {exam.description || "Chưa có mô tả."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <FiClock />
                            {exam.minutes ? `${exam.minutes} phút` : "Không giới hạn"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FiUsers />
                            {exam.questionCount} câu hỏi
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <FiUsers />
                            {exam.submissionCount} lượt làm
                          </span>
                          {exam.totalScore && (
                            <span className="inline-flex items-center gap-1">
                              Tổng điểm: {exam.totalScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-slate-400" />
                          <div>
                            <p>
                              {exam.startTime
                                ? new Date(exam.startTime).toLocaleString()
                                : "Không đặt lịch"}
                            </p>
                            <p>
                              {exam.endTime
                                ? new Date(exam.endTime).toLocaleString()
                                : "Không giới hạn"}
                            </p>
                          </div>
                        </div>
                        {exam.className && (
                          <p className="mt-2 text-xs text-slate-500">
                            Lớp: {exam.className}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={`/dashboard/teacher/exams/${exam.id}/questions`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                      >
                        Quản lý câu hỏi
                      </Link>
                      <Link
                        to={`/dashboard/teacher/exams/${exam.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 px-4 py-2 text-xs font-semibold text-indigo-600"
                      >
                        Chỉnh sửa
                      </Link>
                      <Link
                        to={`/dashboard/teacher/exams/${exam.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600"
                        onClick={() => alert("Chức năng xóa sẽ được bổ sung sau.")}
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

