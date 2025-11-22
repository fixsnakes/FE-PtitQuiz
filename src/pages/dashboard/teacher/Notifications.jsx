import React, { useEffect, useState } from "react";
import {
  FiBell,
  FiLoader,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiX,
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
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Thông báo
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý thông báo</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500">
                Có {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <FiCheckCircle />
              Đánh dấu tất cả đã đọc
            </button>
          )}
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
            <div className="flex items-center justify-center py-10 text-slate-500">
              <FiLoader className="mr-2 animate-spin" />
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
              <FiBell className="mx-auto mb-3 text-3xl text-slate-400" />
              {filter === "unread"
                ? "Không có thông báo chưa đọc nào."
                : "Chưa có thông báo nào."}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-xl border p-4 transition ${
                      notification.is_read
                        ? "border-slate-200 bg-white"
                        : "border-indigo-200 bg-indigo-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                              Mới
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                            title="Đánh dấu đã đọc"
                          >
                            <FiCheck />
                            Đã đọc
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(notification.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          title="Xóa thông báo"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

