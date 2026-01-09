import React from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

/**
 * LiveKit Video Call Component (dùng UI có sẵn của LiveKit)
 * @param {Object} props
 * @param {string} props.url - LiveKit WebSocket URL (LIVEKIT_URL)
 * @param {string} props.token - Access token để join room
 * @param {Function} props.onLeave - Callback khi user rời room
 */
export default function LiveKitVideoCall({ url, token, onLeave }) {
  if (!url || !token) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-900 text-white">
        <p>Không tìm thấy thông tin cuộc gọi.</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video
      audio
      serverUrl={url}
      token={token}
      onDisconnected={onLeave}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
    >
      {/* Giao diện video call đầy đủ: camera, mic, chat, share screen, layout tự động */}
      <VideoConference />
    </LiveKitRoom>
  );
}