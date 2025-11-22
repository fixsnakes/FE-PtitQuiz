import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getStudentExamsWithStatus,
  getStudentExamsByStatus,
} from "../../../services/studentExamService";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  Clock,
  BookOpen,
  Users,
  AlertCircle,
  Play,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from "lucide-react";

export default function StudentExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, not_started, in_progress, completed

  useEffect(() => {
    loadExams();
  }, [filter]);

  const loadExams = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === "all") {
        response = await getStudentExamsWithStatus();
      } else {
        response = await getStudentExamsByStatus({ status: filter });
      }

      // Xử lý response có thể có success wrapper hoặc không
      const data = response?.success !== undefined 
        ? (response?.data || [])
        : (Array.isArray(response) ? response : []);
      
      setExams(data);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error(
        error?.body?.message || error?.message || "Không thể tải danh sách bài thi"
      );
    } finally {
      setLoading(false);
    }
  };

  // Tính toán status của exam dựa trên thời gian
  const computeExamStatus = (exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (start && now < start) return "upcoming";
    if (start && end) {
      if (now >= start && now <= end) return "ongoing";
      if (now > end) return "ended";
    }
    if (end && now > end) return "ended";
    return "ongoing";
  };

  const getExamStatusBadge = (exam) => {
    const status = computeExamStatus(exam);
    const badges = {
      upcoming: {
        label: "Sắp diễn ra",
        className: "bg-blue-100 text-blue-700",
      },
      ongoing: {
        label: "Đang diễn ra",
        className: "bg-green-100 text-green-700",
      },
      ended: {
        label: "Đã kết thúc",
        className: "bg-gray-100 text-gray-700",
      },
    };

    const badge = badges[status] || badges.ended;
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const getAttemptStatusBadge = (attemptStatus) => {
    if (!attemptStatus) {
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Chưa làm
        </span>
      );
    }

    const badges = {
      not_started: {
        label: "Chưa làm",
        className: "bg-slate-100 text-slate-600",
        icon: null,
      },
      in_progress: {
        label: "Đang làm",
        className: "bg-amber-100 text-amber-700",
        icon: <RotateCcw className="h-3 w-3" />,
      },
      completed: {
        label: "Đã hoàn thành",
        className: "bg-emerald-100 text-emerald-700",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
    };

    const badge = badges[attemptStatus.status] || badges.not_started;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
      >
        {badge.icon}
        {badge.label}
        {attemptStatus.attempt_count > 0 && (
          <span className="ml-1 font-semibold">
            ({attemptStatus.attempt_count} lần)
          </span>
        )}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartExam = (examId) => {
    navigate(`/student/exams/${examId}/take`);
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === "all") return true;
    const attemptStatus = exam.attempt_status;
    if (!attemptStatus) {
      return filter === "not_started";
    }
    return attemptStatus.status === filter;
  });

  return (
    <DashboardLayout role="student">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Danh sách bài thi</h1>
            <p className="mt-2 text-gray-600">
              Chọn bài thi để bắt đầu làm bài
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("not_started")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === "not_started"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Chưa làm
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === "in_progress"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Đang làm
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === "completed"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Đã hoàn thành
            </button>
          </div>

          {/* Exams List */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                {filter === "all"
                  ? "Chưa có bài thi nào"
                  : filter === "not_started"
                  ? "Chưa có bài thi nào chưa làm"
                  : filter === "in_progress"
                  ? "Chưa có bài thi nào đang làm"
                  : "Chưa có bài thi nào đã hoàn thành"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((exam) => {
                const attemptStatus = exam.attempt_status;
                const examStatus = computeExamStatus(exam);
                const canStart = examStatus !== "ended" && examStatus !== "upcoming";

                return (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                          {exam.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {getExamStatusBadge(exam)}
                          {getAttemptStatusBadge(attemptStatus)}
                        </div>
                      </div>
                    </div>

                    {exam.des && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {exam.des}
                      </p>
                    )}

                    {/* Thông tin điểm số nếu đã làm */}
                    {attemptStatus && attemptStatus.attempt_count > 0 && (
                      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Trophy className="h-4 w-4" />
                            <span className="font-semibold">Điểm cao nhất:</span>
                          </div>
                          <span className="font-bold text-emerald-800">
                            {typeof attemptStatus.best_score === 'number'
                              ? attemptStatus.best_score.toFixed(1)
                              : parseFloat(attemptStatus.best_score || 0).toFixed(1)}
                            /{exam.total_score}
                          </span>
                        </div>
                        {attemptStatus.last_score && (
                          <div className="mt-2 flex items-center justify-between text-xs text-emerald-600">
                            <span>Điểm lần cuối:</span>
                            <span className="font-semibold">
                              {typeof attemptStatus.last_score === 'number'
                                ? attemptStatus.last_score.toFixed(1)
                                : parseFloat(attemptStatus.last_score || 0).toFixed(1)}
                              /{exam.total_score}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4 space-y-2 text-sm text-gray-600">
                      {exam.class && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{exam.class.className}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{exam.minutes} phút</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.total_score} điểm</span>
                      </div>
                      {exam.start_time && (
                        <div className="text-xs text-gray-500">
                          Bắt đầu: {formatDate(exam.start_time)}
                        </div>
                      )}
                      {exam.end_time && (
                        <div className="text-xs text-gray-500">
                          Kết thúc: {formatDate(exam.end_time)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartExam(exam.id)}
                      disabled={!canStart}
                      className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition ${
                        !canStart
                          ? "cursor-not-allowed bg-gray-400"
                          : attemptStatus?.status === "in_progress"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : attemptStatus?.status === "completed"
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } flex items-center justify-center gap-2`}
                    >
                      <Play className="h-4 w-4" />
                      {!canStart
                        ? examStatus === "ended"
                          ? "Đã kết thúc"
                          : "Chưa đến thời gian"
                        : attemptStatus?.status === "in_progress"
                        ? "Tiếp tục làm bài"
                        : attemptStatus?.status === "completed"
                        ? "Làm lại bài thi"
                        : "Bắt đầu làm bài"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

