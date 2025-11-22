import { apiClient } from "./apiClient";

/**
 * Lấy danh sách tất cả bài thi mà student có thể truy cập
 * @param {Object} params - { class_id }
 */
export function getStudentExams(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.class_id) queryParams.set("class_id", params.class_id);

  const query = queryParams.toString();
  return apiClient.get(`/api/student/exams${query ? `?${query}` : ""}`);
}

/**
 * Lấy chi tiết một bài thi (không lộ đáp án)
 * @param {number|string} examId - ID của bài thi
 */
export function getStudentExamDetail(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/student/exams/${examId}`);
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

export default {
  getStudentExams,
  getStudentExamDetail,
  getStudentExamsWithStatus,
  getStudentExamsByStatus,
  getStudentExamStatus,
};

