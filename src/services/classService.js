import { apiClient } from "./apiClient";

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  if (!entries.length) {
    return "";
  }

  const searchParams = new URLSearchParams();
  entries.forEach(([key, value]) => searchParams.append(key, value));
  return `?${searchParams.toString()}`;
}

export function getTeacherClasses(params = {}) {
  const query = buildQuery(params);
  return apiClient.get(`/api/classes${query}`);
}

export function createClass(payload) {
  return apiClient.post("/api/classes", payload);
}

export function getClassStudents({ classId, classCode, page, search, pageSize } = {}) {
  if (!classId && !classCode) {
    throw new Error("classId hoặc classCode là bắt buộc.");
  }

  const query = buildQuery({
    class_id: classId,
    class: classCode,
    page,
    search,
    limit: pageSize,
  });

  return apiClient.get(`/api/classes/students${query}`);
}

export function updateStudentBanStatus({ classId, studentId, isBanned }) {
  if (!classId || !studentId || typeof isBanned !== "boolean") {
    throw new Error("classId, studentId và isBanned là bắt buộc.");
  }

  return apiClient.post("/api/classes/student/ban", {
    class_id: classId,
    student_id: studentId,
    is_banned: isBanned,
  });
}

export function deleteClass(classId) {
  if (!classId) {
    throw new Error("classId là bắt buộc.");
  }

  const query = buildQuery({ class_id: classId });
  return apiClient.delete(`/api/classes${query}`);
}

export default {
  getTeacherClasses,
  createClass,
  getClassStudents,
  updateStudentBanStatus,
  deleteClass,
};


