import { apiClient } from "./apiClient";

export function getTeacherDashboardStats() {
  return apiClient.get("/api/teacher/dashboard/stats");
}

export function getTeacherExamPurchases(params = {}) {
  const query = new URLSearchParams();
  if (params.exam_id) query.append('exam_id', params.exam_id);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  
  const queryString = query.toString();
  return apiClient.get(`/api/teacher/exam-purchases${queryString ? '?' + queryString : ''}`);
}

export function getTeacherExamRevenue(params = {}) {
  const query = new URLSearchParams();
  if (params.exam_id) query.append('exam_id', params.exam_id);
  if (params.date_from) query.append('date_from', params.date_from);
  if (params.date_to) query.append('date_to', params.date_to);
  
  const queryString = query.toString();
  return apiClient.get(`/api/teacher/exam-revenue${queryString ? '?' + queryString : ''}`);
}

export default {
  getTeacherDashboardStats,
  getTeacherExamPurchases,
  getTeacherExamRevenue,
};

