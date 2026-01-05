import { apiClient } from "./apiClient";

// otp signup
export function sendOTPSignup(payload) {
  return apiClient.post("/api/auth/send-otp-signup", payload);
}

// otp verify
export function signup(payload) {
  return apiClient.post("/api/auth/signup", payload);
}

// sign in
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

