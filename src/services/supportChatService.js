import apiClient from "./apiClient";

/**
 * Lấy lịch sử chat hỗ trợ cho STUDENT/TEACHER
 * (1 hội thoại riêng giữa user và admin)
 * @param {Object} params - { limit, offset }
 * @returns {Promise<Object>} Lịch sử chat
 */
export const getUserChatHistory = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/api/support-chat/user/messages",
      {
        params,
      }
    );
    // Return toàn bộ response object để component có thể access status, data, total
    return response;
  } catch (error) {
    console.error("Error getting user chat history:", error);
    throw error;
  }
};

/**
 * Lấy lịch sử chat hỗ trợ cho ADMIN
 * Admin có thể truyền user_id để xem hội thoại cụ thể với 1 user
 * @param {Object} params - { limit, offset, user_id }
 * @returns {Promise<Object>} Lịch sử chat
 */
export const getAdminChatHistory = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/api/support-chat/admin/messages",
      {
        params,
      }
    );
    // Return toàn bộ response object để component có thể access status, data, total
    return response;
  } catch (error) {
    console.error("Error getting admin chat history:", error);
    throw error;
  }
};
