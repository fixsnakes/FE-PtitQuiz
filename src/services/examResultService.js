import { apiClient } from "./apiClient";

/**
 * Lấy tất cả kết quả của một đề thi
 * @param {number|string} examId - ID của đề thi
 */
export function getExamResults(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}/results`);
}

/**
 * Cập nhật feedback cho kết quả thi
 * @param {number|string} resultId - ID của kết quả thi
 * @param {Object} payload - { feedback }
 */
export function updateExamResultFeedback(resultId, payload) {
  if (!resultId) {
    throw new Error("resultId là bắt buộc.");
  }
  if (payload.feedback === undefined) {
    throw new Error("feedback là bắt buộc.");
  }

  return apiClient.put(`/api/exam-results/${resultId}/feedback`, {
    feedback: payload.feedback,
  });
}

export default {
  getExamResults,
  updateExamResultFeedback,
};

