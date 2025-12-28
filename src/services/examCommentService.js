import { apiClient } from "./apiClient";

/**
 * Lấy tất cả comments của exam (với replies nested)
 * @param {number|string} examId - ID của exam
 */
export function getCommentsByExam(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}/comments`);
}

/**
 * Tạo comment mới (root comment hoặc reply)
 * @param {Object} payload - { exam_id, text, parent_id (optional) }
 */
export function createComment(payload) {
  if (!payload.exam_id || !payload.text) {
    throw new Error("exam_id và text là bắt buộc.");
  }

  return apiClient.post("/api/exam-comments", payload);
}

/**
 * Lấy comment theo ID
 * @param {number|string} commentId - ID của comment
 */
export function getCommentById(commentId) {
  if (!commentId) {
    throw new Error("commentId là bắt buộc.");
  }

  return apiClient.get(`/api/exam-comments/${commentId}`);
}

/**
 * Cập nhật comment (chỉ owner mới có quyền)
 * @param {number|string} commentId - ID của comment
 * @param {Object} payload - { text }
 */
export function updateComment(commentId, payload) {
  if (!commentId) {
    throw new Error("commentId là bắt buộc.");
  }
  if (!payload.text) {
    throw new Error("text là bắt buộc.");
  }

  return apiClient.put(`/api/exam-comments/${commentId}`, payload);
}

/**
 * Xóa comment (chỉ owner mới có quyền, sẽ xóa cả replies)
 * @param {number|string} commentId - ID của comment
 */
export function deleteComment(commentId) {
  if (!commentId) {
    throw new Error("commentId là bắt buộc.");
  }

  return apiClient.delete(`/api/exam-comments/${commentId}`);
}

export default {
  getCommentsByExam,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
};

