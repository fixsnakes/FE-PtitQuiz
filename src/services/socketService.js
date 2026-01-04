import { io } from "socket.io-client";

// Sử dụng cùng URL với API, nhưng nếu không có thì dùng port 5005 (backend default)
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5005";

let socket = null;

/**
 * Khởi tạo kết nối WebSocket
 * @returns {Socket} Socket instance
 */
export const initSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.log("WebSocket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
  });

  return socket;
};

/**
 * Đóng kết nối WebSocket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join room để theo dõi exam cụ thể
 * @param {number|string} examId - ID của exam
 */
export const joinExamMonitoring = (examId) => {
  if (!socket || !socket.connected) {
    initSocket();
  }
  
  if (socket && examId) {
    socket.emit("join_exam_monitoring", { exam_id: examId });
    console.log(`Joined exam monitoring room: exam_${examId}`);
  }
};

/**
 * Leave room exam monitoring
 * @param {number|string} examId - ID của exam
 */
export const leaveExamMonitoring = (examId) => {
  if (socket && examId) {
    socket.emit("leave_exam_monitoring", { exam_id: examId });
    console.log(`Left exam monitoring room: exam_${examId}`);
  }
};

/**
 * Lắng nghe sự kiện gian lận mới
 * @param {Function} callback - Callback function nhận log mới
 * @returns {Function} Hàm để unsubscribe
 */
export const onNewCheatingEvent = (callback) => {
  if (!socket || !socket.connected) {
    initSocket();
  }

  socket.on("new_cheating_event", callback);

  // Trả về hàm để unsubscribe
  return () => {
    if (socket) {
      socket.off("new_cheating_event", callback);
    }
  };
};

/**
 * Lấy socket instance hiện tại
 * @returns {Socket|null}
 */
export const getSocket = () => {
  return socket;
};

export default {
  initSocket,
  disconnectSocket,
  joinExamMonitoring,
  leaveExamMonitoring,
  onNewCheatingEvent,
  getSocket,
};

