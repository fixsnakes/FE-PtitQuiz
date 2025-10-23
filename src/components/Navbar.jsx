import { Link } from "react-router-dom";
import { FaGraduationCap, FaExpandAlt, FaBug, FaPlus } from "react-icons/fa";
import { useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <nav className="flex items-center justify-between p-5 bg-gray-50 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <FaGraduationCap className="text-blue-600 text-2xl" />
        <Link to="/" className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          PTIT Quiz
        </Link>
      </div>

      {/* Nếu chưa đăng nhập */}
      {!isLoggedIn && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <FaExpandAlt className="text-blue-600" />
            <span>Bạn chưa đăng nhập</span>
          </div>
          <Link
            to="/auth/login"
            className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Nếu đã đăng nhập */}
      {isLoggedIn && (
        <div className="flex items-center gap-4">
          {/* Nút báo lỗi */}
          <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm">
            <FaBug />
            Báo lỗi
          </button>

          {/* Nút tạo đề thi */}
          <Link
            to="/admin/create-quiz"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-transform hover:scale-105"
          >
            <FaPlus />
            Tạo đề thi
          </Link>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 cursor-pointer hover:scale-105 transition-transform">
            <img
              src="https://cdn-icons-png.flaticon.com/512/201/201818.png"
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
