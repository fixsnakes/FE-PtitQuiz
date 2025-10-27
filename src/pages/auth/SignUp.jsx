import React, { useEffect, useState } from "react";
import left_image from "../../assets/undraw_fall_zh0m.png";
import { FaGoogle } from "react-icons/fa"; 
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
export default function SignUp() {
      const navigate = useNavigate()
      const [showPassword, setShowPassword] = useState(false);
      const [repeat_password, setRepeat_Password] = useState("");

      const {user,logout} = useAuth()

      useEffect(() => {
          if(user) navigate('/dashboard')
      },[user,navigate])
      
      const HandleLogOut = () =>{
          logout()
          navigate('/auth/login')
      }
      

      return (
        <>
        <button onClick={HandleLogOut}>LogOut</button>
          <div className="flex min-h-screen flex-col md:flex-row">

            <div className="hidden md:flex w-1/2 justify-center items-center p-1">
              <img
                src={left_image}
                alt="Friends"
                className="object-cover h-fit w-fit" 
              />
            </div>

            <div className="flex w-full md:w-1/2 items-center justify-center p-6">
              <div className="w-full max-w-md p-8 space-y-6">
                {" "}
                {/* Bỏ bớt shadow và rounded ở đây nếu nền đã là trắng */}
                <h1 className="text-3xl font-bold text-center text-gray-900">
                  Đăng Ký
                </h1>
              
                
                {/* Login Form */}
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Tài khoản
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


                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nhập lại Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="re_password"
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
                    <Link
                        to="/auth/login"
                        className="text-sm font-medium text-blue-600 hover:underline"
                        >
                        Đăng nhập
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 font-bold text-white bg-linear-to-r from-blue-400 to-purple-500 rounded-lg shadow-md hover:opacity-90 cursor-pointer transition-transform transform hover:scale-105"
                  >
                    Đăng ký
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      );
    }