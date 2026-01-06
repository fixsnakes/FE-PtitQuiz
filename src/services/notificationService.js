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

export function getNotifications(params = {}) {
  const query = buildQueryString({
    page: params.page,
    limit: params.limit,
    unread_only: params.unread_only,
  });

  return apiClient.get(`/api/notifications${query}`);
}

export function getUnreadCount() {
  return apiClient.get("/api/notifications/unread-count");
}

export function markNotificationAsRead(notificationId) {
  if (!notificationId) {
    throw new Error("notificationId là bắt buộc.");
  }

  return apiClient.put(`/api/notifications/${notificationId}/read`);
}

export function markAllNotificationsAsRead() {
  return apiClient.put("/api/notifications/read-all");
}

export function deleteNotification(notificationId) {
  if (!notificationId) {
    throw new Error("notificationId là bắt buộc.");
  }

  return apiClient.delete(`/api/notifications/${notificationId}`);
}

export function createNotification(data) {
  return apiClient.post("/api/notifications", data);
}

export function broadcastNotification(data) {
  return apiClient.post("/api/admin/notifications/broadcast", data);
}

export default {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  broadcastNotification,
};

