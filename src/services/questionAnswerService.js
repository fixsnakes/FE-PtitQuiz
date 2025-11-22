import { apiClient } from "./apiClient";

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Tạo đáp án mới
 * @param {Object} payload - { question_id, text, is_correct }
 */
export function createAnswer(payload) {
  if (!payload?.question_id) {
    throw new Error("question_id là bắt buộc.");
  }
  if (!payload?.text?.trim()) {
    throw new Error("text là bắt buộc.");
  }

  return apiClient.post("/api/question-answers", {
    question_id: payload.question_id,
    text: payload.text,
    is_correct: payload.is_correct ?? false,
  });
}

/**
 * Lấy danh sách đáp án
 * @param {Object} params - { question_id }
 */
export function getAnswers(params = {}) {
  const query = buildQueryString({
    question_id: params.question_id,
  });

  return apiClient.get(`/api/question-answers${query}`);
}

/**
 * Lấy thông tin đáp án theo ID
 * @param {number|string} answerId - ID của đáp án
 */
export function getAnswer(answerId) {
  if (!answerId) {
    throw new Error("answerId là bắt buộc.");
  }

  return apiClient.get(`/api/question-answers/${answerId}`);
}

/**
 * Cập nhật đáp án
 * @param {number|string} answerId - ID của đáp án
 * @param {Object} payload - { text, is_correct }
 */
export function updateAnswer(answerId, payload) {
  if (!answerId) {
    throw new Error("answerId là bắt buộc.");
  }

  return apiClient.put(`/api/question-answers/${answerId}`, {
    text: payload.text,
    is_correct: payload.is_correct,
  });
}

/**
 * Xóa đáp án
 * @param {number|string} answerId - ID của đáp án
 */
export function deleteAnswer(answerId) {
  if (!answerId) {
    throw new Error("answerId là bắt buộc.");
  }

  return apiClient.delete(`/api/question-answers/${answerId}`);
}

export default {
  createAnswer,
  getAnswers,
  getAnswer,
  updateAnswer,
  deleteAnswer,
};

