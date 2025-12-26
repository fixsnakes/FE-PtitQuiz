import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiLoader,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiX,
  FiExternalLink,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../../services/notificationService";
import formatDateTime from "../../../utils/format_time";

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [filter, setFilter] = useState("all"); // all, unread

  // Hàm tạo link dựa trên loại thông báo và data
  const getNotificationLink = (notification) => {
    if (!notification.data) return null;

    let data;
    try {
      data = typeof notification.data === 'string' 
        ? JSON.parse(notification.data) 
        : notification.data;
    } catch (e) {
      return null;
    }

    switch (notification.type) {
      case 'exam_submitted':
        // Link đến trang kết quả thi
        if (data.exam_id) {
          return `/dashboard/teacher/exams/${data.exam_id}/results`;
        }
        break;
      case 'student_joined_class':
        // Link đến chi tiết lớp học
        if (data.class_id) {
          return `/teacher/classes/${data.class_id}`;
        }
        break;
      case 'exam_assigned_to_class':
        // Link đến chi tiết lớp học hoặc chi tiết đề thi
        if (data.class_id) {
          return `/teacher/classes/${data.class_id}`;
        }
        break;
      case 'feedback_updated':
        // Link đến chi tiết đề thi (nếu có exam_id)
        if (data.exam_id) {
          return `/dashboard/teacher/exams/${data.exam_id}`;
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Xử lý click vào notification
  const handleNotificationClick = async (notification) => {
    const link = getNotificationLink(notification);
    
    if (link) {
      // Đánh dấu đã đọc nếu chưa đọc
      if (!notification.is_read) {
        try {
          await markNotificationAsRead(notification.id);
          loadNotifications();
          loadUnreadCount();
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      }
      
      // Điều hướng đến trang liên quan
      navigate(link);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    loadNotifications();
  }, [pagination.page, filter]);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response?.unread_count || 0);
    } catch (error) {
      console.error("Không thể tải số lượng thông báo chưa đọc:", error);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications({
        page: pagination.page,
        limit: pagination.limit,
        unread_only: filter === "unread",
      });

      const notificationsList = response?.notifications || [];
      const paginationData = response?.pagination || {};

      setNotifications(notificationsList);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.total_pages || 1,
      }));
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể tải thông báo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success("Đã đánh dấu đã đọc.");
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể đánh dấu đã đọc."
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể đánh dấu tất cả là đã đọc."
      );
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa thông báo này?")) return;

    try {
      await deleteNotification(notificationId);
      toast.success("Đã xóa thông báo.");
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể xóa thông báo."
      );
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Thông báo
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý thông báo</h1>
              {unreadCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-indigo-600"></span>
                  <p className="text-sm font-medium text-slate-600">
                    Có <span className="font-bold text-indigo-600">{unreadCount}</span> thông báo chưa đọc
                  </p>
                </div>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
              >
                <FiCheckCircle />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-200 opacity-20 blur-2xl"></div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "all"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilter("unread");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "unread"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <FiLoader className="absolute inset-0 m-auto animate-pulse text-xl text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FiBell className="text-3xl text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-700">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Chưa có thông báo nào"}
              </h3>
              <p className="text-sm text-slate-500">
                {filter === "unread"
                  ? "Tất cả thông báo của bạn đã được đọc."
                  : "Các thông báo mới sẽ xuất hiện ở đây."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {notifications.map((notification, index) => {
                  const link = getNotificationLink(notification);
                  const hasLink = link !== null;

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-xl border p-4 transition-all duration-200 ${
                        notification.is_read
                          ? "border-slate-200 bg-white"
                          : "border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-white"
                      } ${hasLink ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""}`}
                      onClick={hasLink ? () => handleNotificationClick(notification) : undefined}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></span>
                                Mới
                              </span>
                            )}
                            {hasLink && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                                <FiExternalLink className="h-3 w-3" />
                                Xem chi tiết
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {notification.message}
                          </p>
                          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                            <FiCalendar className="h-3 w-3" />
                            {formatDateTime(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {!notification.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md"
                              title="Đánh dấu đã đọc"
                            >
                              <FiCheck />
                              Đã đọc
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(notification.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow-md"
                            title="Xóa thông báo"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-slate-500">
                    Trang {pagination.page}/{pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-white disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(pagination.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-white disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default NotificationsPage;

