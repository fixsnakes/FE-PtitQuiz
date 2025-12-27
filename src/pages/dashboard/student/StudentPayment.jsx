import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getDepositHistory } from "../../../services/walletservice";
import { createDepositRequest } from "../../../services/walletservice";
import {
    FiRefreshCw,
    FiEye,
    FiEyeOff,
    FiX,
    FiCopy,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import { Search } from "lucide-react";

// Hàm tạo mã giao dịch random
const generateTransactionCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export default function StudentPayment() {
    const [amount, setAmount] = useState(50000);
    const [promoCode, setPromoCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản ngân hàng ACB");
    const [showQRModal, setShowQRModal] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [paymentOrders, setPaymentOrders] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [copiedField, setCopiedField] = useState(null);
    const [qrImageUrl, setQrImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    // fetch history data
    useEffect(() => {
        const fetchDepositHistory = async () => {
            setLoading(true);
            try {
                const response = await getDepositHistory(currentPage, pageSize);
                if (response?.data && response?.message) {
                    setPaymentOrders(response.data.deposits || []);
                    setPagination(response.data.pagination || {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    });
                } else {
                    setPaymentOrders([]);
                }
            } catch (error) {
                console.error("Error fetching deposit history:", error);
                setPaymentOrders([]);
                toast.error("Không thể tải lịch sử giao dịch");
            } finally {
                setLoading(false);
            }
        }
        fetchDepositHistory();
    }, [currentPage, pageSize]);




    const handleAmountChange = (delta) => {
        setAmount((prev) => Math.max(10000, prev + delta));
    };

    const handleContinue = async () => {
        if (amount < 10000) {
            toast.error("Số tiền tối thiểu là 10,000 đ");
            return;
        }

        try {
            setLoading(true);
            // Parse payment method to get bank name (assuming format like "ACB" or "Vietcombank")
            const bankName = paymentMethod === "Chuyển khoản ngân hàng";

            const payload = {
                bankName: "ACB",
                bankAccountName: "DAO TUNG LAM",
                bankAccountNumber: "22929031",
                amount: amount,
            };

            const response = await createDepositRequest(payload);

            if (response?.message && response?.data) {
                const depositData = response.data;
                console.log(depositData);
                // Set current transaction for modal
                setCurrentTransaction({
                    deposit_code: depositData.deposit_code,
                    bankName: depositData.bankName,
                    bankAccountName: depositData.bankAccountName,
                    bankAccountNumber: depositData.bankAccountNumber,
                    deposit_amount: depositData.amount.toString(),
                    deposit_status: depositData.deposit_status || "pending",
                });

                setQrImageUrl(`data:image/png;base64,${depositData.qr_base64}`);
                setShowQRModal(true);
                toast.success("Tạo yêu cầu nạp tiền thành công");

                // Refresh deposit history
                const historyResponse = await getDepositHistory(1, pageSize);
                if (historyResponse?.data) {
                    setPaymentOrders(historyResponse.data.deposits || []);
                    setPagination(historyResponse.data.pagination || {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    });
                    setCurrentPage(1);
                }
            } else {
                toast.error(response?.message || "Không thể tạo yêu cầu nạp tiền");
            }
        } catch (error) {
            console.error("Error creating deposit request:", error);
            toast.error(error?.response?.data?.message || "Không thể tạo yêu cầu nạp tiền");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (text, field) => {
        if (!text) {
            toast.error("Không có nội dung để sao chép");
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success("Đã sao chép!");
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            toast.error("Không thể sao chép");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value);
    };

    const filteredOrders = (paymentOrders || []).filter((deposit) => {
        const matchesSearch =
            deposit.deposit_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatDate(deposit.created_at).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || deposit.deposit_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (deposit) => {
        if (deposit.deposit_status === "pending") {
            return (
                <span className="text-sm font-semibold text-amber-600">Đang chờ</span>
            );
        }
        if (deposit.deposit_status === "success") {
            return (
                <span className="text-sm font-semibold text-emerald-600">Thành Công</span>
            );
        }
        if (deposit.deposit_status === "failed") {
            return (
                <span className="text-sm font-semibold text-red-600">Thất bại</span>
            );
        }
        return (
            <span className="text-sm font-semibold text-slate-600">Không xác định</span>
        );
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Transaction Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Transaction Section */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-slate-900">Nạp tiền</h2>
                            <p className="mb-6 text-sm text-slate-600">
                                Quý khách vui lòng lựa chọn phương thức giao dịch và số tiền giao dịch
                            </p>

                            <div className="space-y-6">
                                {/* Payment Method */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Phương thức giao dịch
                                    </label>
                                    <button
                                        type="button"
                                        className="w-full rounded-lg border-2 border-indigo-600 bg-indigo-50 px-4 py-3 text-left font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                    >
                                        {paymentMethod}
                                    </button>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Số tiền giao dịch <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleAmountChange(-10000)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Math.max(10000, parseInt(e.target.value) || 10000))}
                                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-lg font-semibold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                            min="10000"
                                            step="10000"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAmountChange(10000)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
                                        >
                                            +
                                        </button>
                                        <span className="text-lg font-semibold text-slate-700">đ</span>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <button
                                    onClick={handleContinue}
                                    disabled={loading}
                                    className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang xử lý..." : "Tạo yêu cầu nạp tiền"}
                                </button>
                            </div>
                        </section>

                        {/* Payment Orders List */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-slate-900">
                                Danh sách lệnh thanh toán
                            </h2>

                            {/* Filters */}
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const response = await getDepositHistory(currentPage, pageSize);
                                            if (response?.data) {
                                                setPaymentOrders(response.data.deposits || []);
                                                setPagination(response.data.pagination || {
                                                    total: 0,
                                                    page: 1,
                                                    limit: 10,
                                                    totalPages: 1,
                                                });
                                            }
                                        } catch (error) {
                                            console.error("Error refreshing deposit history:", error);
                                            toast.error("Không thể làm mới dữ liệu");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                                    Làm Mới
                                </button>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b-2 border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                NGÀY TẠO
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                Nội Dung
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                PHƯƠNG THỨC
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                SỐ TIỀN NẠP
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                TRẠNG THÁI
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-8 text-center text-slate-500"
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                                                        <span>Đang tải dữ liệu...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredOrders.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-8 text-center text-slate-500"
                                                >
                                                    Chưa có lệnh thanh toán nào
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((deposit, index) => (
                                                <tr
                                                    key={deposit.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatDate(deposit.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => {
                                                                setCurrentTransaction(deposit);
                                                            }}
                                                            className="font-semibold text-indigo-600 hover:text-indigo-700"
                                                        >
                                                            {deposit.deposit_code}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                            <span className="font-medium text-slate-700">{deposit.bankName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-700">
                                                        {formatCurrency(parseFloat(deposit.deposit_amount || 0))} đ
                                                    </td>
                                                    <td className="px-4 py-3">{getStatusBadge(deposit)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                                    <p>
                                        Đang hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{" "}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} của{" "}
                                        {pagination.total} bản ghi
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <FiChevronLeft className="h-4 w-4" />
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${currentPage === pageNum
                                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                                            disabled={currentPage === pagination.totalPages}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <FiChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Tips */}
                    <div className="lg:col-span-1">
                        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-amber-900">Mẹo</h2>
                            <ul className="space-y-3 text-sm text-amber-800">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Quý khách vui lòng chuyển khoản đúng số tiền, nội dung theo hướng dẫn để hoàn tất nạp tài khoản tự động.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Tài khoản nhận có thể sẽ chỉ hoạt động một khoảng thời gian nhất định. Ngoài khoảng thời gian đó, giao dịch có thể sẽ không được ghi nhận.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Trường hợp quá 10 phút sau khi giao dịch thành công mà tài khoản quý khách vẫn chưa được cộng tài khoản, quý khách vui lòng liên hệ CSKH để được hỗ trợ.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Mỗi lần thanh toán, hệ thống sẽ tạo ra các lệnh thanh toán ở bảng dưới đây, quý khách có thể kiểm tra lại và hoàn tất thanh toán nếu không may thoát khỏi màn hình thanh toán.
                                    </span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQRModal && currentTransaction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <FiX className="h-5 w-5" />
                            </button>

                            {/* Header */}
                            <h2 className="mb-2 text-2xl font-bold text-slate-900">
                                Mã nạp tài khoản
                            </h2>
                            <p className="mb-6 text-sm text-slate-600">
                                Hệ thống sẽ tự động thông báo và cộng số dư tài khoản cho quý khách. Quý khách có thể đóng popup ngay sau khi giao dịch thành công.
                            </p>

                            {/* QR Code */}
                            <div className="mb-6 flex flex-col items-center">
                                {qrImageUrl && (
                                    <img
                                        src={qrImageUrl}
                                        alt="QR Code"
                                        className="mb-4 h-64 w-64 rounded-lg border-2 border-slate-200"
                                    />
                                )}
                            </div>

                            {/* Account Details */}
                            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">
                                            Chủ tài khoản
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">
                                                {currentTransaction.bankAccountName || "N/A"}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(currentTransaction.bankAccountName || "", "accountHolder")}
                                                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white"
                                            >
                                                {copiedField === "accountHolder" ? (
                                                    <FiCheck className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <FiCopy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">
                                            Số tài khoản
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{currentTransaction.bankAccountNumber || "N/A"}</span>
                                            <button
                                                onClick={() => handleCopy(currentTransaction.bankAccountNumber || "", "accountNumber")}
                                                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white"
                                            >
                                                {copiedField === "accountNumber" ? (
                                                    <FiCheck className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <FiCopy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">
                                            Ngân hàng
                                        </span>
                                        <span className="font-semibold text-slate-900">{currentTransaction.bankName || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">
                                            Nội dung giao dịch{" "}
                                            <span className="text-red-500">*</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-indigo-600">
                                                {currentTransaction.deposit_code}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleCopy(
                                                        currentTransaction.deposit_code || "",
                                                        "transactionContent"
                                                    )
                                                }
                                                className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white"
                                            >
                                                {copiedField === "transactionContent" ? (
                                                    <FiCheck className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <FiCopy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">
                                            Số tiền nạp
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {formatCurrency(parseFloat(currentTransaction.deposit_amount || 0))} đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

