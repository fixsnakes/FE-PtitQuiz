import { io } from "socket.io-client";

// Sử dụng cùng URL với API, nhưng nếu không có thì dùng port 5005 (backend default)
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5005";

let socket = null;
let isInitializing = false;

/**
 * Khởi tạo kết nối WebSocket (singleton pattern)
 * @returns {Socket} Socket instance
 */
export const initSocket = () => {
  // Nếu socket đã tồn tại và đang connected hoặc đang connecting, reuse nó
  if (socket && (socket.connected || socket.connecting)) {
    return socket;
  }

  // Nếu socket đã tồn tại nhưng disconnected, disconnect cũ trước khi tạo mới
  if (socket && socket.disconnected) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  // Nếu đang trong quá trình init, đợi socket hiện tại
  if (isInitializing && socket) {
    return socket;
  }

  // Đánh dấu đang init để tránh tạo nhiều socket cùng lúc
  isInitializing = true;

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
    autoConnect: true,
  });

  // Chỉ add global listeners một lần
  socket.on("connect", () => {
    console.log("WebSocket connected:", socket.id);
    isInitializing = false;
  });

  socket.on("disconnect", (reason) => {
    console.log("WebSocket disconnected:", reason);
    isInitializing = false;
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
    isInitializing = false;
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
 * --------- CHAT HỖ TRỢ ADMIN ----------
 */

/**
 * Join vào room chat hỗ trợ
 * @param {{ user_id: number|string, role: string, full_name: string }} payload
 */
export const joinSupportChat = (payload) => {
  // Đảm bảo socket đã được init
  if (!socket) {
    initSocket();
  }

  if (socket) {
    // Nếu socket chưa connected, đợi đến khi connected
    if (!socket.connected) {
      socket.once("connect", () => {
        socket.emit("join_support_chat", payload || {});
        console.log("Joined support chat room after connect", payload);
      });
    } else {
      socket.emit("join_support_chat", payload || {});
      console.log("Joined support chat room", payload);
    }
  }
};

/**
 * Gửi tin nhắn hỗ trợ lên server
 * @param {{ content: string, user_id?: number|string, role?: string, full_name?: string }} payload
 */
export const sendSupportMessage = (payload) => {
  if (!payload?.content || typeof payload.content !== "string") return;

  // Đảm bảo socket đã được init
  if (!socket) {
    initSocket();
  }

  if (socket) {
    // Chỉ emit khi socket đã connected
    if (socket.connected) {
      socket.emit("support_message", {
        content: payload.content,
        user_id: payload.user_id,
        role: payload.role,
        full_name: payload.full_name,
      });
    } else {
      console.warn("Socket not connected, message not sent:", payload.content);
    }
  }
};

/**
 * Lắng nghe tin nhắn chat hỗ trợ
 * @param {(message: any) => void} callback
 * @returns {() => void} unsubscribe
 */
export const onSupportMessage = (callback) => {
  // Đảm bảo socket đã được init
  if (!socket) {
    initSocket();
  }

  // Remove listener cũ trước khi add mới để tránh duplicate
  if (socket) {
    socket.off("support_message", callback);
    socket.on("support_message", callback);
  }

  return () => {
    if (socket) {
      socket.off("support_message", callback);
    }
  };
};

/**
 * Lắng nghe event hệ thống (user join, vv)
 * @param {(event: any) => void} callback
 * @returns {() => void} unsubscribe
 */
export const onSupportSystemEvent = (callback) => {
  // Đảm bảo socket đã được init
  if (!socket) {
    initSocket();
  }

  // Remove listener cũ trước khi add mới để tránh duplicate
  if (socket) {
    socket.off("support_system_event", callback);
    socket.on("support_system_event", callback);
  }

  return () => {
    if (socket) {
      socket.off("support_system_event", callback);
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
  // Chat
  joinSupportChat,
  sendSupportMessage,
  onSupportMessage,
  onSupportSystemEvent,
  getSocket,
};

