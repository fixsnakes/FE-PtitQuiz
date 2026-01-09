import apiClient from "./apiClient";

/**
 * Tạo LiveKit room cho lớp học
 * @param {number|string} classId - ID lớp học
 * @param {Object} roomData - { title, description, max_participants, scheduled_start_time, settings }
 * @returns {Promise<Object>}
 */
export const createLiveKitRoom = async (classId, roomData) => {
  try {
    const response = await apiClient.post(
      `/api/classes/${classId}/livekit-rooms`,
      roomData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating LiveKit room:", error);
    throw error;
  }
};

/**
 * Lấy danh sách LiveKit rooms của lớp học
 * @param {number|string} classId - ID lớp học
 * @returns {Promise<Object>}
 */
export const getClassLiveKitRooms = async (classId) => {
  try {
    const response = await apiClient.get(`/api/classes/${classId}/livekit-rooms`);
    return response.data;
  } catch (error) {
    console.error("Error getting class LiveKit rooms:", error);
    throw error;
  }
};

/**
 * Lấy access token để join LiveKit room
 * @param {number|string} roomId - ID room
 * @returns {Promise<Object>} { token, url, room_name, participant_name, participant_identity }
 */
export const getLiveKitAccessToken = async (roomId) => {
  try {
    const response = await apiClient.post(`/api/livekit-rooms/${roomId}/token`);
    return response;
  } catch (error) {
    console.error("Error getting LiveKit access token:", error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái room
 * @param {number|string} roomId - ID room
 * @param {string} status - 'ended' | 'cancelled'
 * @returns {Promise<Object>}
 */
export const updateRoomStatus = async (roomId, status) => {
  try {
    const response = await apiClient.patch(`/api/livekit-rooms/${roomId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating room status:", error);
    throw error;
  }
};

/**
 * Xóa LiveKit room
 * @param {number|string} roomId - ID room
 * @returns {Promise<Object>}
 */
export const deleteLiveKitRoom = async (roomId) => {
  try {
    const response = await apiClient.delete(`/api/livekit-rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting LiveKit room:", error);
    throw error;
  }
};
