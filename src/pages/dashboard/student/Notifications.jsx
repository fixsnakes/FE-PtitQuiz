import React, { useState, useEffect } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../../services/notificationService";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Trophy,
  MessageSquare,
} from "lucide-react";

export default function StudentNotifications() {
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

  useEffectOnce(() => {
    loadUnreadCount();
    loadNotifications();
  }, []);

  useEffect(() => {
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

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Điều hướng dựa trên type và data
    if (notification.data) {
      const data = typeof notification.data === 'string' 
        ? JSON.parse(notification.data) 
        : notification.data;

      switch (notification.type) {
        case 'exam_assigned_to_class':
        case 'exam_reminder':
          if (data.exam_id) {
            navigate(`/dashboard/student/exams/${data.exam_id}`);
          }
          break;
        case 'exam_submitted':
        case 'feedback_updated':
          if (data.exam_id && data.session_id) {
            navigate(`/student/exams/${data.exam_id}/result/${data.session_id}`);
          } else if (data.exam_id) {
            navigate(`/dashboard/student/exams/${data.exam_id}`);
          }
          break;
        case 'student_joined_class':
          if (data.class_id) {
            navigate(`/dashboard/student/classes/${data.class_id}`);
          }
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam_assigned_to_class':
      case 'exam_reminder':
        return <BookOpen className="h-5 w-5" />;
      case 'exam_submitted':
      case 'feedback_updated':
        return <Trophy className="h-5 w-5" />;
      case 'student_joined_class':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Thông báo
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Thông báo của tôi</h1>
              {unreadCount > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  Có {unreadCount} thông báo chưa đọc
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <CheckCheck className="h-4 w-4" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
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
                Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
              <span className="ml-3">Đang tải thông báo...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
              <Bell className="mx-auto mb-3 h-12 w-12 text-slate-400" />
              <p className="text-sm text-slate-500">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc nào."
                  : "Chưa có thông báo nào."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer rounded-xl border p-4 transition hover:shadow-md ${
                      notification.is_read
                        ? "border-slate-200 bg-white"
                        : "border-indigo-200 bg-indigo-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-1 items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          notification.is_read
                            ? "bg-slate-100 text-slate-600"
                            : "bg-indigo-100 text-indigo-600"
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
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
                      </div>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-3 w-3" />
                            Đã đọc
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-500">
                    Trang {pagination.page}/{pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
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
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
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

