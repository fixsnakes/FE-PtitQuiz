import { apiClient } from "./apiClient";

/**
 * Lấy danh sách tất cả bài thi mà student có thể truy cập
 * @param {Object} params - { search, class_id, is_paid, page, limit }
 */
export function getStudentExams(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.search && params.search.trim()) {
    queryParams.set("search", params.search.trim());
  }
  if (params.class_id) queryParams.set("class_id", params.class_id);
  if (params.is_paid !== undefined && params.is_paid !== "") {
    queryParams.set("is_paid", params.is_paid);
  }
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);
  if (params.offset !== undefined) queryParams.set("offset", params.offset);

  const query = queryParams.toString();
  return apiClient.get(`/api/exams${query ? `?${query}` : ""}`);
}

/**
 * Lấy chi tiết một bài thi (không lộ đáp án)
 * @param {number|string} examId - ID của bài thi
 */
export function getStudentExamDetail(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}`);
}

/**
 * Lấy tất cả exams kèm theo trạng thái làm bài của student
 */
export function getStudentExamsWithStatus() {
  return apiClient.get("/api/student/exams/with-status");
}

/**
 * Lấy danh sách exams theo trạng thái làm bài
 * @param {Object} params - { status: 'not_started' | 'in_progress' | 'completed' }
 */
export function getStudentExamsByStatus(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.set("status", params.status);

  const query = queryParams.toString();
  return apiClient.get(`/api/student/exams/by-status${query ? `?${query}` : ""}`);
}

/**
 * Lấy trạng thái của student cho một exam cụ thể
 * @param {number|string} examId - ID của bài thi
 */
export function getStudentExamStatus(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/student/exams/${examId}/status`);
}

/**
 * Lấy danh sách bài thi tương tự
 * @param {number|string} examId - ID của bài thi hiện tại
 * @param {Object} params - { limit } - Số lượng bài thi tương tự muốn lấy
 */
export function getSimilarExams(examId, params = {}) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.set("limit", params.limit);

  const query = queryParams.toString();
  return apiClient.get(`/api/exams/${examId}/similar${query ? `?${query}` : ""}`);
}

export default {
  getStudentExams,
  getStudentExamDetail,
  getStudentExamsWithStatus,
  getStudentExamsByStatus,
  getStudentExamStatus,
  getSimilarExams,
};

