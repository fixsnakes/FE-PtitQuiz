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

/**
 * Export exam results to CSV
 * @param {number|string} examId - ID của đề thi
 * @param {string} format - Format ('csv' hoặc 'json')
 */
export async function exportExamResults(examId, format = 'csv') {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  
  const token = localStorage.getItem("accessToken");
  
  const response = await fetch(
    `${API_BASE_URL}/api/exams/${examId}/results/export?format=${format}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-access-token": token,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const error = new Error(errorData.message || "Export failed");
    error.status = response.status;
    error.body = errorData;
    throw error;
  }

  if (format === 'csv') {
    return await response.blob();
  } else {
    return await response.json();
  }
}

export default {
  getExamResults,
  updateExamResultFeedback,
  exportExamResults,
};

