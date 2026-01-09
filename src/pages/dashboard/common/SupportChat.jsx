import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getStoredUser } from "../../../utils/auth";
import {
  initSocket,
  joinSupportChat,
  sendSupportMessage,
  onSupportMessage,
  onSupportSystemEvent,
} from "../../../services/socketService";
import { getUserChatHistory } from "../../../services/supportChatService";
import { MessageCircle, Send, User, Shield } from "lucide-react";

function ChatBubble({ message, isOwn }) {
  const isAdmin = message.role === "admin";

  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
          isOwn
            ? "bg-indigo-600 text-white rounded-br-sm"
            : isAdmin
            ? "bg-emerald-50 text-slate-900 border border-emerald-100 rounded-bl-sm"
            : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isAdmin ? (
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <User className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>{message.full_name || (isAdmin ? "Admin" : "Người dùng")}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default function SupportChat() {
  const currentUser = getStoredUser();
  const role = currentUser?.role === "teacher" ? "teacher" : "student";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const currentUserIdRef = useRef(currentUser?.id);

  // Load lịch sử chat khi component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getUserChatHistory({ limit: 100 });
        console.log("User chat history response:", response);
        
        const history = Array.isArray(response?.data) ? response.data : [];
        console.log("Parsed history:", history);

        // Format messages từ DB để giống với format từ socket
        const formattedMessages = history.map((msg) => ({
          id: msg.id,
          user_id: msg.user_id,
          role: msg.message_type === "system" ? "system" : msg.role,
          full_name: msg.full_name,
          content: msg.content,
          timestamp: msg.timestamp,
          message_type: msg.message_type,
        }));
        console.log("Formatted messages:", formattedMessages);
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error loading chat history:", error);
        // Không throw error, vẫn cho phép chat realtime
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    // Chỉ join một lần duy nhất khi component mount
    if (hasJoinedRef.current) {
      return;
    }

    const socket = initSocket();

    const userData = currentUser
      ? {
          user_id: currentUser.id,
          role: currentUser.role,
          full_name:
            currentUser.fullName || currentUser.username || currentUser.email,
        }
      : {
          user_id: null,
          role: role,
          full_name: "Khách",
        };

    // Lưu user_id để so sánh sau này
    currentUserIdRef.current = userData.user_id;

    // Set up listeners TRƯỚC khi join
    const messageHandler = (msg) => {
      // Đảm bảo message có content hợp lệ
      if (!msg || !msg.content) {
        return;
      }
      setMessages((prev) => {
        // Kiểm tra duplicate dựa trên ID (nếu có), timestamp, content và user_id
        const isDuplicate = prev.some(
          (m) =>
            (msg.id && m.id === msg.id) || // Nếu có ID thì check ID
            (m.timestamp === msg.timestamp &&
              m.content === msg.content &&
              m.user_id === msg.user_id)
        );
        if (isDuplicate) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    const systemEventHandler = (event) => {
      // Chỉ hiển thị system event của user khác, không phải của chính mình
      if (
        event.type === "user_join" &&
        String(event.user_id) === String(currentUserIdRef.current)
      ) {
        return; // Bỏ qua event của chính mình
      }

      const systemMessage = {
        ...event,
        content:
          event.type === "user_join"
            ? `${event.full_name || "Người dùng"} đã tham gia chat hỗ trợ`
            : event.content || "",
        role: "system",
        timestamp: event.timestamp || new Date().toISOString(),
        // Thêm user_id vào system message để filter duplicate dễ hơn
        user_id: event.user_id,
      };

      setMessages((prev) => {
        // Kiểm tra duplicate: với user_join, chỉ cần kiểm tra user_id và loại event
        // Không cần kiểm tra timestamp vì cùng một user có thể join lại
        if (event.type === "user_join") {
          const isDuplicate = prev.some(
            (m) =>
              m.role === "system" &&
              m.user_id === event.user_id &&
              m.content === systemMessage.content
          );
          if (isDuplicate) {
            return prev;
          }
        } else {
          // Với các event khác, kiểm tra timestamp và content
          const isDuplicate = prev.some(
            (m) =>
              m.role === "system" &&
              m.content === systemMessage.content &&
              Math.abs(new Date(m.timestamp).getTime() - new Date(systemMessage.timestamp).getTime()) < 1000 // Cho phép sai số 1 giây
          );
          if (isDuplicate) {
            return prev;
          }
        }
        return [...prev, systemMessage];
      });
    };

    const offMessage = onSupportMessage(messageHandler);
    const offSystem = onSupportSystemEvent(systemEventHandler);

    const handleConnect = () => {
      setConnected(true);
      // Join room sau khi socket connected
      if (!hasJoinedRef.current) {
        joinSupportChat(userData);
        hasJoinedRef.current = true;
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    // Nếu socket đã connected, join ngay
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("disconnect", handleDisconnect);

    return () => {
      offMessage();
      offSystem();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      // Reset khi unmount để có thể join lại nếu cần
      hasJoinedRef.current = false;
    };
  }, []); // Chỉ chạy một lần khi mount

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const baseUser = {
      user_id: currentUser?.id || null,
      role: currentUser?.role || role,
      full_name:
        currentUser?.fullName || currentUser?.username || currentUser?.email || "Người dùng",
    };

    // Chỉ gửi lên server, không add local message
    // Server sẽ broadcast lại và client sẽ nhận qua onSupportMessage
    sendSupportMessage({
      ...baseUser,
      content: trimmed,
    });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const title =
    role === "teacher"
      ? "Chat hỗ trợ với Admin (Giáo viên)"
      : "Chat hỗ trợ với Admin (Học sinh)";

  return (
    <DashboardLayout role={role}>
      <div className="mx-auto flex h-[calc(100vh-120px)] max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                {title}
              </h1>
              <p className="text-xs text-slate-500">
                {connected
                  ? "Đã kết nối tới kênh hỗ trợ"
                  : "Đang kết nối tới kênh hỗ trợ..."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
          {messages.length === 0 && (
            <div className="mt-10 text-center text-sm text-slate-500">
              Chào bạn! Hãy gửi tin nhắn đầu tiên để được admin hỗ trợ nhé.
            </div>
          )}

          {messages
            .filter((msg) => msg && msg.content) // Chỉ render messages có content
            .map((msg, idx) => {
              // Chuẩn hóa user_id để so sánh (cả string và number)
              const msgUserId = String(msg.user_id || "");
              const currentUserId = String(currentUser?.id || "");
              const isOwnMessage =
                !!currentUser &&
                msgUserId === currentUserId &&
                msg.role === currentUser.role;

              return (
                <ChatBubble
                  key={`${msg.timestamp || Date.now()}-${idx}-${msgUserId}-${msg.content?.substring(0, 20)}`}
                  message={msg}
                  isOwn={isOwnMessage}
                />
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Nhập nội dung cần hỗ trợ..."
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Gửi
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Tin nhắn của bạn sẽ được gửi trực tiếp tới admin hệ thống.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

