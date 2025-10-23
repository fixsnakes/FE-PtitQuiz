import React, { useState } from "react";
import left_image from "../../assets/undraw_true-friends_1h3v.png";
import { FaGoogle } from "react-icons/fa"; 
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="flex min-h-screen flex-col md:flex-row">

        <div className="hidden md:flex w-1/2 justify-center items-center bg-gray-100">
          <img
            src={left_image}
            alt="Friends"
            className="object-cover h-full w-full" 
          />
        </div>

        {/* {Login side} */}
        {/* LỖI 5: Thêm w-full md:w-1/2 để chia đôi layout */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-6 bg-white">
          <div className="w-full max-w-md p-8 space-y-6">
            {" "}
            {/* Bỏ bớt shadow và rounded ở đây nếu nền đã là trắng */}
            <h1 className="text-3xl font-bold text-center text-gray-900">
              Đăng nhập
            </h1>
            {/* Google Login Button */}
            <button className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-transform transform bg-linear-to-r from-blue-500 to-purple-600 rounded-lg shadow-md hover:scale-105">
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
            {/* Login Form */}
            <form className="space-y-6">
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

              <div className="text-right">
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 font-bold text-white bg-linear-to-r from-blue-400 to-purple-500 rounded-lg shadow-md hover:opacity-90 cursor-pointer transition-transform transform hover:scale-105"
              >
                Đăng nhập
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}