import { apiClient } from "./apiClient";

function normalizeExamId(payload) {
  return (
    payload?.id ??
    payload?.exam_id ??
    payload?.examId ??
    payload?.data?.id ??
    payload?.data?.exam_id
  );
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

export function listExams(params = {}) {
  const query = buildQueryString(params);
  return apiClient.get(`/api/exams${query}`);
}

export function createExam(payload) {
  if (!payload?.title?.trim()) {
    throw new Error("Tiêu đề đề thi là bắt buộc.");
  }

  if (payload.minutes === undefined || payload.minutes === null) {
    throw new Error("minutes là bắt buộc.");
  }

  return apiClient.post("/api/exams", payload);
}

export function getExamDetail(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.get(`/api/exams/${examId}`);
}

export function updateExam(examId, payload) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.put(`/api/exams/${examId}`, payload);
}

export function deleteExam(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.delete(`/api/exams/${examId}`);
}

export function switchQuestionCreationMethod(examId, targetMethod) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }
  if (!targetMethod) {
    throw new Error("targetMethod là bắt buộc.");
  }

  return apiClient.post(`/api/exams/${examId}/switch-question-method`, {
    target_method: targetMethod,
  });
}

export async function createQuestion(payload) {
  if (!payload?.exam_id) {
    throw new Error("exam_id là bắt buộc khi tạo câu hỏi.");
  }
  if (!payload?.question_text?.trim()) {
    throw new Error("question_text là bắt buộc.");
  }

  return apiClient.post("/api/questions", payload);
}

export async function createExamWithQuestions(
  examPayload,
  questionsPayload = []
) {
  const examResponse = await createExam(examPayload);
  const examId = normalizeExamId(examResponse);

  if (!examId) {
    throw new Error("Không lấy được exam_id từ phản hồi.");
  }

  const results = [];

  for (let index = 0; index < questionsPayload.length; index += 1) {
    const questionPayload = {
      order: index + 1,
      ...questionsPayload[index],
      exam_id: questionsPayload[index]?.exam_id ?? examId,
    };
    const response = await createQuestion(questionPayload);
    results.push(response);
  }

  return {
    exam: examResponse,
    examId,
    questions: results,
  };
}

export default {
  listExams,
  createExam,
  getExamDetail,
  updateExam,
  deleteExam,
  switchQuestionCreationMethod,
  createQuestion,
  createExamWithQuestions,
};

