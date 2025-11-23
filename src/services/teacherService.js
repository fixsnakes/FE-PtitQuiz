import { apiClient } from "./apiClient";

export function getTeacherDashboardStats() {
  return apiClient.get("/api/teacher/dashboard/stats");
}

export default {
  getTeacherDashboardStats,
};

