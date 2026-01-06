import { apiClient } from "./apiClient";

/**
 * Bắt đầu một bài thi (tạo exam session)
 * @param {number|string} examId - ID của bài thi
 */
export function startExamSession(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  return apiClient.post(`/api/exams/${examId}/start`);
}

/**
 * Lấy thông tin exam session hiện tại đang diễn ra
 * @param {number|string} examId - ID của bài thi
 * @returns {Promise} Resolves với session data hoặc throws error với status 404 nếu không có session
 */
export async function getCurrentSession(examId) {
  if (!examId) {
    throw new Error("examId là bắt buộc.");
  }

  try {
    return await apiClient.get(`/api/exams/${examId}/session`);
  } catch (error) {
    // 404 là expected behavior khi chưa có session, không cần log như error
    if (error.status === 404) {
      // Tạo error object với flag để biết đây là expected 404
      const expectedError = new Error(error.message || "No active exam session found");
      expectedError.status = 404;
      expectedError.body = error.body;
      expectedError.isExpected = true; // Flag để biết đây là expected 404
      throw expectedError;
    }
    throw error;
  }
}

/**
 * Lấy danh sách câu hỏi cho session đang thi
 * @param {number|string} sessionId - ID của session
 */
export function getSessionQuestions(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }

  return apiClient.get(`/api/sessions/${sessionId}/questions`);
}

/**
 * Trả lời một câu hỏi trong session
 * @param {number|string} sessionId - ID của session
 * @param {Object} payload - { question_id, selected_answer_id } hoặc { question_id, answer_text }
 */
export function submitAnswer(sessionId, payload) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }
  if (!payload?.question_id) {
    throw new Error("question_id là bắt buộc.");
  }

  // Thử endpoint số ít trước (theo apidesign), nếu không được thì dùng số nhiều
  return apiClient.post(`/api/sessions/${sessionId}/answer`, payload);
}

/**
 * Lấy tất cả câu trả lời của một session
 * @param {number|string} sessionId - ID của session
 */
export function getSessionAnswers(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }

  return apiClient.get(`/api/sessions/${sessionId}/answers`);
}

/**
 * Nộp bài thi và tính điểm tự động
 * @param {number|string} sessionId - ID của session
 */
export function submitExam(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }

  return apiClient.post(`/api/sessions/${sessionId}/submit`);
}

/**
 * Lấy kết quả thi của một session (sau khi đã submit)
 * @param {number|string} sessionId - ID của session
 */
export function getSessionResult(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId là bắt buộc.");
  }

  return apiClient.get(`/api/sessions/${sessionId}/result`);
}

/**
 * Lấy tất cả exam sessions của student (để hiển thị recent exams)
 */
export function getStudentSessions() {
  return apiClient.get("/api/exam-sessions/my-sessions");
}

export default {
  startExamSession,
  getCurrentSession,
  getSessionQuestions,
  submitAnswer,
  getSessionAnswers,
  submitExam,
  getSessionResult,
  getStudentSessions,
};

