// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { FaGraduationCap, FaBug, FaPlus } from "react-icons/fa";
import { BiTask } from "react-icons/bi";
import { PiStudentBold } from "react-icons/pi";
import { CiSettings } from "react-icons/ci";

import { Link } from "react-router-dom";
function Sidebar() {
  const { user } = useAuth();

  // Mục menu cho học sinh
  const studentMenu = [
    { path: "/dashboard", label: "Thư viện của tôi", icon: "📚" },
    { path: "/recent", label: "Truy cập gần đây", icon: "🕒" },
    { path: "/favorites", label: "Đề thi yêu thích", icon: "❤️" },
    { path: "/results", label: "Kết quả thi của tôi", icon: "📊" },
    { path: "/ranking", label: "BXH thi đua", icon: "🔥" },
  ];

  // Mục menu cho giáo viên
  const teacherMenu = [
    { path: "/workspace/exams/list", label: "Quản lý đề thi", icon: <BiTask></BiTask> },
    { path: "/workspace/class", label: "Quản Lý Lớp", icon: <PiStudentBold></PiStudentBold> },
    { path: "/settings", label: "Cài đặt", icon: <CiSettings></CiSettings> },
  ];

  // Dựa vào role, chọn menu tương ứng
  const renderMenu = user?.role === "teacher" ? teacherMenu : studentMenu;

  return (
    <div className="w-72 min-h-screen bg-white shadow-md flex-row p-3 justify-center items-center border-r border-gray-100 fixed top-0 z-11">
      <div className="flex justify-center items-center gap-2 mb-20 mt-1">
        <FaGraduationCap className="text-blue-600 text-5xl" />
        <Link to="/" className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          PTIT Quiz
        </Link>
      </div>

      <nav className="space-y-2">
        {renderMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg font-semibold text-lg ${
                isActive ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100"
              }`
            }
          >
            <span>{item.icon}</span> {item.label}
          </NavLink>
        ))}
      </nav>

    
    </div>
  );
}

export default Sidebar;
