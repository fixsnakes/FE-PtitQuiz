import { apiClient } from "./apiClient";

/**
 * Ghi log sự kiện gian lận trong lúc thi
 * @param {number|string} sessionId - ID của session
 * @param {Object} payload - { cheating_type, description, metadata, severity }
 */
export function logCheatingEvent(sessionId, payload) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }
  if (!payload?.cheating_type) {
    throw new Error("cheating_type là bắt buộc.");
  }

  return apiClient.post(`/api/sessions/${sessionId}/cheating-log`, payload);
}

/**
 * Lấy lịch sử gian lận của một session
 * @param {number|string} sessionId - ID của session
 */
export function getSessionCheatingLogs(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }

  return apiClient.get(`/api/sessions/${sessionId}/cheating-logs`);
}

/**
 * Lấy lịch sử gian lận của một exam (cho teacher)
 * @param {number|string} examId - ID của exam
 */
export function getExamCheatingLogs(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}/cheating-logs`);
}

/**
 * Lấy lịch sử gian lận của một student trong một exam (cho teacher)
 * @param {number|string} examId - ID của exam
 * @param {number|string} studentId - ID của student
 */
export function getStudentExamCheatingLogs(examId, studentId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }
  if (!studentId) {
    throw new Error("studentId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}/students/${studentId}/cheating-logs`);
}

/**
 * Lấy tất cả lịch sử gian lận của một student
 * @param {Object} params - { exam_id, page, limit }
 */
export function getStudentCheatingLogs(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.exam_id) queryParams.set("exam_id", params.exam_id);
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);

  const query = queryParams.toString();
  return apiClient.get(`/api/student/cheating-logs${query ? `?${query}` : ""}`);
}

export default {
  logCheatingEvent,
  getSessionCheatingLogs,
  getExamCheatingLogs,
  getStudentExamCheatingLogs,
  getStudentCheatingLogs,
};

