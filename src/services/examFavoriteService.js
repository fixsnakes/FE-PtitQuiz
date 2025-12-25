import { apiClient } from "./apiClient";

/**
 * Lấy danh sách tất cả bài thi yêu thích của user hiện tại
 */
export function getFavoriteExams() {
  return apiClient.get("/api/exam-favorites");
}

/**
 * Thêm bài thi vào danh sách yêu thích
 * @param {number|string} examId - ID của bài thi
 */
export function addFavorite(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.post("/api/exam-favorites", { exam_id: examId });
}

/**
 * Xóa bài thi khỏi danh sách yêu thích
 * @param {number|string} examId - ID của bài thi
 */
export function removeFavorite(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.delete(`/api/exam-favorites/${examId}`);
}

/**
 * Kiểm tra xem bài thi có trong danh sách yêu thích không
 * @param {number|string} examId - ID của bài thi
 */
export function checkFavorite(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exam-favorites/${examId}/check`);
}

export default {
  getFavoriteExams,
  addFavorite,
  removeFavorite,
  checkFavorite,
};

