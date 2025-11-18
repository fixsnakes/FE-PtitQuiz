import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <section className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white shadow-lg">
          <p className="text-sm uppercase tracking-widest text-white/80">
            Học sinh
          </p>
          <h1 className="text-3xl font-bold">Chào mừng bạn quay lại!</h1>
          <p className="text-sm text-white/80">
            Đây là khu vực dành cho học sinh theo dõi tiến độ học tập. Nội dung
            hiện chỉ mang tính minh hoạ mô tả giao diện.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500">
              Kỳ thi sắp diễn ra
            </h2>
            <p className="text-3xl font-bold text-slate-900">2</p>
            <p className="text-sm text-slate-500">Chưa tới hạn.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500">
              Luyện tập hôm nay
            </h2>
            <p className="text-3xl font-bold text-slate-900">45</p>
            <p className="text-sm text-slate-500">
              Câu hỏi bạn đã hoàn thành.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500">
              Điểm trung bình
            </h2>
            <p className="text-3xl font-bold text-slate-900">8.4</p>
            <p className="text-sm text-slate-500">Trong 5 bài gần nhất.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Hành động nhanh
          </h2>
          <p className="text-slate-600">
            Các nút dưới đây mô tả tính năng đang phát triển.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-blue-700 transition hover:border-blue-400">
              Tiếp tục luyện đề
              <span className="block text-sm text-blue-500">
                Còn 20 câu hỏi chưa làm
              </span>
            </button>
            <button className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-left text-blue-600 transition hover:border-blue-400">
              Xem lịch thi
              <span className="block text-sm text-blue-400">
                3 lịch thi sắp tới
              </span>
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
