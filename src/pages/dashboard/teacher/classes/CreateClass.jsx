import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCopy,
  FiLoader,
  FiPlusCircle,
} from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { createClass } from "../../../services/classService";

export default function CreateClass() {
  const navigate = useNavigate();
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdClass, setCreatedClass] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!className.trim()) {
      setError("Tên lớp là bắt buộc.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = await createClass({ className: className.trim() });
      setCreatedClass(payload);
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Không thể tạo lớp. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdClass?.classCode) return;
    try {
      await navigator.clipboard.writeText(createdClass.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Không thể copy mã lớp. Vui lòng thử lại.");
    }
  };

  const resetForm = () => {
    setClassName("");
    setCreatedClass(null);
    setCopied(false);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <FiArrowLeft />
            Quay lại
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-600">
              Tạo lớp học mới
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Khởi tạo lớp cho học sinh của bạn
            </h1>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Thông tin lớp học
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Điền tên lớp để hệ thống tạo mã lớp tự động.
            </p>

            <div className="mt-6 space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Tên lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="Ví dụ: Lớp Toán 10A"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FiPlusCircle />
                    Tạo lớp
                  </>
                )}
              </button>
              {createdClass && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Tạo lớp khác
                </button>
              )}
            </div>
          </form>

          <aside className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-indigo-900">
              Hướng dẫn nhanh
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-indigo-900/80">
              <li>Sau khi tạo, bạn sẽ nhận được mã lớp duy nhất.</li>
              <li>Gửi mã lớp cho học sinh để họ tham gia.</li>
              <li>
                Có thể quản lý học sinh, bài đăng và đề thi ở trang chi tiết
                lớp.
              </li>
            </ul>
            <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm text-indigo-800 shadow-inner">
              API sử dụng: <code className="font-semibold">POST /api/classes</code>
            </p>
          </aside>
        </section>

        {createdClass && (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="text-3xl text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-green-800">
                  Tạo lớp thành công!
                </h2>
                <p className="text-sm text-green-700">
                  Chia sẻ mã lớp với học sinh hoặc chuyển đến trang chi tiết để
                  quản lý.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4 text-center shadow-inner">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Tên lớp
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {createdClass.className}
                </p>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 text-center shadow-inner">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Mã lớp
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {createdClass.classCode}
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  <FiCopy />
                  {copied ? "Đã copy" : "Copy"}
                </button>
              </div>

              <div className="rounded-2xl bg-white/80 p-4 text-center shadow-inner">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Mã lớp ID
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {createdClass.id}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/teacher/classes/${createdClass.id}`}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500"
              >
                Đi đến trang chi tiết lớp
              </Link>
              <Link
                to="/teacher/classes"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
              >
                Trở về danh sách
              </Link>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}


