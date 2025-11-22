import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSearch, FiX, FiDollarSign, FiRotateCcw } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import formatDateTime from "../../../utils/format_time";

export default function PurchaseManagement() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState(null);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [refundForm, setRefundForm] = useState({
    amount: 0,
    reason: "",
  });

  useEffect(() => {
    loadPurchases();
  }, [pagination.page]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await adminService.getAllPurchases(params);
      if (response.success) {
        setPurchases(response.data.purchases);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
      toast.error("Không thể tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (purchase) => {
    setSelectedPurchase(purchase);
    setRefundForm({
      amount: parseFloat(purchase.purchase_price) || 0,
      reason: "",
    });
    setShowRefundModal(true);
  };

  const handleRefund = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.refundPurchase(
        selectedPurchase.id,
        refundForm
      );
      if (response.success) {
        toast.success("Hoàn tiền thành công");
        setShowRefundModal(false);
        loadPurchases();
      }
    } catch (error) {
      console.error("Error refunding purchase:", error);
      toast.error(error.body?.message || "Không thể hoàn tiền");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Quản lý giao dịch
        </h1>
        <p className="text-slate-600 mt-1">
          Xem và quản lý tất cả giao dịch mua đề thi
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600">Tổng giao dịch</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              {summary.totalPurchases}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-medium text-slate-600">
              Giá trị trung bình
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {formatCurrency(summary.avgPurchaseValue)}
            </p>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Không có giao dịch nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Người mua
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Đề thi
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Giáo viên
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                      Giá
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Ngày mua
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600">
                        #{purchase.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-800">
                          {purchase.user?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {purchase.user?.email}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-800">
                          {purchase.exam?.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">
                          {purchase.exam?.creator?.fullName}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(purchase.purchase_price)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDateTime(purchase.purchase_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openRefundModal(purchase)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Hoàn tiền"
                          >
                            <FiRotateCcw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} giao dịch
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Hoàn tiền</h2>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Giao dịch:</p>
              <p className="font-semibold text-slate-800">
                {selectedPurchase.user?.fullName} mua{" "}
                {selectedPurchase.exam?.title}
              </p>
              <p className="text-sm text-slate-600 mt-2">Giá mua:</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(selectedPurchase.purchase_price)}
              </p>
            </div>

            <form onSubmit={handleRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số tiền hoàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={refundForm.amount}
                  onChange={(e) =>
                    setRefundForm({
                      ...refundForm,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lý do hoàn tiền <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={refundForm.reason}
                  onChange={(e) =>
                    setRefundForm({ ...refundForm, reason: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập lý do hoàn tiền..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xác nhận hoàn tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

