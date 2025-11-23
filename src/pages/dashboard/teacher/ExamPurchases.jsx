import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  getTeacherExamPurchases,
  getTeacherExamRevenue,
} from "../../../services/teacherService";
import { listExams } from "../../../services/examService";
import formatDateTime from "../../../utils/format_time";

export default function TeacherExamPurchases() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadExams();
    loadRevenue();
  }, [selectedExamId, dateFrom, dateTo]);

  useEffect(() => {
    loadPurchases();
  }, [selectedExamId, page]);

  const loadExams = async () => {
    try {
      const response = await listExams();
      const examsList = Array.isArray(response) ? response : [];
      // Chỉ lấy các đề thi trả phí
      const paidExams = examsList.filter((exam) => exam.is_paid);
      setExams(paidExams);
    } catch (error) {
      console.error("Error loading exams:", error);
    }
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await getTeacherExamPurchases({
        exam_id: selectedExamId || undefined,
        page,
        limit: 20,
      });
      const data = response?.data || response;
      setPurchases(data.purchases || []);
      setPagination(data.pagination || null);
    } catch (error) {
      toast.error(
        error?.body?.message ||
          error?.message ||
          "Không thể tải danh sách mua đề thi."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRevenue = async () => {
    try {
      const response = await getTeacherExamRevenue({
        exam_id: selectedExamId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      const data = response?.data || response;
      setRevenue(data);
    } catch (error) {
      console.error("Error loading revenue:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (loading && !purchases.length) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-3xl text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
              Quay lại
            </button>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Thống kê mua đề thi
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Doanh thu từ đề thi trả phí
            </h1>
          </div>
        </header>

        {/* Revenue Statistics */}
        {revenue && (
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-500">
                    Tổng doanh thu
                  </h2>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {formatCurrency(revenue.totalRevenue || 0)}
                  </p>
                </div>
                <FiDollarSign className="text-3xl text-emerald-500 opacity-50" />
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-500">
                    Tổng số lượt mua
                  </h2>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {revenue.totalPurchases || 0}
                  </p>
                </div>
                <FiTrendingUp className="text-3xl text-blue-500 opacity-50" />
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-500">
                    Số đề thi trả phí
                  </h2>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {exams.length}
                  </p>
                </div>
                <FiFileText className="text-3xl text-indigo-500 opacity-50" />
              </div>
            </article>
          </section>
        )}

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Bộ lọc</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Chọn đề thi
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả đề thi</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedExamId("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
            <button
              type="button"
              onClick={() => {
                loadPurchases();
                loadRevenue();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiRefreshCw />
              Làm mới
            </button>
          </div>
        </section>

        {/* Revenue by Exam */}
        {revenue?.revenueByExam && revenue.revenueByExam.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Doanh thu theo đề thi
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Đề thi</th>
                    <th className="px-4 py-3 text-center">Số lượt mua</th>
                    <th className="px-4 py-3 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {revenue.revenueByExam.map((item) => (
                    <tr key={item.exam_id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {item.exam_title}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.purchase_count}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Purchases List */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách mua đề thi
            </h2>
            {pagination && (
              <p className="text-sm text-slate-500">
                Trang {pagination.page} / {pagination.totalPages} (
                {pagination.total} lượt mua)
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <FiLoader className="animate-spin text-2xl text-indigo-600" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
              Chưa có lượt mua nào.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">STT</th>
                      <th className="px-4 py-3 text-left">Học sinh</th>
                      <th className="px-4 py-3 text-left">Đề thi</th>
                      <th className="px-4 py-3 text-right">Giá</th>
                      <th className="px-4 py-3 text-center">Ngày mua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {purchases.map((purchase, index) => (
                      <tr key={purchase.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-500">
                          {(page - 1) * 20 + index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <FiUsers className="text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900">
                                {purchase.user?.fullName || "Không tên"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {purchase.user?.email || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-900">
                          {purchase.exam?.title || "Không tên"}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                          {formatCurrency(purchase.purchase_price)}
                        </td>
                        <td className="px-4 py-4 text-center text-xs text-slate-600">
                          {purchase.purchase_date
                            ? formatDateTime(purchase.purchase_date)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-4 text-sm text-slate-600">
                    Trang {page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

