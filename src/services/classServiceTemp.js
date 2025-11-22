import { apiClient } from "./apiClient";

/**
 * Lấy danh sách lớp học (cho student)
 * @param {number} limit - Số lượng lớp mỗi trang
 * @param {number} offset - Số lượng lớp bỏ qua
 */
export const getClasses = async (limit, offset) => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit);
    if (offset) queryParams.append("offset", offset);
    
    const query = queryParams.toString();
    const path = `/api/classes${query ? `?${query}` : ""}`;
    
    const data = await apiClient.get(path);
    return data;
  } catch (error) {
    return {
      status: false,
      message: error.body?.message || error.message,
    };
  }
};

/**
 * Tham gia lớp học bằng mã lớp
 * @param {string} classCode - Mã lớp học
 */
export const joinClass = async (classCode) => {
  try {
    const data = await apiClient.get(`/api/classes/join?code=${classCode}`);
    return data;
  } catch (error) {
    return {
      status: false,
      message: error.body?.message || error.message,
    };
  }
};