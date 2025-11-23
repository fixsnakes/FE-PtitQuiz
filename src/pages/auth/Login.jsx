import React, { useState } from "react";
import left_image from "../../assets/undraw_true-friends_1h3v.png";
import { FaGoogle } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const response = await signin({ email, password });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: response.id,
          fullName: response.fullName,
          email: response.email,
          role: response.role,
        })
      );
      let targetPath;
      if (response.role === "admin" || response.role === "superadmin") {
        targetPath = "/dashboard/admin";
      } else if (response.role === "teacher") {
        targetPath = "/dashboard/teacher";
      } else {
        targetPath = "/dashboard/student";
      }

      setSuccessMessage("Đăng nhập thành công.");
      setTimeout(() => navigate(targetPath, { replace: true }), 500);
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Cột hình minh họa */}
      <div className="hidden md:flex w-1/2 justify-center items-center p-1">
        <img src={left_image} alt="Friends" className="object-cover h-fit w-fit" />
      </div>

      {/* Cột login */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Đăng nhập
          </h1>

          {/* Nút Google */}
          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-linear-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:scale-105 transition-transform"
          >
            <FaGoogle className="w-6 h-6 mr-3" />
            <span>Đăng nhập bằng Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="grow border-gray-300" />
            <span className="mx-4 text-sm text-gray-500">
              hoặc tiếp tục với
            </span>
            <hr className="grow border-gray-300" />
          </div>

          {/* Form đăng nhập */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Tài khoản đăng nhập
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/auth/register"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Đăng ký
              </Link>

              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-bold text-white bg-linear-to-r from-blue-400 to-purple-500 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
