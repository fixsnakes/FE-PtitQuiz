import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiFileText, FiUsers, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { toast } from "react-toastify";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    upcomingExams: 0,
    completedToday: 0,
    averageScore: 0,
    totalClasses: 0,
  });

  useEffect(() => {
    // Load stats if API available
    // For now, using placeholder data
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-3xl text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <section className="rounded-2xl border border-dashed border-indigo-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Chào mừng trở lại!
          </h1>
          <p className="mt-2 text-slate-600">
            Đây là khu vực dành cho học sinh theo dõi tiến độ học tập và làm bài thi.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Kỳ thi sắp diễn ra</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stats.upcomingExams || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Chưa tới hạn
                </p>
              </div>
              <FiFileText className="text-3xl text-indigo-500 opacity-50" />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Luyện tập hôm nay</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stats.completedToday || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Câu hỏi đã hoàn thành
                </p>
              </div>
              <FiCheckCircle className="text-3xl text-emerald-500 opacity-50" />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Điểm trung bình</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : "0.0"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Trong 5 bài gần nhất
                </p>
              </div>
              <FiTrendingUp className="text-3xl text-amber-500 opacity-50" />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-500">Lớp học</h2>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {stats.totalClasses || 0}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Lớp đã tham gia
                </p>
              </div>
              <FiUsers className="text-3xl text-blue-500 opacity-50" />
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Bài thi gần đây</h2>
              <button
                onClick={() => navigate("/dashboard/student/exams")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Xem tất cả →
              </button>
            </div>
            <p className="py-4 text-center text-sm text-slate-500">
              Chưa có bài thi nào
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Lớp học gần đây</h2>
              <button
                onClick={() => navigate("/dashboard/student/classes")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Xem tất cả →
              </button>
            </div>
            <p className="py-4 text-center text-sm text-slate-500">
              Chưa có lớp học nào
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Gợi ý thao tác nhanh
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard/student/exams")}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
            >
              Xem danh sách bài thi
            </button>
            <button
              onClick={() => navigate("/dashboard/student/classes")}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
            >
              Xem lớp học của tôi
            </button>
            <button
              onClick={() => navigate("/dashboard/student/results")}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50"
            >
              Xem kết quả thi
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
