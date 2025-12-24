import { apiClient } from "./apiClient";

/**
 * Tạo hoặc cập nhật rating cho exam
 * @param {Object} payload - { exam_id, rating (1-5), comment (optional), result_id (optional) }
 */
export function createOrUpdateRating(payload) {
  if (!payload.exam_id || !payload.rating) {
    throw new Error("exam_id và rating là bắt buộc.");
  }
  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating phải từ 1 đến 5.");
  }

  return apiClient.post("/api/exam-ratings", payload);
}

/**
 * Lấy rating trung bình của exam
 * @param {number|string} examId - ID của exam
 */
export function getExamAverageRating(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}/rating`);
}

/**
 * Lấy rating của user hiện tại cho exam
 * @param {number|string} examId - ID của exam
 */
export function getUserRating(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}/my-rating`);
}

/**
 * Lấy tất cả ratings của exam (với phân trang)
 * @param {number|string} examId - ID của exam
 * @param {Object} params - { page, limit }
 */
export function getExamRatings(examId, params = {}) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);

  const query = queryParams.toString();
  return apiClient.get(`/api/exams/${examId}/ratings${query ? `?${query}` : ""}`);
}

/**
 * Xóa rating
 * @param {number|string} examId - ID của exam
 */
export function deleteRating(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.delete(`/api/exams/${examId}/rating`);
}

export default {
  createOrUpdateRating,
  getExamAverageRating,
  getUserRating,
  getExamRatings,
  deleteRating,
};

