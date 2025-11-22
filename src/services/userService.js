import { apiClient } from "./apiClient";

/**
 * Lấy thông tin user profile
 */
export const getUserInformation = async () => {
  try {
    const data = await apiClient.get("/api/user/profile");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật profile
 * @param {string} newfullName - Tên mới
 * @param {string} email - Email
 */
export const UpdateProfile = async (newfullName, email) => {
  try {
    const data = await apiClient.post("/api/user/profile", {
      fullName: newfullName,
      email: email,
    });
    return { status: true, data };
  } catch (error) {
    return {
      status: false,
      data: error.body || { message: error.message },
    };
  }
};

/**
 * Đổi mật khẩu
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 */
export const ChangePassword = async (currentPassword, newPassword) => {
  try {
    const data = await apiClient.post("/api/user/changepassword", {
      currentPassword: currentPassword,
      newPassword: newPassword,
    });
    return data;
  } catch (error) {
    return {
      status: false,
      message: error.body?.message || error.message,
    };
  }
};