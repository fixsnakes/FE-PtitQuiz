import { apiClient } from "./apiClient";

function normalizeQuestionList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.questions)) return payload.questions;
  return [];
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listQuestions({ examId, page, limit } = {}) {
  const query = buildQueryString({
    exam_id: examId,
    page,
    limit,
  });
  const response = await apiClient.get(`/api/questions${query}`);
  return normalizeQuestionList(response);
}

export function getQuestion(questionId) {
  if (!questionId) {
    throw new Error("questionId là bắt buộc.");
  }
  return apiClient.get(`/api/questions/${questionId}`);
}

export function createQuestion(payload) {
  if (!payload?.exam_id) {
    throw new Error("exam_id là bắt buộc khi tạo câu hỏi.");
  }
  if (!payload?.question_text?.trim()) {
    throw new Error("question_text là bắt buộc.");
  }

  return apiClient.post("/api/questions", payload);
}

export function updateQuestion(questionId, payload) {
  if (!questionId) {
    throw new Error("questionId là bắt buộc khi cập nhật.");
  }

  return apiClient.put(`/api/questions/${questionId}`, payload);
}

export function deleteQuestion(questionId) {
  if (!questionId) {
    throw new Error("questionId là bắt buộc khi xóa.");
  }

  return apiClient.delete(`/api/questions/${questionId}`);
}

export function reorderQuestions(examId, questionOrders = []) {
  if (!examId) {
    throw new Error("examId là bắt buộc khi sắp xếp câu hỏi.");
  }
  if (!Array.isArray(questionOrders) || questionOrders.length === 0) {
    throw new Error("question_orders phải là mảng và không được rỗng.");
  }

  return apiClient.put(`/api/exams/${examId}/questions/order`, {
    question_orders: questionOrders,
  });
}

export default {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
};

