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
  // Validate classId
  if (classId === undefined || classId === null || classId === "") {
    throw new Error("classId là bắt buộc.");
  }

  // Validate studentId
  if (studentId === undefined || studentId === null || studentId === "") {
    throw new Error("studentId là bắt buộc.");
  }

  // Validate isBanned is boolean
  if (typeof isBanned !== "boolean") {
    throw new Error("isBanned phải là giá trị boolean (true/false).");
  }

  // Convert to number if they are strings
  const classIdNum = typeof classId === 'string' ? parseInt(classId, 10) : classId;
  const studentIdNum = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;

  if (isNaN(classIdNum)) {
    throw new Error("classId phải là số hợp lệ.");
  }

  if (isNaN(studentIdNum)) {
    throw new Error("studentId phải là số hợp lệ.");
  }

  return apiClient.post("/api/classes/student/ban", {
    class_id: classIdNum,
    student_id: studentIdNum,
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


