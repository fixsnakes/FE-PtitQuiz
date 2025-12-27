import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSearch, FiX, FiCheck, FiEye, FiFilter, FiEdit } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import formatDateTime from "../../../utils/format_time";

export default function WithdrawalManagement() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [summary, setSummary] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [order, setOrder] = useState("DESC");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [withdrawalDetail, setWithdrawalDetail] = useState(null);

    // Form states
    const [editForm, setEditForm] = useState({
        status: "",
        note: "",
    });

    useEffect(() => {
        loadWithdrawals();
    }, [pagination.page, statusFilter, sortBy, order, fromDate, toDate]);

    const loadWithdrawals = async () => {
        try {
            setLoading(true);
            
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...(statusFilter && { status: statusFilter }),
                ...(search && { search }),
                sortBy,
                order,
                ...(fromDate && { fromDate }),
                ...(toDate && { toDate }),
            };
            
            const response = await adminService.getWithdrawals(params);
            
            if (response.success) {
                setWithdrawals(response.data.withdrawals || []);
                setPagination(response.data.pagination || pagination);
                setSummary(response.data.summary || null);
            } else {
                toast.error(response.message || "Không thể tải danh sách rút tiền");
            }
        } catch (error) {
            console.error("Error loading withdrawals:", error);
            const errorMessage = error.body?.message || error.message || "Không thể tải danh sách rút tiền";
            toast.error(errorMessage);
            setWithdrawals([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        loadWithdrawals();
    };

    const openEditModal = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setEditForm({
            status: withdrawal.status === "pending" ? "approved" : withdrawal.status,
            note: ""
        });
        setShowEditModal(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        
        if (editForm.status === "rejected" && !editForm.note.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            let response;
            if (editForm.status === "approved") {
                response = await adminService.approveWithdrawal(
                    selectedWithdrawal.id,
                    { admin_note: editForm.note }
                );
            } else if (editForm.status === "rejected") {
                response = await adminService.rejectWithdrawal(
                    selectedWithdrawal.id,
                    { reject_reason: editForm.note }
                );
            }
            
            if (response.success) {
                toast.success(
                    editForm.status === "approved" 
                        ? "Đã duyệt yêu cầu rút tiền thành công" 
                        : "Đã từ chối yêu cầu rút tiền"
                );
                setShowEditModal(false);
                setEditForm({ status: "", note: "" });
                loadWithdrawals();
            }
        } catch (error) {
            console.error("Error updating withdrawal:", error);
            toast.error(error.body?.message || "Không thể cập nhật yêu cầu rút tiền");
        }
    };

    const handleViewDetail = async (withdrawal) => {
        try {
            const response = await adminService.getWithdrawalById(withdrawal.id);
            
            if (response.success) {
                setWithdrawalDetail(response.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error("Error loading withdrawal detail:", error);
            toast.error("Không thể tải thông tin chi tiết");
        }
    };

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("");
        setFromDate("");
        setToDate("");
        setSortBy("created_at");
        setOrder("DESC");
        setPagination({ ...pagination, page: 1 });
    };

    const getStatusConfig = (status) => {
        const config = {
            pending: {
                label: "Chờ xử lý",
                badge: "bg-yellow-50 text-yellow-600",
                dot: "bg-yellow-500",
            },
            approved: {
                label: "Đã chuyển tiền",
                badge: "bg-green-50 text-green-600",
                dot: "bg-green-500",
            },
            rejected: {
                label: "Từ chối",
                badge: "bg-red-50 text-red-600",
                dot: "bg-red-500",
            },
        };
        return config[status] || config.pending;
    };

    return (
        <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">
            Quản lý rút tiền
            </h1>
            <p className="text-slate-600 mt-1">
            Xem và xử lý các yêu cầu rút tiền từ giáo viên
            </p>
        </div>

        {/* Summary Cards */}
        {summary && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                {summary.totalPending || 0}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                {formatCurrency(summary.totalAmountPending || 0)}
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600">Đã chuyển tiền</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                {summary.totalApproved || 0}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                {formatCurrency(summary.totalAmountApproved || 0)}
                </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                {summary.totalRejected || 0}
                </p>
            </div>
            </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
            <FiFilter className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Bộ lọc</h3>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tìm kiếm 
                </label>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nhập email giáo viên..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                </div>

                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Trạng thái
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="approved">Đã chuyển tiền</option>
                    <option value="rejected">Từ chối</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Từ ngày
                </label>
                <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => {
                        setFromDate(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Đến ngày
                </label>
                <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => {
                        setToDate(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sắp xếp theo
                </label>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="created_at">Ngày tạo</option>
                    <option value="amount">Số tiền</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thứ tự
                </label>
                <select
                    value={order}
                    onChange={(e) => {
                        setOrder(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="DESC">Tăng dần</option>
                    <option value="ASC">Giảm dần</option>
                </select>
                </div>
            </div>

            <div className="flex gap-3">    
                <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                <FiSearch className="h-4 w-4" />
                Tìm kiếm
                </button>
                <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                Đặt lại
                </button>
            </div>
            </form>
        </div>

        {/* Withdrawals Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
            ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
                <p className="text-slate-500">Không có yêu cầu rút tiền nào</p>
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
                        Giáo viên
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                        Số tiền
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Thông tin ngân hàng
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        Trạng thái
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Ngày yêu cầu
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        Hành động
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {withdrawals.map((withdrawal) => {
                        const statusConfig = getStatusConfig(withdrawal.status);
                        return (
                        <tr
                            key={withdrawal.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                        >
                            <td className="py-3 px-4 font-medium text-slate-800">
                            #{withdrawal.id}
                            </td>
                            <td className="py-3 px-4">
                            <p className="font-medium text-slate-800">
                                {withdrawal.user?.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                                {withdrawal.user?.email}
                            </p>
                            </td>
                            <td className="py-3 px-4 text-right">
                            <p className="font-bold text-green-600">
                                {formatCurrency(withdrawal.amount)}
                            </p>
                            </td>
                            <td className="py-3 px-4">
                            <p className="text-sm font-medium text-slate-800">
                                {withdrawal.bankName} - {withdrawal.bankAccountNumber}
                            </p>
                            <p className="text-xs text-slate-500">
                                {withdrawal.bankAccountName}
                            </p>
                            </td>
                            <td className="py-3 px-4">
                            <div className="flex items-center justify-center">
                                <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.badge}`}
                                >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                                ></span>
                                {statusConfig.label}
                                </span>
                            </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                            {formatDateTime(withdrawal.created_at)}
                            </td>
                            <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                onClick={() => openEditModal(withdrawal)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                title="Chỉnh sửa"
                                >
                                <FiEdit className="h-4 w-4" />
                                </button>
                                <button
                                onClick={() => handleViewDetail(withdrawal)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Xem chi tiết"
                                >
                                <FiEye className="h-4 w-4" />
                                </button>
                            </div>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                    trong tổng số {pagination.total} yêu cầu
                </p>
                <div className="flex gap-2">
                    <button
                    onClick={() =>
                        setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                    Trước
                    </button>
                    <button
                    onClick={() =>
                        setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                    Sau
                    </button>
                </div>
                </div>
            </>
            )}
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedWithdrawal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    Chỉnh sửa yêu cầu rút tiền
                </h2>
                <button
                    onClick={() => setShowEditModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <FiX className="h-6 w-6" />
                </button>
                </div>

                <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-3">
                <div>
                    <p className="text-sm text-slate-600">Họ tên:</p>
                    <p className="font-semibold text-slate-800">
                    {selectedWithdrawal.user?.fullName}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-slate-600">Gmail:</p>
                    <p className="font-medium text-slate-800">
                    {selectedWithdrawal.user?.email}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-slate-600">Số tài khoản ngân hàng:</p>
                    <p className="font-medium text-slate-800">
                    {selectedWithdrawal.bankName} - {selectedWithdrawal.bankAccountNumber}
                    </p>
                    <p className="text-sm text-slate-500">
                    {selectedWithdrawal.bankAccountName}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-slate-600">Số tiền rút:</p>
                    <p className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedWithdrawal.amount)}
                    </p>
                </div>
                </div>

                <form onSubmit={handleEdit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <select
                    required
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value, note: "" })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    <option value="approved">Duyệt</option>
                    <option value="rejected">Từ chối</option>
                    </select>
                </div>

                {editForm.status === "approved" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                        Chỉ xác nhận "Duyệt" khi ĐÃ CHUYỂN TIỀN THÀNH CÔNG
                    </p>
                    </div>
                )}

                {editForm.status && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {editForm.status === "approved" ? "Ghi chú (tùy chọn)" : "Lý do từ chối"} 
                        {editForm.status === "rejected" && <span className="text-red-500"> *</span>}
                    </label>
                    <textarea
                        required={editForm.status === "rejected"}
                        value={editForm.note}
                        onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                        rows="3"
                        className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ${
                        editForm.status === "approved" ? "focus:ring-green-500" : "focus:ring-red-500"
                        }`}
                        placeholder={
                        editForm.status === "approved"
                            ? "VD: Đã chuyển lúc 10:30 ngày 25/12/2025..."
                            : "VD: Thông tin ngân hàng không chính xác..."
                        }
                    />
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                    Hủy
                    </button>
                    <button
                    type="submit"
                    disabled={!editForm.status}
                    className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-white ${
                        !editForm.status 
                        ? "bg-slate-400 cursor-not-allowed" 
                        : editForm.status === "approved"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    >
                    Xác nhận
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && withdrawalDetail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                    Chi tiết yêu cầu rút tiền
                </h2>
                <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <FiX className="h-6 w-6" />
                </button>
                </div>

                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <p className="text-sm text-slate-600">ID yêu cầu</p>
                    <p className="font-semibold text-slate-800">
                        #{withdrawalDetail.id}
                    </p>
                    </div>
                    <div>
                    <p className="text-sm text-slate-600">Trạng thái</p>
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusConfig(withdrawalDetail.status).badge
                        }`}
                    >
                        <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            getStatusConfig(withdrawalDetail.status).dot
                        }`}
                        ></span>
                        {getStatusConfig(withdrawalDetail.status).label}
                    </span>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">
                    Thông tin giáo viên
                    </h3>
                    <div className="space-y-2">
                    <div>
                        <p className="text-sm text-slate-600">Họ tên</p>
                        <p className="font-medium text-slate-800">
                        {withdrawalDetail.user?.fullName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-medium text-slate-800">
                        {withdrawalDetail.user?.email}
                        </p>
                    </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">
                    Thông tin rút tiền
                    </h3>
                    <div className="space-y-2">
                    <div>
                        <p className="text-sm text-slate-600">Số tiền</p>
                        <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(withdrawalDetail.amount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Ngân hàng</p>
                        <p className="font-medium text-slate-800">
                        {withdrawalDetail.bankName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Số tài khoản</p>
                        <p className="font-medium text-slate-800">
                        {withdrawalDetail.bankAccountNumber}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Tên chủ tài khoản</p>
                        <p className="font-medium text-slate-800">
                        {withdrawalDetail.bankAccountName}
                        </p>
                    </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">
                    Thông tin xử lý
                    </h3>
                    <div className="space-y-2">
                    <div>
                        <p className="text-sm text-slate-600">Ngày yêu cầu</p>
                        <p className="font-medium text-slate-800">
                        {formatDateTime(withdrawalDetail.created_at)}
                        </p>
                    </div>
                    {withdrawalDetail.processed_at && (
                        <>
                        <div>
                            <p className="text-sm text-slate-600">Cập nhật gần nhất</p>
                            <p className="font-medium text-slate-800">
                            {formatDateTime(withdrawalDetail.processed_at)}
                            </p>
                        </div>
                        {withdrawalDetail.processedBy && (
                            <div>
                            <p className="text-sm text-slate-600">Người xử lý</p>
                            <p className="font-medium text-slate-800">
                                {withdrawalDetail.processedBy.fullName} (
                                {withdrawalDetail.processedBy.email})
                            </p>
                            </div>
                        )}
                        </>
                    )}
                    {withdrawalDetail.admin_note && (
                        <div>
                        <p className="text-sm text-slate-600">Ghi chú admin</p>
                        <p className="font-medium text-slate-800">
                            {withdrawalDetail.admin_note}
                        </p>
                        </div>
                    )}
                    {withdrawalDetail.reject_reason && (
                        <div>
                        <p className="text-sm text-slate-600">Lý do từ chối</p>
                        <p className="font-medium text-red-600">
                            {withdrawalDetail.reject_reason}
                        </p>
                        </div>
                    )}
                    </div>
                </div>
                </div>

                <div className="flex justify-end pt-6 border-t mt-6">
                <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                >
                    Đóng
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}
