import React, { useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiFileText, FiUsers, FiCheckCircle, FiClock, FiCalendar, FiDollarSign } from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getTeacherDashboardStats } from "../../../services/teacherService";
import { getUserInformation } from "../../../services/userService";
import formatCurrency from "../../../utils/format_currentcy";
import { toast } from "react-toastify";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffectOnce(() => {
    loadDashboardStats();
    loadBalance();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getTeacherDashboardStats();
      const data = response?.data || response;
      setStats(data);
    } catch (err) {
      const message =
        err?.body?.message ||
        err?.message ||
        "Không thể tải dữ liệu dashboard. Vui lòng thử lại.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await getUserInformation();
      setBalance(parseFloat(response.balance || 0));
    } catch (err) {
      console.error("Error loading balance:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <FiLoader className="absolute inset-0 m-auto animate-pulse text-2xl text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !stats) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-10 text-red-600">
          <p className="mb-4 font-semibold">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Thử lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const summary = stats?.summary || {};
  const recent = stats?.recent || {};

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <article 
            onClick={() => navigate("/dashboard/teacher/exams")}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng bài thi</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                  {summary.totalExams || 0}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  {summary.examsByStatus?.ongoing || 0} đang diễn ra
                </p>
              </div>
              <div className="rounded-lg bg-indigo-100 p-3 transition-transform group-hover:scale-110">
                <FiFileText className="text-2xl text-indigo-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>

          <article 
            onClick={() => navigate("/teacher/classes")}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lớp học</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                  {summary.totalClasses || 0}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiUsers className="h-3 w-3" />
                  {summary.totalStudents || 0} học sinh
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 transition-transform group-hover:scale-110">
                <FiUsers className="text-2xl text-emerald-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>

          <article 
            onClick={() => navigate("/dashboard/teacher/exams")}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yêu cầu chấm bài</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                  {summary.pendingFeedback || 0}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <span className={`inline-block h-2 w-2 rounded-full ${(summary.pendingFeedback || 0) > 0 ? 'animate-pulse bg-amber-500' : 'bg-slate-300'}`}></span>
                  Cần phản hồi
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3 transition-transform group-hover:scale-110">
                <FiCheckCircle className="text-2xl text-amber-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>

          <article 
            onClick={() => navigate("/dashboard/wallet")}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ví của tôi</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                  {loadingBalance ? (
                    <span className="inline-block h-8 w-24 animate-pulse rounded bg-slate-200"></span>
                  ) : (
                    formatCurrency(balance || 0)
                  )}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  Số dư hiện tại
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 transition-transform group-hover:scale-110">
                <FiDollarSign className="text-2xl text-emerald-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Bài thi gần đây</h2>
              <button
                onClick={() => navigate("/dashboard/teacher/exams")}
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 hover:gap-2"
              >
                Xem tất cả
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
            {recent.exams && recent.exams.length > 0 ? (
              <div className="space-y-3">
                {recent.exams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className="group cursor-pointer rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
                    onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}/edit`)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FiFileText className="h-4 w-4 text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                          <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">{exam.title}</h3>
                        </div>
                        <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                          <FiCalendar className="h-3 w-3" />
                          {new Date(exam.created_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <FiFileText className="text-2xl text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Chưa có bài thi nào
                </p>
                <button
                  onClick={() => navigate("/dashboard/teacher/exams/create")}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Tạo bài thi đầu tiên →
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Lớp học gần đây</h2>
              <button
                onClick={() => navigate("/teacher/classes")}
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 hover:gap-2"
              >
                Xem tất cả
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
            {recent.classes && recent.classes.length > 0 ? (
              <div className="space-y-3">
                {recent.classes.map((cls, index) => (
                  <div
                    key={cls.id}
                    className="group cursor-pointer rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
                    onClick={() =>
                      navigate(
                        `/teacher/classes/${encodeURIComponent(
                          cls.classCode || cls.id
                        )}`
                      )
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FiUsers className="h-4 w-4 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                          <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">{cls.className}</h3>
                        </div>
                        <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-medium text-slate-600">{cls.classCode}</span>
                          <span>•</span>
                          {new Date(cls.created_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <FiUsers className="text-2xl text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Chưa có lớp học nào
                </p>
                <button
                  onClick={() => navigate("/teacher/classes/create")}
                  className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Tạo lớp học đầu tiên →
                </button>
              </div>
            )}
          </div>
        </section>

        
      </div>
    </DashboardLayout>
  );
}
