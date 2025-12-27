import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getWithdrawHistory, sendOTPForWithdraw, verifyOTPAndWithdraw } from "../../../services/walletservice";
import { getUserInformation } from "../../../services/userService";
import {
    FiRefreshCw,
    FiX,
    FiCopy,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiPackage,
} from "react-icons/fi";

export default function TeacherPayment() {
    const [bankName, setBankName] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [amount, setAmount] = useState(50000);
    const [walletBalance, setWalletBalance] = useState(0);
    const [withdrawOrders, setWithdrawOrders] = useState([]);
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
    const [loading, setLoading] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [otp, setOtp] = useState("");
    const [withdrawStep, setWithdrawStep] = useState(1); // 1: Nhập thông tin, 2: Xác thực OTP

    // Fetch wallet balance and withdraw history
    useEffect(() => {
        fetchWalletBalance();
        fetchWithdrawHistory();
    }, [currentPage, pageSize]);

    const fetchWalletBalance = async () => {
        try {
            const data = await getUserInformation();
            setWalletBalance(data.balance || 0);
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
            setWalletBalance(0);
        }
    };

    const fetchWithdrawHistory = async () => {
        setLoading(true);
        try {
            const response = await getWithdrawHistory(currentPage, pageSize);
            if (response?.data && response?.message) {
                setWithdrawOrders(response.data.withdraws || []);
                setPagination(response.data.pagination || {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                });
            } else {
                setWithdrawOrders([]);
            }
        } catch (error) {
            console.error("Error fetching withdraw history:", error);
            setWithdrawOrders([]);
            toast.error("Không thể tải lịch sử rút tiền");
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (delta) => {
        setAmount((prev) => Math.max(50000, prev + delta));
    };

    const handleSendOTP = async () => {
        // Validation
        if (!bankName.trim()) {
            toast.error("Vui lòng nhập tên ngân hàng");
            return;
        }
        if (!bankAccountName.trim()) {
            toast.error("Vui lòng nhập tên tài khoản ngân hàng");
            return;
        }
        if (!bankAccountNumber.trim()) {
            toast.error("Vui lòng nhập số tài khoản ngân hàng");
            return;
        }
        if (amount < 50000) {
            toast.error("Số tiền rút tối thiểu là 50,000 đ");
            return;
        }
        if (amount > walletBalance) {
            toast.error("Số tiền rút không được vượt quá số dư ví");
            return;
        }

        try {
            setSendingOTP(true);
            const payload = {
                bankName: bankName.trim(),
                bankAccountName: bankAccountName.trim(),
                bankAccountNumber: bankAccountNumber.trim(),
                amount: amount,
            };

            const response = await sendOTPForWithdraw(payload);

            if (response?.success && response?.message) {
                toast.success(response.message || "Mã OTP đã được gửi đến email của bạn");
                setWithdrawStep(2);
            } else {
                toast.error(response?.message || "Không thể gửi mã OTP");
            }
        } catch (error) {
            console.error("Error sending OTP for withdraw:", error);
            const errorMessage = error?.body?.message || error?.message || "Không thể gửi mã OTP";
            toast.error(errorMessage);
        } finally {
            setSendingOTP(false);
        }
    };

    const handleVerifyOTPAndWithdraw = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Vui lòng nhập mã OTP 6 chữ số");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                otp: otp,
            };

            const response = await verifyOTPAndWithdraw(payload);

            if (response?.success && response?.message) {
                toast.success(response.message || "Rút tiền thành công");

                // Reset form
                setBankName("");
                setBankAccountName("");
                setBankAccountNumber("");
                setAmount(50000);
                setOtp("");
                setWithdrawStep(1);

                // Refresh wallet balance and withdraw history
                await fetchWalletBalance();
                await fetchWithdrawHistory();
            } else {
                toast.error(response?.message || "Không thể thực hiện rút tiền");
            }
        } catch (error) {
            console.error("Error verifying OTP and withdrawing:", error);
            const errorMessage = error?.body?.message || error?.message || "Không thể thực hiện rút tiền";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setWithdrawStep(1);
        setOtp("");
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
        if (!dateString) return "N/A";
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

    const filteredOrders = (withdrawOrders || []).filter((withdraw) => {
        const matchesSearch = withdraw.withdraw_code?.toLowerCase().includes(searchTerm.toLowerCase()) || formatDate(withdraw.created_at).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || withdraw.withdraw_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (withdraw) => {
        // Log trạng thái để debug
        console.log('getStatusBadge:', {
            status: withdraw.status,
            withdraw_status: withdraw.withdraw_status
        });
        if (withdraw.status === "pending") {
            return (
                <span className="text-sm font-semibold text-amber-600">Đang chờ</span>
            );
        }
        if (withdraw.status === "success" || withdraw.withdraw_status === "approved" || withdraw.status === "approved") {
            return (
                <span className="text-sm font-semibold text-emerald-600">Thành công</span>
            );
        }
        if (withdraw.status === "failed" || withdraw.withdraw_status === "rejected" || withdraw.status === "rejected") {
            return (
                <span className="text-sm font-semibold text-red-600">Thất bại</span>
            );
        }
        return (
            <span className="text-sm font-semibold text-slate-600">Không xác định</span>
        );
    };

    return (
        <DashboardLayout role="teacher">
            <div className="space-y-6">

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Withdraw Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Withdraw Request Section */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-slate-900">Rút tiền</h2>
                            <p className="mb-6 text-sm text-slate-600">
                                Vui lòng điền đầy đủ thông tin tài khoản ngân hàng để rút tiền
                            </p>

                            <div className="space-y-6">
                                {/* Bank Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Tên ngân hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="Ví dụ: ACB, Vietcombank, BIDV..."
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                {/* Bank Account Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Tên tài khoản ngân hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={bankAccountName}
                                        onChange={(e) => setBankAccountName(e.target.value)}
                                        placeholder="Nhập tên chủ tài khoản"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                {/* Bank Account Number */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Số tài khoản ngân hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={bankAccountNumber}
                                        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                                        placeholder="Nhập số tài khoản"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Số tiền rút <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleAmountChange(-50000)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Math.max(50000, parseInt(e.target.value) || 50000))}
                                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-lg font-semibold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                            min="50000"
                                            step="50000"
                                            max={walletBalance}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAmountChange(50000)}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
                                        >
                                            +
                                        </button>
                                        <span className="text-lg font-semibold text-slate-700">đ</span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Số dư khả dụng: {formatCurrency(walletBalance)} đ
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSendOTP}
                                    disabled={sendingOTP}
                                    className="w-full rounded-lg bg-[#432DD7] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#3a26c0] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingOTP ? "Đang gửi OTP Xác minh..." : "Tạo yêu cầu rút tiền"}
                                </button>
                            </div>
                        </section>

                        {/* Withdraw History List */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold text-slate-900">
                                Lịch sử yêu cầu rút tiền
                            </h2>

                            {/* Filters */}
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await fetchWalletBalance();
                                        await fetchWithdrawHistory();
                                    }}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                                    Làm Mới
                                </button>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="pending">Đang chờ</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="success">Thành công</option>
                                    <option value="rejected">Từ chối</option>
                                    <option value="failed">Thất bại</option>
                                </select>
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
                                                MÃ ĐƠN
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                NGÂN HÀNG
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                TÊN TÀI KHOẢN
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                SỐ TÀI KHOẢN
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-700">
                                                SỐ TIỀN RÚT
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
                                                    Chưa có yêu cầu rút tiền nào
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((withdraw) => (
                                                <tr
                                                    key={withdraw.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatDate(withdraw.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleCopy(withdraw.withdraw_code, `withdraw-${withdraw.id}`)}
                                                            className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                                        >
                                                            {withdraw.withdraw_code}
                                                            {copiedField === `withdraw-${withdraw.id}` ? (
                                                                <FiCheck className="h-3 w-3 text-emerald-600" />
                                                            ) : (
                                                                <FiCopy className="h-3 w-3" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                                                            <span className="font-medium text-slate-700">{withdraw.bankName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {withdraw.bankAccountName}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {withdraw.bankAccountNumber}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-700">
                                                        {formatCurrency(parseFloat(withdraw.amount || 0))} đ
                                                    </td>
                                                    <td className="px-4 py-3">{getStatusBadge(withdraw)}</td>
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
                            <h2 className="mb-4 text-xl font-semibold text-amber-900">Lưu ý</h2>
                            <ul className="space-y-3 text-sm text-amber-800">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Vui lòng kiểm tra kỹ thông tin tài khoản ngân hàng trước khi gửi yêu cầu rút tiền.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Số tiền rút tối thiểu là 50,000 đ và không được vượt quá số dư ví hiện tại.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Yêu cầu rút tiền sẽ được xử lý trong vòng 1-3 ngày làm việc.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1">•</span>
                                    <span>
                                        Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ để được giải đáp.
                                    </span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* OTP Verification Modal */}
                {withdrawStep === 2 && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-fade-in-up">
                            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800">Xác thực OTP</h3>
                                <button
                                    type="button"
                                    onClick={handleBackToStep1}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                                >
                                    <FiX className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <p className="text-sm text-gray-600">
                                    Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã OTP để xác thực và hoàn tất rút tiền.
                                </p>

                                {/* Thông tin rút tiền (read-only) */}
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Thông tin rút tiền:</p>
                                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                                        <div>
                                            <span className="font-medium">Ngân hàng:</span> {bankName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Tên tài khoản:</span> {bankAccountName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Số tài khoản:</span> {bankAccountNumber}
                                        </div>
                                        <div>
                                            <span className="font-medium">Số tiền:</span> {formatCurrency(amount)} đ
                                        </div>
                                    </div>
                                </div>

                                {/* OTP Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nhập mã OTP
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="Nhập mã OTP 6 chữ số"
                                            maxLength={6}
                                            autoFocus
                                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-small"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Vui lòng kiểm tra email và nhập mã OTP 6 chữ số
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleBackToStep1}
                                    className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleVerifyOTPAndWithdraw}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-[#432DD7] text-white font-bold rounded-xl hover:bg-[#3a26c0] focus:ring-4 focus:ring-indigo-300 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang xử lý..." : "Xác thực và rút tiền"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

