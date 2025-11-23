import React, { useEffect, useState } from "react";
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

  useEffect(() => {
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
        <section className="rounded-2xl border border-dashed border-indigo-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Chào mừng trở lại, cô/thầy!
          </h1>
          <p className="mt-2 text-slate-600">
            Đây là khu vực quản trị dành cho giáo viên. Quản lý kỳ thi, câu hỏi và lớp học của bạn.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Tổng kỳ thi</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summary.totalExams || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {summary.examsByStatus?.ongoing || 0} đang diễn ra
                </p>
              </div>
              <FiFileText className="text-3xl text-indigo-500 opacity-50" />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Lớp học</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summary.totalClasses || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {summary.totalStudents || 0} học sinh
                </p>
              </div>
              <FiUsers className="text-3xl text-emerald-500 opacity-50" />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Yêu cầu chấm bài</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summary.pendingFeedback || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Cần phản hồi
                </p>
              </div>
              <FiCheckCircle className="text-3xl text-amber-500 opacity-50" />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Đang thi</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {summary.activeSessions || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Phiên thi đang hoạt động
                </p>
              </div>
              <FiClock className="text-3xl text-blue-500 opacity-50" />
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Kỳ thi gần đây</h2>
              <button
                onClick={() => navigate("/dashboard/teacher/exams")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Xem tất cả →
              </button>
            </div>
            {recent.exams && recent.exams.length > 0 ? (
              <div className="space-y-3">
                {recent.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="cursor-pointer rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"
                    onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}/edit`)}
                  >
                    <h3 className="font-semibold text-slate-900">{exam.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(exam.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-500">
                Chưa có kỳ thi nào
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Lớp học gần đây</h2>
              <button
                onClick={() => navigate("/teacher/classes")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Xem tất cả →
              </button>
            </div>
            {recent.classes && recent.classes.length > 0 ? (
              <div className="space-y-3">
                {recent.classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="cursor-pointer rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"
                    onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                  >
                    <h3 className="font-semibold text-slate-900">{cls.className}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Mã: {cls.classCode} • {new Date(cls.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-500">
                Chưa có lớp học nào
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Gợi ý thao tác nhanh
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard/teacher/exams/create")}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
            >
              + Tạo kỳ thi mới
            </button>
            <button
              onClick={() => navigate("/teacher/classes/create")}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
            >
              + Tạo lớp học mới
            </button>
            <button
              onClick={() => navigate("/teacher/classes")}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
            >
              Xem tất cả lớp học
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
