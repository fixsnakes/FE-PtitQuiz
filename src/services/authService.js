import { apiClient } from "./apiClient";

export function signup(payload) {
  return apiClient.post("/api/auth/signup", payload);
}

export function signin(payload) {
  return apiClient.post("/api/auth/signin", payload);
}

