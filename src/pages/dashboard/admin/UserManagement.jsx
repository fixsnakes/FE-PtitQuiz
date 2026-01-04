import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiX,
  FiEye,
} from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import formatDateTime from "../../../utils/format_time";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    balance: 0,
  });

  const [balanceForm, setBalanceForm] = useState({
    amount: 0,
    reason: "",
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, roleFilter, sortBy, order]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(roleFilter && { role: roleFilter }),
        ...(search && { search }),
        sortBy,
        order,
      };

      const response = await adminService.getAllUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.createUser(formData);
      if (response.success) {
        toast.success("Tạo người dùng thành công");
        setShowCreateModal(false);
        resetForm();
        loadUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.body?.message || "Không thể tạo người dùng");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { password, ...updateData } = formData;
      const response = await adminService.updateUser(
        selectedUser.id,
        updateData
      );
      if (response.success) {
        toast.success("Cập nhật người dùng thành công");
        setShowEditModal(false);
        resetForm();
        loadUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.body?.message || "Không thể cập nhật người dùng");
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deleteUser(user.id);
      if (response.success) {
        toast.success("Xóa người dùng thành công");
        loadUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.body?.message || "Không thể xóa người dùng");
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.adjustUserBalance(
        selectedUser.id,
        balanceForm
      );
      if (response.success) {
        toast.success("Điều chỉnh số dư thành công");
        setShowBalanceModal(false);
        setBalanceForm({ amount: 0, reason: "" });
        loadUsers();
      }
    } catch (error) {
      console.error("Error adjusting balance:", error);
      toast.error(error.body?.message || "Không thể điều chỉnh số dư");
    }
  };

  const handleViewDetail = async (user) => {
    try {
      const response = await adminService.getUserById(user.id);
      if (response.success) {
        setUserDetail(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading user detail:", error);
      toast.error("Không thể tải thông tin chi tiết");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      balance: parseFloat(user.balance) || 0,
    });
    setShowEditModal(true);
  };

  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setBalanceForm({ amount: 0, reason: "" });
    setShowBalanceModal(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "student",
      balance: 0,
    });
    setSelectedUser(null);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "teacher":
        return "bg-blue-100 text-blue-700";
      case "student":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "teacher":
        return "Giáo viên";
      case "student":
        return "Học sinh";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý người dùng
          </h1>
          <p className="text-slate-600 mt-1">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <FiPlus className="h-5 w-5" />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="student">Học sinh</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Quản trị viên</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="last_login">Đăng nhập gần nhất</option>
            <option value="balance">Số dư</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="DESC">Giảm dần</option>
            <option value="ASC">Tăng dần</option>
          </select>

          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Không tìm thấy người dùng nào</p>
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
                      Họ và tên
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Vai trò
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                      Số dư
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Ngày tạo
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600">
                        #{user.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">
                          {user.fullName}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-green-600">
                          {formatCurrency(user.balance)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDateTime(user.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openBalanceModal(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Điều chỉnh số dư"
                          >
                            <FiDollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} người dùng
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Thêm người dùng mới
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số dư ban đầu
                </label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Chỉnh sửa người dùng
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số dư
                </label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Điều chỉnh số dư
              </h2>
              <button
                onClick={() => setShowBalanceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Người dùng:</p>
              <p className="font-semibold text-slate-800">
                {selectedUser.fullName}
              </p>
              <p className="text-sm text-slate-600 mt-2">Số dư hiện tại:</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(selectedUser.balance)}
              </p>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số tiền điều chỉnh <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={balanceForm.amount}
                  onChange={(e) =>
                    setBalanceForm({
                      ...balanceForm,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Nhập số dương để cộng, số âm để trừ"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Ví dụ: 100 để cộng thêm, -50 để trừ đi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lý do <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={balanceForm.reason}
                  onChange={(e) =>
                    setBalanceForm({ ...balanceForm, reason: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nhập lý do điều chỉnh số dư..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && userDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Chi tiết người dùng
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">ID</p>
                  <p className="font-semibold">#{userDetail.user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Vai trò</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${getRoleBadgeClass(
                      userDetail.user.role
                    )}`}
                  >
                    {getRoleLabel(userDetail.user.role)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Họ và tên</p>
                  <p className="font-semibold">{userDetail.user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold">{userDetail.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Số dư</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(userDetail.user.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ngày tạo</p>
                  <p className="font-semibold">
                    {formatDateTime(userDetail.user.created_at)}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              {userDetail.statistics && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    Thống kê
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Số lần mua</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {userDetail.statistics.purchaseCount}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Tổng chi tiêu</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(userDetail.statistics.totalSpent)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">Số bài đã làm</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {userDetail.statistics.examsTaken}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600">
                        Điểm trung bình
                      </p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {userDetail.statistics.avgScore}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
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

