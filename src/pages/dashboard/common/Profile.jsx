import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
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
} from "react-icons/fi";


import { 
  // ... các icon cũ
  FiActivity, 
  FiSmartphone, 
  FiMonitor, 
  FiMapPin 
} from "react-icons/fi";

// Dữ liệu giả lập lịch sử đăng nhập
const LOGIN_HISTORY = [
  {
    id: 1,
    device: "Windows 10 - Chrome",
    ip: "14.162.12.23",
    location: "Hanoi, Vietnam",
    time: "15:30 19/11/2025",
    status: "success", // success | failed
  },
  {
    id: 2,
    device: "iPhone 13 - Safari",
    ip: "113.22.19.10",
    location: "Hanoi, Vietnam",
    time: "08:15 18/11/2025",
    status: "success",
  },
  {
    id: 3,
    device: "Unknown Device",
    ip: "42.115.33.12",
    location: "Ho Chi Minh, Vietnam",
    time: "22:45 15/11/2025",
    status: "warning", // Cảnh báo đăng nhập lạ
  },
];
export default function Profile() {
  // --- 1. STATE & LOGIC CŨ (GIỮ NGUYÊN) ---
  const [activeTab, setActiveTab] = useState("info");
  const [currentUser, setCurrentUser] = useState(null);
  
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    role: "", // Thêm field này cho khớp UI mới (tùy chọn)
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // State mới để xử lý ẩn/hiện mật khẩu (UI)
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem("currentUser");
    if (!rawUser) {
      return;
    }
    try {
      const parsedUser = JSON.parse(rawUser);
      setCurrentUser(parsedUser);
      setProfileForm({
        fullName: parsedUser.fullName || "",
        email: parsedUser.email || "",
        role: parsedUser.role || "", 
   
      });
    } catch (error) {
        console.error("Không thể đọc thông tin người dùng:", error);
    }
  }, []);

  const layoutRole = useMemo(() => currentUser?.role || "student", [currentUser]);

  const handleProfileChange = (field) => (event) => {
    const value = event.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileFeedback(null);
  };

  const handlePasswordChange = (field) => (event) => {
    const value = event.target.value;
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordFeedback(null);
  };

  const handleProfileSubmit = (event) => {
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

    // Logic lưu cũ...
    const updatedUser = {
      ...currentUser,
      fullName: trimmedName,
      email: trimmedEmail,
      // Lưu thêm các trường mới nếu muốn
      phone: profileForm.phone,
      bio: profileForm.bio,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setProfileFeedback({
      type: "success",
      message: "Đã cập nhật thông tin cá nhân thành công.",
    });
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Vui lòng nhập đủ 3 trường để đổi mật khẩu.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
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

    setPasswordFeedback({
      type: "success",
      message: "Mật khẩu đã được cập nhật (Giả lập).",
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // --- 2. GIAO DIỆN MỚI (DỰA TRÊN CODE BẠN VỪA TẠO) ---

  return (
    <DashboardLayout role={layoutRole}>
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* --- Header Information Card --- */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
          <div className="relative bg-linear-to-r from-blue-500 to-purple-600 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl text-white backdrop-blur-sm border-2 border-white/30">
                  <FiUser />
                </div>
                {/* Info Text */}
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{profileForm.email || "Loading..."}</h1>
                  <div className="flex flex-col gap-1 text-blue-100 md:flex-row md:gap-4">
                    <span className="flex items-center gap-1">
                      <FiShield className="h-4 w-4" /> Vai trò: {profileForm.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                    </span>
                    <span className="hidden md:inline">|</span>
                    <span className="flex items-center gap-1">
                      <FiCreditCard className="h-4 w-4" /> Số dư: 0 VND
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="flex flex-col items-start text-blue-100 md:items-end">
                <span className="text-sm opacity-80">Tham gia</span>
                <div className="flex items-center gap-2 font-medium text-white">
                  <FiClock /> lúc 15:44 19 tháng 11, 2025
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white px-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FiUser className="h-4 w-4" />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                activeTab === "password"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FiShield className="h-4 w-4" />
              Bảo mật
            </button>
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
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
                  <div className={`rounded-lg p-3 text-sm ${
                    profileFeedback.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  }`}>
                    {profileFeedback.message}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                  >
                    <FiSave className="h-4 w-4" />
                    Cập nhật thông tin
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
                    <FiLock className="h-5 w-5"/>
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
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
                  <div className={`rounded-lg p-3 text-sm ${
                    passwordFeedback.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  }`}>
                    {passwordFeedback.message}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                  >
                    <FiSave className="h-4 w-4" />
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
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
                  <th className="px-6 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {LOGIN_HISTORY.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Cột Thiết bị */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          {item.device.toLowerCase().includes("iphone") || item.device.toLowerCase().includes("android") ? (
                            <FiSmartphone />
                          ) : (
                            <FiMonitor />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{item.device}</span>
                      </div>
                    </td>

                    {/* Cột IP */}
                    <td className="px-6 py-4 font-mono text-xs">{item.ip}</td>

                    {/* Cột Vị trí */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-500">
                        <FiMapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                    </td>

                    {/* Cột Thời gian */}
                    <td className="px-6 py-4 whitespace-nowrap">{item.time}</td>

                    {/* Cột Trạng thái */}
                    <td className="px-6 py-4">
                      {item.status === "success" ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Thành công
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                          Bất thường
                        </span>
                      )}
                    </td>
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
    </DashboardLayout>
  );
}