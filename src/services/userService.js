import { apiClient } from "./apiClient";


export const getUserInformation = async () => {
  try {
    const data = await apiClient.get("/api/user/profile");
    return data;
  } catch (error) {
    throw error;
  }
};


export const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
      "http://localhost:5005";

    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}/api/upload/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-access-token": token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || "Upload failed");
    }

    const data = await response.json();
    return { status: true, data };
  } catch (error) {
    return {
      status: false,
      message: error.message || "Lỗi khi upload avatar",
    };
  }
};


export const UpdateProfile = async (newfullName, email, avatar_url = null) => {
  try {
    const payload = {
      fullName: newfullName,
      email: email,
    };

    if (avatar_url !== null) {
      payload.avatar_url = avatar_url;
    }

    const data = await apiClient.post("/api/user/profile", payload);
    return { status: true, data };
  } catch (error) {
    return {
      status: false,
      data: error.body || { message: error.message },
    };
  }
};


// Gửi OTP cho đổi mật khẩu
export const sendOTPForChangePassword = async () => {
  try {
    const data = await apiClient.post("/api/user/changepassword/send-otp");
    return data;
  } catch (error) {
    return {
      status: false,
      message: error.body?.message || error.message,
    };
  }
};

// Đổi mật khẩu với OTP
export const ChangePassword = async (currentPassword, newPassword, otp) => {
  try {
    const data = await apiClient.post("/api/user/changepassword", {
      currentPassword: currentPassword,
      newPassword: newPassword,
      otp: otp,
    });
    return data;
  } catch (error) {
    return {
      status: false,
      message: error.body?.message || error.message,
    };
  }
};