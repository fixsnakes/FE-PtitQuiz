import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getStoredUser } from "../../utils/auth";
import { getLiveKitAccessToken } from "../../services/livekitRoomService";
import LiveKitVideoCall from "../../components/LiveKitVideoCall";

export default function LiveKitCallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const role = user?.role || "teacher";

  const [loading, setLoading] = useState(true);
  const [callInfo, setCallInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getLiveKitAccessToken(roomId);
        if (response?.status && response?.data) {
          setCallInfo(response.data);
        } else {
          setError(response?.message || "Không lấy được thông tin cuộc gọi.");
        }
      } catch (err) {
        const msg =
          err?.body?.message || err?.message || "Không lấy được thông tin cuộc gọi.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchToken();
    } else {
      setError("Thiếu thông tin phòng gọi.");
      setLoading(false);
    }
  }, [roomId]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else if (role === "teacher") {
      navigate("/teacher/classes");
    } else if (role === "student") {
      navigate("/dashboard/student/classes");
    } else {
      navigate("/");
    }
  };

  const handleLeave = () => {
    handleBack();
  };

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
              Quay lại
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                {location.state?.room?.title || "LiveKit Call"}
              </h1>
              {location.state?.className && (
                <p className="text-sm text-slate-500">
                  Lớp: {location.state.className}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nội dung */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden">
          {loading && (
            <div className="flex h-full items-center justify-center text-slate-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                <p>Đang chuẩn bị cuộc gọi...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full items-center justify-center text-center text-red-500">
              <div>
                <p className="font-semibold mb-2">Không thể mở cuộc gọi</p>
                <p className="text-sm text-red-300">{error}</p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <FiArrowLeft />
                  Quay lại
                </button>
              </div>
            </div>
          )}

          {!loading && !error && callInfo && (
            <LiveKitVideoCall
              url={callInfo.url}
              token={callInfo.token}
              onLeave={handleLeave}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

