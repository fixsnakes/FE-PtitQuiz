import React, { useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiFileText, FiUsers, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getTeacherDashboardStats } from "../../../services/teacherService";
import { toast } from "react-toastify";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffectOnce(() => {
    loadDashboardStats();
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

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-3xl text-indigo-600" />
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
          <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng kỳ thi</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.totalExams || 0}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  {summary.examsByStatus?.ongoing || 0} đang diễn ra
                </p>
              </div>
              <div className="rounded-lg bg-indigo-100 p-3">
                <FiFileText className="text-2xl text-indigo-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>

          <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lớp học</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.totalClasses || 0}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  {summary.totalStudents || 0} học sinh
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3">
                <FiUsers className="text-2xl text-emerald-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>

          <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yêu cầu chấm bài</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.pendingFeedback || 0}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  Cần phản hồi
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3">
                <FiCheckCircle className="text-2xl text-amber-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>

          <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đang thi</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.activeSessions || 0}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  Phiên thi đang hoạt động
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3">
                <FiClock className="text-2xl text-blue-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </article>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Kỳ thi gần đây</h2>
              <button
                onClick={() => navigate("/dashboard/teacher/exams")}
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
            {recent.exams && recent.exams.length > 0 ? (
              <div className="space-y-2">
                {recent.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="group cursor-pointer rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50"
                    onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}/edit`)}
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{exam.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {new Date(exam.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FiFileText className="mx-auto mb-2 text-2xl text-slate-300" />
                <p className="text-sm text-slate-500">
                  Chưa có kỳ thi nào
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Lớp học gần đây</h2>
              <button
                onClick={() => navigate("/teacher/classes")}
                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
            {recent.classes && recent.classes.length > 0 ? (
              <div className="space-y-2">
                {recent.classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="group cursor-pointer rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50"
                    onClick={() =>
                      navigate(
                        `/teacher/classes/${encodeURIComponent(
                          cls.classCode || cls.id
                        )}`
                      )
                    }
                  >
                    <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">{cls.className}</h3>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Mã: <span className="font-mono font-medium">{cls.classCode}</span> • {new Date(cls.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FiUsers className="mx-auto mb-2 text-2xl text-slate-300" />
                <p className="text-sm text-slate-500">
                  Chưa có lớp học nào
                </p>
              </div>
            )}
          </div>
        </section>

        
      </div>
    </DashboardLayout>
  );
}
