import React, { useMemo, useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getStoredUser } from "../../../utils/auth";
import {
  FiUser,
  FiLock,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiSave,
  FiShield,
  FiCreditCard,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";

import { toast } from "react-toastify";
import {
  // ... các icon cũ
  FiActivity,
  FiSmartphone,
  FiMonitor,
  FiMapPin
} from "react-icons/fi";

import { getUserInformation, UpdateProfile, uploadAvatar, ChangePassword, sendOTPForChangePassword } from "../../../services/userService";
import formatDateTime from "../../../utils/format_time";
import { data, useNavigate } from "react-router-dom";
import formatCurrency from "../../../utils/format_currentcy";
export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [currentUser, setCurrentUser] = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    role: "",
    join: "",
    balance: null,
    avatar_url: null,
  });

  const [lastLogins, setlastLogins] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);


  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // OTP popup state
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);


  useEffectOnce(() => {
    // Lấy role từ localStorage trước để tránh flash sang student layout
    const user = getStoredUser();
    if (user?.role) {
      setProfileForm((prev) => ({ ...prev, role: user.role }));
    }

    const fetchData = async () => {
      const data = await getUserInformation()

      console.log(data)

      setProfileForm({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        balance: data.balance,
        join: data.created_at,
        avatar_url: data.avatar_url || null
      })

      setlastLogins(data.login_list)

      // Set avatar preview nếu có
      if (data.avatar_url) {
        const avatarUrl = data.avatar_url.startsWith('http')
          ? data.avatar_url
          : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5005"}${data.avatar_url}`;
        setAvatarPreview(avatarUrl);
      }


    }

    fetchData()
  }, []);

  const layoutRole = useMemo(() => {
    // Ưu tiên lấy từ profileForm, nếu không có thì lấy từ getStoredUser, cuối cùng mới fallback
    if (profileForm.role) return profileForm.role;

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role) return user.role;
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }

    return "student";
  }, [profileForm.role]);

  const handleProfileChange = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }))
    setProfileFeedback(null)
  }

  const handlePasswordChange = (field) => (event) => {
    const value = event.target.value;
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordFeedback(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = profileForm.fullName.trim();
    const trimmedEmail = profileForm.email.trim();

    if (!trimmedName || !trimmedEmail) {
      setProfileFeedback({
        type: "error",
        message: "Vui lòng nhập đầy đủ họ tên và email.",
      });
      return;
    }

    let avatarUrl = profileForm.avatar_url;

    // Upload avatar nếu có file mới
    if (avatarFile) {
      setUploadingAvatar(true);
      try {
        const uploadResponse = await uploadAvatar(avatarFile);
        if (uploadResponse.status) {
          avatarUrl = uploadResponse.data.avatar_url;
        } else {
          toast.error(uploadResponse.message || "Lỗi khi upload avatar");
          setUploadingAvatar(false);
          return;
        }
      } catch (error) {
        toast.error("Lỗi khi upload avatar");
        setUploadingAvatar(false);
        return;
      }
      setUploadingAvatar(false);
    }

    const response = await UpdateProfile(trimmedName, trimmedEmail, avatarUrl);

    if (!response.status) {
      toast.error("Lỗi khi cập nhật profile")
      return;
    }

    toast.success("Cập nhật profile thành công");

    // Update local state
    setProfileForm(prev => ({
      ...prev,
      fullName: trimmedName,
      email: trimmedEmail,
      avatar_url: avatarUrl
    }));

    // Update localStorage
    const user = getStoredUser();
    if (user) {
      user.fullName = trimmedName;
      user.email = trimmedEmail;
      user.avatar_url = avatarUrl;
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
    }

    // Reset avatar file
    setAvatarFile(null);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Vui lòng nhập đủ 3 trường để đổi mật khẩu.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Xác nhận mật khẩu không khớp.",
      });
      return;
    }

    // Gửi OTP
    setSendingOTP(true);
    const otpResponse = await sendOTPForChangePassword();
    setSendingOTP(false);

    if (!otpResponse.status) {
      toast.error(otpResponse.message || "Lỗi khi gửi mã OTP");
      return;
    }

    toast.success(otpResponse.message || "Mã OTP đã được gửi đến email của bạn");
    setShowOTPPopup(true);
  };

  const handleOTPSubmit = async () => {
    if (!otpValue || otpValue.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 số");
      return;
    }

    const { currentPassword, newPassword } = passwordForm;
    setChangingPassword(true);

    const data = await ChangePassword(currentPassword, newPassword, otpValue);
    setChangingPassword(false);

    if (!data.status) {
      toast.error(data.message || "Đổi mật khẩu thất bại");
      return;
    }

    toast.success(data.message || "Đổi mật khẩu thành công");

    // Reset form và đóng popup
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setOtpValue("");
    setShowOTPPopup(false);
  };

  const handleCloseOTPPopup = () => {
    setShowOTPPopup(false);
    setOtpValue("");
  };

  // --- 2. GIAO DIỆN MỚI (DỰA TRÊN CODE BẠN VỪA TẠO) ---

  return (
    <DashboardLayout role={layoutRole}>
      <div className="mx-auto max-w-5xl space-y-6">

        {/* --- Header Information Card --- */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
          <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative group">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl text-white backdrop-blur-sm border-2 border-white/30 overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FiEdit2 className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {/* Info Text */}
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{profileForm.email || "Loading..."}</h1>
                  <div className="flex flex-col gap-1 text-indigo-100 md:flex-row md:gap-4">
                    <span className="flex items-center gap-1">
                      <FiShield className="h-4 w-4" /> Vai trò: {profileForm.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                    </span>
                    <span className="hidden md:inline">|</span>
                    <span className="flex items-center gap-1">
                      <FiCreditCard className="h-4 w-4" /> Số dư: {formatCurrency(profileForm.balance)} VND
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex flex-col items-start text-indigo-100 md:items-end">
                <span className="text-sm opacity-80">Tham gia</span>
                <div className="flex items-center gap-2 font-medium text-white">
                  <FiClock /> {formatDateTime(profileForm.join)}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white px-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === "info"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              <FiUser className="h-4 w-4" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === "password"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              <FiShield className="h-4 w-4" />
              Bảo mật
            </button>
            {layoutRole === "student" && (
              <button
                onClick={() => setActiveTab("cheating")}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === "cheating"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                <FiAlertTriangle className="h-4 w-4" />
                Lịch sử gian lận
              </button>
            )}
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          {/* Tab 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === "info" && (
            <div className="animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
                </div>
                <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ảnh đại diện</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FiUser className="h-12 w-12 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        <FiEdit2 className="h-4 w-4" />
                        {avatarFile ? "Đã chọn ảnh mới" : "Chọn ảnh đại diện"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        JPG, PNG hoặc GIF. Tối đa 2MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Email Field (Disabled per UI) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400">Email không thể thay đổi</p>
                  </div>

                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={handleProfileChange("fullName")}
                      placeholder="Nhập họ và tên"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                  </div>



                  {/* Role Field (Static) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Vai trò</label>
                    <input
                      type="text"
                      value={profileForm.role === 'teacher' ? "Giáo viên" : "Học Sinh"}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>



                {/* Feedback Message */}
                {profileFeedback && (
                  <div className={`rounded-lg p-3 text-sm ${profileFeedback.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    }`}>
                    {profileFeedback.message}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingAvatar ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4" />
                        Cập nhật thông tin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: BẢO MẬT / ĐỔI MẬT KHẨU */}
          {activeTab === "password" && (
            <div className="animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
                  <p className="text-sm text-slate-500">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
                <div className="rounded-full bg-slate-100 p-2 text-slate-400">
                  <FiLock className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange("currentPassword")}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange("newPassword")}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Ít nhất 8 ký tự</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange("confirmPassword")}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback Message */}
                {passwordFeedback && (
                  <div className={`rounded-lg p-3 text-sm ${passwordFeedback.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    }`}>
                    {passwordFeedback.message}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={sendingOTP}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOTP ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                        Đang gửi OTP...
                      </>
                    ) : (
                      <>
                        <FiSave className="h-4 w-4" />
                        Gửi OTP
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: LỊCH SỬ GIAN LẬN (chỉ cho student) */}
          {activeTab === "cheating" && layoutRole === "student" && (
            <div className="animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Lịch sử gian lận</h2>
                  <p className="text-sm text-slate-500">
                    Xem tất cả lịch sử gian lận của bạn trong các bài thi
                  </p>
                </div>
                {/* <button
                  onClick={() => navigate("/dashboard/student/cheating-history")}
                  className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                >
                  <FiAlertTriangle className="h-4 w-4" />
                  Xem chi tiết
                </button> */}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                <FiAlertTriangle className="mx-auto mb-3 h-12 w-12 text-amber-600" />
                <h3 className="mb-2 text-lg font-semibold text-amber-900">
                  Lịch sử gian lận
                </h3>
                <p className="mb-4 text-sm text-amber-700">
                  Bạn có thể xem tất cả lịch sử gian lận của mình trong các bài thi đã làm.
                </p>
                <button
                  onClick={() => navigate("/dashboard/student/cheating-history")}
                  className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
                >
                  Xem lịch sử gian lận
                </button>
              </div>
            </div>
          )}
        </div>
        {/* --- 3. Login History Section (MỚI THÊM) --- */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <FiActivity className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800">Lịch sử đăng nhập gần nhất</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Thiết bị</th>
                  <th className="px-6 py-3 font-semibold">Địa chỉ IP</th>
                  <th className="px-6 py-3 font-semibold">Vị trí</th>
                  <th className="px-6 py-3 font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lastLogins && lastLogins.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Cột Thiết bị */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">

                          <FiMonitor />

                        </div>
                        <span className="font-medium text-slate-900">{item.device}</span>
                      </div>
                    </td>

                    {/* Cột IP */}
                    <td className="px-6 py-4 font-mono text-xs">{item.ip_address}</td>

                    {/* Cột Vị trí */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-500">
                        <FiMapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    </td>

                    {/* Cột Thời gian */}
                    <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(item.login_time)}</td>


                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer của bảng (Optional) */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center md:text-right">

          </div>
        </div>
      </div>

      {/* OTP Popup */}
      {showOTPPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Nhập mã OTP</h3>
                <button
                  onClick={handleCloseOTPPopup}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              <p className="mb-4 text-sm text-slate-600">
                Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã OTP 6 số để xác thực đổi mật khẩu.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mã OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpValue(value);
                    }}
                    placeholder="Nhập mã OTP 6 số"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-center text-2xl font-mono tracking-widest text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseOTPPopup}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleOTPSubmit}
                    disabled={changingPassword || otpValue.length !== 6}
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}