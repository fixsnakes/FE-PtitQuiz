import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  initSocket,
  joinSupportChat,
  sendSupportMessage,
  onSupportMessage,
  onSupportSystemEvent,
} from "../../../services/socketService";
import { getAdminChatHistory } from "../../../services/supportChatService";
import { getStoredUser } from "../../../utils/auth";
import {
  MessageCircle,
  Shield,
  Users,
  Send,
  User,
  Filter,
} from "lucide-react";

function MessageItem({ message, isOwn }) {
  const isAdmin = message.role === "admin";

  return (
    <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isOwn
            ? "bg-emerald-600 text-white rounded-br-sm"
            : isAdmin
            ? "bg-emerald-50 text-slate-900 border border-emerald-100 rounded-bl-sm"
            : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm"
        }`}
      >
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
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
        <p className="whitespace-pre-wrap break-words text-xs sm:text-sm">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default function SupportChatAdmin() {
  const admin = getStoredUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [connected, setConnected] = useState(false);
  const hasJoinedRef = useRef(false);
  const adminIdRef = useRef(admin?.id);
  const messagesEndRef = useRef(null);

  // Nhóm tin nhắn theo user_id để admin dễ chọn
  const users = useMemo(() => {
    const map = new Map();
    messages.forEach((m) => {
      // Bỏ qua system messages và admin messages
      if (m.role === "system" || m.role === "admin") return;
      // Chuyển user_id sang string để so sánh nhất quán
      const key = String(m.user_id || "unknown");
      if (!map.has(key)) {
        map.set(key, {
          user_id: key,
          full_name: m.full_name || "Người dùng",
          role: m.role,
        });
      }
    });
    return Array.from(map.values());
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (selectedUserId === "all") {
      // Hiển thị tất cả messages khi chọn "all"
      return messages;
    }
    // Khi chọn một user cụ thể, hiển thị:
    // 1. Messages của user đó (role !== "admin" && role !== "system")
    // 2. Messages của admin (role === "admin")
    // 3. System messages liên quan đến user đó
    const selectedUserIdStr = String(selectedUserId);
    return messages.filter((m) => {
      if (m.role === "admin") return true; // Luôn hiển thị admin messages
      if (m.role === "system") {
        // Hiển thị system event nếu liên quan đến user được chọn
        return String(m.user_id || "unknown") === selectedUserIdStr;
      }
      return String(m.user_id || "unknown") === selectedUserIdStr;
    });
  }, [messages, selectedUserId]);

  // Load lịch sử chat khi component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getAdminChatHistory({ limit: 100 });
        console.log("Admin chat history response:", response);
        
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
        console.error("Error loading admin chat history:", error);
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

    // Lưu admin id để so sánh sau này
    adminIdRef.current = admin?.id;

    const adminData = {
      user_id: admin?.id,
      role: "admin",
      full_name:
        admin?.fullName || admin?.username || admin?.email || "Admin",
    };

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
      // Chỉ hiển thị system event của user khác, không phải của chính admin
      if (
        event.type === "user_join" &&
        String(event.user_id) === String(adminIdRef.current)
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
        joinSupportChat(adminData);
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

  // Auto scroll khi có message mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const baseAdmin = {
      user_id: admin?.id || null,
      role: "admin",
      full_name:
        admin?.fullName || admin?.username || admin?.email || "Admin",
    };

    // Xác định hội thoại admin đang trả lời (user_id bên phía student/teacher)
    // Nếu đang chọn "all" thì không biết trả lời user nào -> bỏ qua
    if (!selectedUserId || selectedUserId === "all") {
      return;
    }

    // Chỉ gửi lên server, không add local message
    // Server sẽ broadcast lại và client sẽ nhận qua onSupportMessage
    sendSupportMessage({
      ...baseAdmin,
      content: trimmed,
      // target_user_id giúp backend biết hội thoại 1-1 admin <-> user nào
      target_user_id: selectedUserId,
    });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
              Hỗ trợ người dùng (Admin)
            </h2>
            <p className="text-xs text-slate-500">
              {connected
                ? "Đang online tại kênh hỗ trợ"
                : "Đang kết nối tới kênh hỗ trợ..."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0 border-t border-slate-100 sm:flex-row">
        {/* Cột bên trái: danh sách người dùng đang có tin nhắn */}
        <aside className="border-b border-slate-200 bg-slate-50 p-3 text-xs sm:w-64 sm:border-b-0 sm:border-r">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Users className="h-3.5 w-3.5" />
              <span>Người dùng</span>
            </div>
            <Filter className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <button
            onClick={() => setSelectedUserId("all")}
            className={`mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
              selectedUserId === "all"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            <span className="font-semibold">Tất cả hội thoại</span>
          </button>

          <div className="mt-1 space-y-1">
            {users.length === 0 && (
              <p className="px-1 py-2 text-[11px] text-slate-500">
                Chưa có tin nhắn nào từ người dùng.
              </p>
            )}
            {users.map((u) => {
              const key = u.user_id || "unknown";
              return (
                <button
                  key={key}
                  onClick={() => setSelectedUserId(key)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
                    selectedUserId === key
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-white text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="line-clamp-1">
                      {u.full_name || "Người dùng"}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase text-slate-400">
                    {u.role === "teacher"
                      ? "GV"
                      : u.role === "student"
                      ? "HS"
                      : "KH"}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Cột bên phải: nội dung chat */}
        <section className="flex flex-1 flex-col">
          <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
            {filteredMessages.length === 0 && (
              <div className="mt-6 text-center text-xs text-slate-500 sm:text-sm">
                Chưa có tin nhắn trong hội thoại này. Khi người dùng gửi tin,
                bạn sẽ thấy tại đây.
              </div>
            )}

            {filteredMessages.map((msg, idx) => (
              <MessageItem
                key={`${msg.timestamp || Date.now()}-${idx}-${msg.user_id || "unknown"}`}
                message={msg}
                isOwn={msg.role === "admin"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Nhập câu trả lời cho người dùng..."
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-200"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Send className="mr-1.5 h-4 w-4" />
                Gửi
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Lưu ý: hiện tại hệ thống chỉ hiển thị tin nhắn realtime, chưa lưu
              lịch sử.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

