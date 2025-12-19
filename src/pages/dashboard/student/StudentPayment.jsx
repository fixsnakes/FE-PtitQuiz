import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
    FiRefreshCw,
    FiEye,
    FiEyeOff,
    FiX,
    FiCopy,
    FiCheck,
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
    const [paymentMethod, setPaymentMethod] = useState("ACB");
    const [showQRModal, setShowQRModal] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [paymentOrders, setPaymentOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [copiedField, setCopiedField] = useState(null);
    const [qrImageUrl, setQrImageUrl] = useState("");

    // Mock data cho danh sách lệnh thanh toán
    useEffect(() => {
        const mockOrders = [
            {
                id: 1,
                createdAt: "2025-12-19T10:29:43",
                transactionCode: "PNJLZNJX",
                method: "ACB",
                amount: 50000,
                status: "pending", // pending, success, failed
                countdown: 300, // seconds
                isVisible: true,
            },
            {
                id: 2,
                createdAt: "2025-12-08T05:57:37",
                transactionCode: "9JQY28YH",
                method: "ACB",
                amount: 10000,
                status: "success",
                countdown: 0,
                isVisible: true,
            },
            {
                id: 3,
                createdAt: "2025-12-07T14:20:15",
                transactionCode: "K3M9P2XZ",
                method: "ACB",
                amount: 20000,
                status: "success",
                countdown: 0,
                isVisible: true,
            },
        ];
        setPaymentOrders(mockOrders);
    }, []);

    // Countdown timer cho các giao dịch pending
    useEffect(() => {
        const interval = setInterval(() => {
            setPaymentOrders((prev) =>
                prev.map((order) => {
                    if (order.status === "pending" && order.countdown > 0) {
                        return { ...order, countdown: order.countdown - 1 };
                    }
                    if (order.status === "pending" && order.countdown === 0) {
                        return { ...order, status: "failed" };
                    }
                    return order;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleAmountChange = (delta) => {
        setAmount((prev) => Math.max(10000, prev + delta));
    };

    const handleContinue = () => {
        if (amount < 10000) {
            toast.error("Số tiền tối thiểu là 10,000 đ");
            return;
        }

        const transactionCode = generateTransactionCode();
        const newOrder = {
            id: paymentOrders.length + 1,
            createdAt: new Date().toISOString(),
            transactionCode,
            method: paymentMethod,
            amount,
            status: "pending",
            countdown: 600, // 10 minutes
            isVisible: true,
        };

        setPaymentOrders((prev) => [newOrder, ...prev]);
        setCurrentTransaction(newOrder);

        // Generate QR code URL
        const qrUrl = `https://qr.sepay.vn/img?bank=${paymentMethod}&acc=22929031&template=compact&amount=${amount.toFixed(3)}&des=${transactionCode}`;
        setQrImageUrl(qrUrl);
        setShowQRModal(true);
    };

    const handleCopy = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success("Đã sao chép!");
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            toast.error("Không thể sao chép");
        }
    };

    const handleToggleVisibility = (orderId) => {
        setPaymentOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, isVisible: !order.isVisible } : order
            )
        );
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

    const filteredOrders = paymentOrders.filter((order) => {
        const matchesSearch =
            order.transactionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatDate(order.createdAt).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (order) => {
        if (order.status === "pending") {
            return (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                    <span className="text-sm font-semibold text-indigo-600">
                        {formatCountdown(order.countdown)}
                    </span>
                </div>
            );
        }
        if (order.status === "success") {
            return (
                <span className="text-sm font-semibold text-emerald-600">Thành Công</span>
            );
        }
        return (
            <span className="text-sm font-semibold text-red-600">Thất bại</span>
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
                            <h2 className="mb-4 text-xl font-semibold text-slate-900">Giao dịch</h2>
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

                                {/* Promo Code */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Mã khuyến mãi nạp
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Nhập mã khuyến mãi nạp (nếu có)"
                                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                        <button
                                            type="button"
                                            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                        >
                                            Áp Dụng
                                        </button>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <button
                                    onClick={handleContinue}
                                    className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700"
                                >
                                    Tiếp Tục
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
                                <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                                    <Search className="h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Tìm kiếm"
                                        className="flex-1 border-none bg-transparent text-sm outline-none focus:ring-0"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="all">Tình trạng</option>
                                    <option value="pending">Đang chờ</option>
                                    <option value="success">Thành công</option>
                                    <option value="failed">Thất bại</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    <FiRefreshCw />
                                    Làm Mới
                                </button>
                                <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                                    <option>10</option>
                                    <option>20</option>
                                    <option>50</option>
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
                                                MÃ GIAO DỊCH
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
                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-700">
                                                HÀNH ĐỘNG
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-4 py-8 text-center text-slate-500"
                                                >
                                                    Chưa có lệnh thanh toán nào
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((order, index) => (
                                                <tr
                                                    key={order.id}
                                                    className="transition-colors hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatDate(order.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => {
                                                                setCurrentTransaction(order);
                                                                const qrUrl = `https://qr.sepay.vn/img?bank=${order.method}&acc=22929031&template=compact&amount=${order.amount.toFixed(3)}&des=${order.transactionCode}`;
                                                                setQrImageUrl(qrUrl);
                                                                setShowQRModal(true);
                                                            }}
                                                            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                                                        >
                                                            {order.transactionCode}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                            <span className="font-medium text-slate-700">{order.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-slate-700">
                                                        {formatCurrency(order.amount)} đ
                                                    </td>
                                                    <td className="px-4 py-3">{getStatusBadge(order)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentTransaction(order);
                                                                    const qrUrl = `https://qr.sepay.vn/img?bank=${order.method}&acc=22929031&template=compact&amount=${order.amount.toFixed(3)}&des=${order.transactionCode}`;
                                                                    setQrImageUrl(qrUrl);
                                                                    setShowQRModal(true);
                                                                }}
                                                                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
                                                            >
                                                                <FiEye className="h-4 w-4" />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                                                NGUYEN QUANG TRONG
                                            </span>
                                            <button
                                                onClick={() => handleCopy("NGUYEN QUANG TRONG", "accountHolder")}
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
                                            <span className="font-semibold text-slate-900">2495666</span>
                                            <button
                                                onClick={() => handleCopy("2495666", "accountNumber")}
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
                                        <span className="font-semibold text-slate-900">ACB</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">
                                            Nội dung giao dịch{" "}
                                            <span className="text-red-500">*</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-indigo-600">
                                                {currentTransaction.transactionCode}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleCopy(
                                                        currentTransaction.transactionCode,
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
                                            {formatCurrency(currentTransaction.amount)}
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

