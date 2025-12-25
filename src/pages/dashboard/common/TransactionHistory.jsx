import React, { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getTransactionHistory } from "../../../services/transactionService";

// Helper function to generate transaction content
const generateTransactionContent = (transaction) => {
    const { transactionType, referenceId } = transaction;

    if (transactionType === "deposit") {
        return `Nạp tiền - Mã giao dịch: ${referenceId || "N/A"}`;
    } else if (transactionType === "withdraw") {
        return `Rút tiền - Mã giao dịch: ${referenceId || "N/A"}`;
    } else if (transactionType === "purchase") {
        return `Mua đề thi - Mã giao dịch: ${referenceId || "N/A"}`;
    } else if (transactionType === "adjustment") {
        return `Điều chỉnh số dư - Mã giao dịch: ${referenceId || "N/A"}`;
    }
    return `Giao dịch - Mã: ${referenceId || "N/A"}`;
};

const TYPE_META = {
    deposit: { label: "Nạp Tiền", badge: "bg-blue-50 text-blue-600" },
    withdraw: { label: "Rút Tiền", badge: "bg-red-50 text-red-600" },
    purchase: { label: "Mua", badge: "bg-emerald-50 text-emerald-600" },
    adjustment: { label: "Điều Chỉnh", badge: "bg-purple-50 text-purple-600" },
};

const STATUS_META = {
    success: { label: "Đã Xong", badge: "bg-emerald-50 text-emerald-600" },
    done: { label: "Đã Xong", badge: "bg-emerald-50 text-emerald-600" },
    pending: { label: "Đang xử lý", badge: "bg-amber-50 text-amber-600" },
    failed: { label: "Thất bại", badge: "bg-rose-50 text-rose-600" },
};

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(Math.abs(value));
const formatDate = (value) =>
    new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

export default function TransactionHistory({ role = "student" }) {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    // Fetch transaction history from API
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const params = {
                    page,
                    limit: pageSize,
                    sortBy: "created_at",
                    order: "DESC",
                };

                // Add filters only if they are set
                if (typeFilter !== "all") params.transactionType = typeFilter;
                if (dateFrom) params.fromDate = dateFrom;
                if (dateTo) params.toDate = dateTo;

                const response = await getTransactionHistory(params);
                if (response?.data && response?.message) {
                    const apiTransactions = response.data.transactions || [];
                    setTransactions(apiTransactions);
                    setPagination(response.data.pagination || {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 1,
                    });
                } else {
                    setTransactions([]);
                }
            } catch (error) {
                console.error("Error fetching transaction history:", error);
                setTransactions([]);
                toast.error("Không thể tải lịch sử giao dịch");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [page, pageSize, typeFilter, dateFrom, dateTo]);

    // Map API transactions to display format
    const mappedTransactions = useMemo(() => {
        return transactions.map((transaction) => {
            const amount = parseFloat(transaction.amount || 0);
            const displayAmount = transaction.transferType === "in" ? amount : -amount;
            const status = transaction.transactionStatus === "success" ? "done" : transaction.transactionStatus;

            return {
                id: transaction.id,
                date: transaction.created_at,
                content: generateTransactionContent(transaction),
                type: transaction.transactionType,
                amount: displayAmount,
                balanceBefore: parseFloat(transaction.beforeBalance || 0),
                balanceAfter: parseFloat(transaction.afterBalance || 0),
                status: status,
            };
        });
    }, [transactions]);

    // Client-side search only (server handles other filters)
    const filtered = useMemo(() => {
        if (!search) return mappedTransactions;
        return mappedTransactions.filter((item) => {
            return (
                item.content.toLowerCase().includes(search.toLowerCase()) ||
                formatDate(item.date).toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [mappedTransactions, search]);

    // Use API pagination
    const totalPages = pagination.totalPages || 1;
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filtered.length);
    const pageItems = filtered.slice(startIndex, endIndex);
    const totalRecords = pagination.total || filtered.length;

    const handleChangePage = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages) return;
        setPage(nextPage);
    };

    const renderAmount = (value) => {
        const isPositive = value > 0;
        return (
            <span className={`font-semibold ${isPositive ? "text-emerald-600" : "text-rose-500"}`}>
                {isPositive ? "+" : "-"}
                {formatCurrency(value)} đ
            </span>
        );
    };

    return (
        <DashboardLayout role={role}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Lịch Sử Giao Dịch</h1>
                        <p className="text-sm text-slate-500">
                            Xem lại các giao dịch nạp và mua key gần đây
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                }}
                                placeholder="Tìm kiếm"
                                className="flex-1 border-none bg-transparent text-sm outline-none focus:ring-0"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setPage(1);
                                setTypeFilter(e.target.value);
                            }}
                            className="h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="all">Loại giao dịch</option>
                            <option value="deposit">Nạp tiền</option>
                            <option value="withdraw">Rút tiền</option>
                            <option value="purchase">Mua</option>
                            <option value="adjustment">Điều chỉnh</option>
                        </select>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setPage(1);
                                setDateFrom(e.target.value);
                            }}
                            placeholder="Ngày bắt đầu"
                            className="h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setPage(1);
                                setDateTo(e.target.value);
                            }}
                            placeholder="Ngày kết thúc"
                            className="h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPage(1);
                                setPageSize(Number(e.target.value));
                            }}
                            className="h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                        >
                            {[10, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        #
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        NGÀY GIAO DỊCH
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        NỘI DUNG GIAO DỊCH
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        LOẠI GIAO DỊCH
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        SỐ LƯỢNG
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        SỐ DƯ TRƯỚC
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        SỐ DƯ SAU
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                                        TRẠNG THÁI GIAO DỊCH
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                                                <span>Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pageItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            Không tìm thấy giao dịch phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    pageItems.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">
                                                {startIndex + idx + 1}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {formatDate(item.date)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {item.content}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${TYPE_META[item.type]?.badge
                                                        }`}
                                                >
                                                    {TYPE_META[item.type]?.label || "Khác"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{renderAmount(item.amount)}</td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {formatCurrency(item.balanceBefore)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {formatCurrency(item.balanceAfter)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_META[item.status]?.badge
                                                        }`}
                                                >
                                                    {STATUS_META[item.status]?.label || "Khác"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-slate-600 sm:flex-row">
                        <p>
                            Đang hiển thị {pageItems.length === 0 ? 0 : startIndex + 1} đến {endIndex} của{" "}
                            {search ? filtered.length : totalRecords}{" "}
                            bản ghi
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleChangePage(currentPage - 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={currentPage === 1}
                                aria-label="Trang trước"
                            >
                                <FiChevronLeft />
                            </button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handleChangePage(pageNum)}
                                            className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${currentPage === pageNum
                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handleChangePage(currentPage + 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={currentPage === totalPages}
                                aria-label="Trang sau"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

