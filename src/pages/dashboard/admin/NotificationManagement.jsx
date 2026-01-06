import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSend, FiX } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatDateTime from "../../../utils/format_time";

export default function NotificationManagement() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    target_type: "all",
    target_role: "",
    user_ids: "",
    priority: "medium",
    link: "",
  });

  useEffect(() => {
    loadNotifications();
  }, [pagination.page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await adminService.getNotificationHistory(params);
      if (response.success) {
        setBroadcasts(response.data.broadcasts || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Không thể tải lịch sử thông báo");
    } finally {
      setLoading(false);
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

      const response = await adminService.broadcastNotification(payload);
      if (response.success) {
        toast.success(
          `Đã gửi thông báo đến ${response.data.notificationsSent} người dùng`
        );
        setShowBroadcastModal(false);
        setBroadcastForm({
          title: "",
          message: "",
          target_type: "all",
          target_role: "",
          user_ids: "",
          priority: "medium",
          link: "",
        });
        loadNotifications();
      }
    } catch (error) {
      console.error("Error broadcasting notification:", error);
      toast.error(error.body?.message || "Không thể gửi thông báo");
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
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
            Gửi thông báo hệ thống và xem lịch sử
          </p>
        </div>
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <FiSend className="h-5 w-5" />
          <span>Gửi thông báo</span>
        </button>
      </div>

      {/* Notifications History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Chưa có thông báo broadcast nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Tiêu đề
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Nội dung
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Đối tượng
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Số người nhận
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Độ ưu tiên
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Người gửi
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((broadcast) => (
                    <tr
                      key={broadcast.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-xs" title={broadcast.title}>
                          {broadcast.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 line-clamp-2 max-w-md" title={broadcast.message}>
                          {broadcast.message}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">
                          {getTargetLabel(broadcast.target_type, broadcast.target_role)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-semibold text-slate-800">
                          {broadcast.recipients_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(
                            broadcast.priority
                          )}`}
                        >
                          {getPriorityLabel(broadcast.priority)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-800">
                          {broadcast.sender?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {broadcast.sender?.email || ""}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDateTime(broadcast.created_at)}
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Độ ưu tiên <span className="text-red-500">*</span>
                </label>
                <select
                  value={broadcastForm.priority}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      priority: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link (tùy chọn)
                </label>
                <input
                  type="text"
                  value={broadcastForm.link}
                  onChange={(e) =>
                    setBroadcastForm({ ...broadcastForm, link: e.target.value })
                  }
                  placeholder="/path/to/page"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

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

