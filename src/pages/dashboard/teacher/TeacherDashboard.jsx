import React from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        {/* <section className="rounded-2xl border border-dashed border-indigo-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Chào mừng trở lại, cô/thầy!
          </h1>
          <p className="mt-2 text-slate-600">
            Đây là khu vực quản trị dành cho giáo viên. Các tính năng quản lý kỳ
            thi, câu hỏi và lớp học sẽ xuất hiện tại đây trong các phiên bản
            tiếp theo.
          </p>
        </section> */}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500">Kỳ thi</h2>
            <p className="text-3xl font-bold text-slate-900">12</p>
            <p className="text-sm text-slate-500">
              Đang mở cho học sinh tham gia.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500">
              Yêu cầu chấm bài
            </h2>
            <p className="text-3xl font-bold text-slate-900">5</p>
            <p className="text-sm text-slate-500">
              Bài tự luận cần chấm thủ công.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500">Lớp học</h2>
            <p className="text-3xl font-bold text-slate-900">3</p>
            <p className="text-sm text-slate-500">
              Lớp học bạn đang phụ trách.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Gợi ý thao tác nhanh
          </h2>
         
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50">
              + Tạo kỳ thi mới
            </button>
            <button className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50">
              + Thêm câu hỏi
            </button>
            <button className="rounded-lg border border-indigo-200 px-4 py-2 text-indigo-600 transition hover:bg-indigo-50">
              Xem báo cáo lớp
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
