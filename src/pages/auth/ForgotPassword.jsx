import React, { useState } from "react";
import left_image from "../../assets/undraw_online-meeting_qe61.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { sendOTPForForgotPassword, resetPassword } from "../../services/authService";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [step, setStep] = useState(1); // 1: Gửi OTP, 2: Đặt lại mật khẩu

    const handleSendOTP = async (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!email.trim()) {
            setError("Vui lòng nhập email.");
            return;
        }

        setSendingOTP(true);
        try {
            await sendOTPForForgotPassword({ email: email.trim() });
            setSuccessMessage("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
            setStep(2);
        } catch (apiError) {
            const message =
                apiError.body?.message ||
                apiError.message ||
                "Gửi OTP thất bại. Vui lòng thử lại.";
            setError(message);
        } finally {
            setSendingOTP(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!otp || otp.length !== 6) {
            setError("Vui lòng nhập mã OTP 6 chữ số.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu nhập lại không trùng khớp.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({
                email: email.trim(),
                otp: otp,
                newPassword: newPassword,
            });
            setSuccessMessage("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
            setTimeout(() => navigate("/auth/login"), 1500);
        } catch (apiError) {
            const message =
                apiError.body?.message ||
                apiError.message ||
                "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccessMessage("");
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <div className="hidden md:flex w-1/2 justify-center items-center p-1">
                <img
                    src={left_image}
                    alt="Forgot Password"
                    className="object-cover h-fit w-fit"
                />
            </div>

            <div className="flex w-full md:w-1/2 items-center justify-center p-6">
                <div className="w-full max-w-md p-8 space-y-6">
                    <h1 className="text-3xl font-bold text-center text-gray-900">
                        {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                    </h1>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Chúng tôi sẽ gửi mã OTP đến email của bạn để xác thực.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                {error && (
                                    <p className="text-sm text-red-500" role="alert">
                                        {error}
                                    </p>
                                )}
                                {successMessage && (
                                    <p className="text-sm text-green-600" role="status">
                                        {successMessage}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    to="/auth/login"
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                    Quay lại đăng nhập
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={sendingOTP}
                                className="w-full px-4 py-3 font-bold text-white bg-[#432DD7] rounded-lg shadow-md hover:bg-[#3a26c0] transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {sendingOTP ? "Đang gửi OTP..." : "Gửi mã OTP"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Mã OTP đã được gửi đến email: <strong>{email}</strong>
                                </p>
                                <p className="text-xs text-gray-500 mb-6">
                                    Vui lòng kiểm tra hộp thư và nhập mã OTP 6 chữ số
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="otp"
                                    className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                    Mã OTP
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Nhập mã OTP 6 chữ số"
                                    maxLength={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block mb-2 text-sm font-medium text-gray-700"
                                >
                                    Nhập lại mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {error && (
                                    <p className="text-sm text-red-500" role="alert">
                                        {error}
                                    </p>
                                )}
                                {successMessage && (
                                    <p className="text-sm text-green-600" role="status">
                                        {successMessage}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleBackToStep1}
                                    className="flex-1 px-4 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 transition-transform transform hover:scale-105"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 font-bold text-white bg-[#432DD7] rounded-lg shadow-md hover:bg-[#3a26c0] transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

