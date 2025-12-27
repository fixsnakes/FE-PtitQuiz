import { apiClient } from "./apiClient";

// Gửi OTP cho đăng ký
export function sendOTPSignup(payload) {
  return apiClient.post("/api/auth/send-otp-signup", payload);
}

// Xác thực OTP và đăng ký
export function signup(payload) {
  return apiClient.post("/api/auth/signup", payload);
}

export function signin(payload) {
  return apiClient.post("/api/auth/signin", payload);
}

// Gửi OTP cho quên mật khẩu
export function sendOTPForForgotPassword(payload) {
  return apiClient.post("/api/auth/forgot-password/send-otp", payload);
}

// Đặt lại mật khẩu với OTP
export function resetPassword(payload) {
  return apiClient.post("/api/auth/forgot-password/reset", payload);
}

