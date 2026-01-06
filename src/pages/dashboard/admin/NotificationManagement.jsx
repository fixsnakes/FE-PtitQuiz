import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSend, FiX, FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import adminService from "../../../services/adminService";
import notificationService from "../../../services/notificationService";
import formatDateTime from "../../../utils/format_time";

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    email: "",
    type: "",
    is_read: "",
    date_from: "",
    date_to: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Broadcast Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    target_type: "all",
    target_role: "",
    user_ids: "",
  });

  useEffect(() => {
    loadNotifications();
  }, [pagination.page, filters.type, filters.is_read, filters.date_from, filters.date_to]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { email: search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.is_read !== "" && { is_read: filters.is_read === "true" }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      };

      const response = await adminService.getNotificationHistory(params);
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Không thể tải lịch sử thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilters({
      email: "",
      type: "",
      is_read: "",
      date_from: "",
      date_to: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadNotifications();
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "student_joined_class":
        return "bg-blue-100 text-blue-700";
      case "exam_assigned_to_class":
        return "bg-purple-100 text-purple-700";
      case "exam_submitted":
        return "bg-green-100 text-green-700";
      case "feedback_updated":
        return "bg-orange-100 text-orange-700";
      case "exam_reminder":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "student_joined_class":
        return "Học sinh tham gia lớp";
      case "exam_assigned_to_class":
        return "Bài kiểm tra mới";
      case "exam_submitted":
        return "Học sinh nộp bài";
      case "feedback_updated":
        return "Feedback cập nhật";
      case "exam_reminder":
        return "Nhắc nhở kiểm tra";
      default:
        return type;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-700";
      case "teacher":
        return "bg-green-100 text-green-700";
      case "admin":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "student":
        return "Học sinh";
      case "teacher":
        return "Giáo viên";
      case "admin":
        return "Quản trị viên";
      default:
        return role;
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...broadcastForm,
        ...(broadcastForm.target_type === "specific_users" && {
          user_ids: broadcastForm.user_ids
            .split(",")
            .map((id) => parseInt(id.trim())),
        }),
      };

      const response = await notificationService.broadcastNotification(payload);
      if (response.success) {
        toast.success(
          `Đã gửi thông báo đến ${response.data.notificationsSent || response.data.count || 'nhiều'} người dùng`
        );
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: "",
          message: "",
          target_type: "all",
          target_role: "",
          user_ids: "",
        });
        loadNotifications();
      }
    } catch (error) {
      console.error("Error broadcasting notification:", error);
      toast.error(error.body?.message || "Không thể gửi thông báo");
    }
  };

  const getTargetLabel = (targetType, targetRole) => {
    if (targetType === "all") return "Tất cả người dùng";
    if (targetType === "role") {
      if (targetRole === "student") return "Học sinh";
      if (targetRole === "teacher") return "Giáo viên";
      if (targetRole === "admin") return "Quản trị viên";
    }
    if (targetType === "specific_users") return "Người dùng cụ thể";
    return "N/A";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý thông báo
          </h1>
          <p className="text-slate-600 mt-1">
            Gửi thông báo hệ thống và theo dõi lịch sử
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters
                ? "bg-slate-700 text-white"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <FiFilter className="h-5 w-5" />
            <span>Lọc</span>
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <FiSend className="h-5 w-5" />
            <span>Gửi thông báo</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo email người nhận..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <FiSearch className="h-4 w-4" />
            <span>Tìm kiếm</span>
          </button>
        </form>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loại thông báo
              </label>
              <select
                value={filters.type}
                onChange={(e) => {
                  setFilters({ ...filters, type: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                <option value="student_joined_class">Học sinh tham gia lớp</option>
                <option value="exam_assigned_to_class">Bài kiểm tra mới</option>
                <option value="exam_submitted">Học sinh nộp bài</option>
                <option value="feedback_updated">Feedback cập nhật</option>
                <option value="exam_reminder">Nhắc nhở kiểm tra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trạng thái đọc
              </label>
              <select
                value={filters.is_read}
                onChange={(e) => {
                  setFilters({ ...filters, is_read: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả</option>
                <option value="true">Đã đọc</option>
                <option value="false">Chưa đọc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => {
                  setFilters({ ...filters, date_from: e.target.value });
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
                value={filters.date_to}
                onChange={(e) => {
                  setFilters({ ...filters, date_to: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Không tìm thấy thông báo nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Loại
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Tiêu đề
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Nội dung
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Người nhận
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Trạng thái
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${
                        !notification.is_read ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeBadge(
                            notification.type
                          )}`}
                        >
                          {getTypeLabel(notification.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-xs" title={notification.title}>
                          {notification.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 line-clamp-2 max-w-md" title={notification.message}>
                          {notification.message}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {notification.recipient?.fullName || "N/A"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {notification.recipient?.email || ""}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${getRoleBadge(
                              notification.recipient?.role
                            )}`}
                          >
                            {getRoleLabel(notification.recipient?.role)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {notification.is_read ? (
                          <div>
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                              Đã đọc
                            </span>
                            {notification.read_at && (
                              <p className="text-xs text-slate-500 mt-1">
                                {formatDateTime(notification.read_at)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                            Chưa đọc
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDateTime(notification.created_at)}
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
                trong tổng số {pagination.total} thông báo
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

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Gửi thông báo hệ thống
              </h2>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={broadcastForm.title}
                  onChange={(e) =>
                    setBroadcastForm({ ...broadcastForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="text-right text-xs text-slate-500 mt-1">
                  {broadcastForm.title.length}/200
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  maxLength={500}
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      message: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="text-right text-xs text-slate-500 mt-1">
                  {broadcastForm.message.length}/500
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gửi đến <span className="text-red-500">*</span>
                </label>
                <select
                  value={broadcastForm.target_type}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      target_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Tất cả người dùng</option>
                  <option value="role">Theo vai trò</option>
                  <option value="specific_users">Người dùng cụ thể</option>
                </select>
              </div>

              {broadcastForm.target_type === "role" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={broadcastForm.target_role}
                    onChange={(e) =>
                      setBroadcastForm({
                        ...broadcastForm,
                        target_role: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="student">Học sinh</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
              )}

              {broadcastForm.target_type === "specific_users" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    User IDs (phân cách bằng dấu phẩy){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.user_ids}
                    onChange={(e) =>
                      setBroadcastForm({
                        ...broadcastForm,
                        user_ids: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: 1, 5, 10"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

