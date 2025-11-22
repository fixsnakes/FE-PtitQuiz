import { apiClient } from "./apiClient";

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Lấy danh sách thông báo
 * @param {Object} params - { page, limit, unread_only }
 */
export function getNotifications(params = {}) {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    unread_only: params.unread_only,
  });

  return apiClient.get(`/api/notifications${query}`);
}

/**
 * Lấy số lượng thông báo chưa đọc
 */
export function getUnreadCount() {
  return apiClient.get("/api/notifications/unread-count");
}

/**
 * Đánh dấu thông báo là đã đọc
 * @param {number|string} notificationId - ID của thông báo
 */
export function markNotificationAsRead(notificationId) {
  if (!notificationId) {
    throw new Error("notificationId là bắt buộc.");
  }

  return apiClient.put(`/api/notifications/${notificationId}/read`);
}

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export function markAllNotificationsAsRead() {
  return apiClient.put("/api/notifications/read-all");
}

/**
 * Xóa thông báo
 * @param {number|string} notificationId - ID của thông báo
 */
export function deleteNotification(notificationId) {
  if (!notificationId) {
    throw new Error("notificationId là bắt buộc.");
  }

  return apiClient.delete(`/api/notifications/${notificationId}`);
}

export default {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};

