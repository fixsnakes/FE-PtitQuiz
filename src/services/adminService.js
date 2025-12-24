import { apiClient } from "./apiClient";

const ADMIN_BASE = "/api/admin";

// ========== DASHBOARD ==========
export const getDashboardOverview = () => {
  return apiClient.get(`${ADMIN_BASE}/dashboard`);
};

export const getDashboardStats30Days = () => {
  return apiClient.get(`${ADMIN_BASE}/dashboard/stats-30-days`);
};

// ========== USER MANAGEMENT ==========
export const getAllUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/users${query ? `?${query}` : ""}`);
};

export const getUserById = (id) => {
  return apiClient.get(`${ADMIN_BASE}/users/${id}`);
};

export const createUser = (userData) => {
  return apiClient.post(`${ADMIN_BASE}/users`, userData);
};

export const updateUser = (id, userData) => {
  return apiClient.put(`${ADMIN_BASE}/users/${id}`, userData);
};

export const deleteUser = (id) => {
  return apiClient.delete(`${ADMIN_BASE}/users/${id}`);
};

export const adjustUserBalance = (id, data) => {
  return apiClient.post(`${ADMIN_BASE}/users/${id}/adjust-balance`, data);
};

// ========== EXAM MANAGEMENT ==========
export const getAllExams = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/exams${query ? `?${query}` : ""}`);
};

export const getExamById = (id) => {
  return apiClient.get(`${ADMIN_BASE}/exams/${id}`);
};

export const updateExam = (id, examData) => {
  return apiClient.put(`${ADMIN_BASE}/exams/${id}`, examData);
};

export const deleteExam = (id) => {
  return apiClient.delete(`${ADMIN_BASE}/exams/${id}`);
};

export const getExamResults = (examId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(
    `${ADMIN_BASE}/exams/${examId}/results${query ? `?${query}` : ""}`
  );
};

// ========== CLASS MANAGEMENT ==========
export const getAllClasses = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/classes${query ? `?${query}` : ""}`);
};

export const getClassById = (id) => {
  return apiClient.get(`${ADMIN_BASE}/classes/${id}`);
};

export const deleteClass = (id) => {
  return apiClient.delete(`${ADMIN_BASE}/classes/${id}`);
};

export const getClassStudents = (classId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(
    `${ADMIN_BASE}/classes/${classId}/students${query ? `?${query}` : ""}`
  );
};

// ========== PURCHASE MANAGEMENT ==========
export const getAllPurchases = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/purchases${query ? `?${query}` : ""}`);
};

export const getPurchaseById = (id) => {
  return apiClient.get(`${ADMIN_BASE}/purchases/${id}`);
};

export const refundPurchase = (id, data) => {
  return apiClient.post(`${ADMIN_BASE}/purchases/${id}/refund`, data);
};

export const getTransactionHistory = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/transactions${query ? `?${query}` : ""}`);
};

// ========== REPORTS ==========
export const getRevenueReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(
    `${ADMIN_BASE}/reports/revenue${query ? `?${query}` : ""}`
  );
};

export const getUserActivityReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(
    `${ADMIN_BASE}/reports/user-activity${query ? `?${query}` : ""}`
  );
};

export const getExamStatsReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(
    `${ADMIN_BASE}/reports/exam-stats${query ? `?${query}` : ""}`
  );
};

// ========== NOTIFICATIONS ==========
export const broadcastNotification = (data) => {
  return apiClient.post(`${ADMIN_BASE}/notifications/broadcast`, data);
};

export const getNotificationHistory = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(
    `${ADMIN_BASE}/notifications/history${query ? `?${query}` : ""}`
  );
};

// ========== CONTENT MODERATION ==========
export const getAllPosts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/posts${query ? `?${query}` : ""}`);
};

export const hidePost = (id, data) => {
  return apiClient.put(`${ADMIN_BASE}/posts/${id}/hide`, data);
};

export const showPost = (id) => {
  return apiClient.put(`${ADMIN_BASE}/posts/${id}/show`);
};

export const deletePost = (id) => {
  return apiClient.delete(`${ADMIN_BASE}/posts/${id}`);
};

export const getAllComments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient.get(`${ADMIN_BASE}/comments${query ? `?${query}` : ""}`);
};

export const deleteComment = (id) => {
  return apiClient.delete(`${ADMIN_BASE}/comments/${id}`);
};

export default {
  // Dashboard
  getDashboardOverview,
  getDashboardStats30Days,
  
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  adjustUserBalance,
  
  // Exams
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  getExamResults,
  
  // Classes
  getAllClasses,
  getClassById,
  deleteClass,
  getClassStudents,
  
  // Purchases
  getAllPurchases,
  getPurchaseById,
  refundPurchase,
  getTransactionHistory,
  
  // Reports
  getRevenueReport,
  getUserActivityReport,
  getExamStatsReport,
  
  // Notifications
  broadcastNotification,
  getNotificationHistory,
  
  // Content Moderation
  getAllPosts,
  hidePost,
  showPost,
  deletePost,
  getAllComments,
  deleteComment,
};

