import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaBug, FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthProvider";
import CreateExamModal from "./CreateExamModel";

export default function Navbar() {
  const { user } = useAuth(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- 2. THÊM STATE ĐỂ QUẢN LÝ MODAL

  useEffect(() => {
    if (user != null) {
      setIsLoggedIn(true); 
    } else {
      setIsLoggedIn(false); 
    }
  }, [user]); 

  // Hàm để mở và đóng modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <> {/* <-- 3. BỌC MỌI THỨ TRONG React.Fragment (<>) */}
      <nav className="flex items-center justify-end p-5 bg-white shadow-2xs fixed top-0 left-0 right-0 z-10"> {/* Thêm z-40 để modal (z-50) đè lên */}
        
        {/* ... Code "Bạn chưa đăng nhập" ... */}
        {!isLoggedIn && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
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
        
        {/* ... Code "Đã đăng nhập" ... */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm">
              <FaBug />
              Báo lỗi
            </button>
            <button
              onClick={openModal} // <-- 4. THÊM SỰ KIỆN onClick
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-transform hover:scale-105"
            >
              <FaPlus />
              Tạo đề thi
            </button>
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
      
      {/* 5. HIỂN THỊ MODAL NẾU isModalOpen LÀ TRUE */}
      {isModalOpen && <CreateExamModal onClose={closeModal} />}
    </>
  );
}