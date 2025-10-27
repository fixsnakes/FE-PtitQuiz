import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Lấy thông tin user và loading từ AuthContext
  const location = useLocation();

  console.log("User in ProtectedRoute:", user); // Kiểm tra giá trị của user

  // Nếu đang tải dữ liệu (loading = true), không làm gì và chờ
  if (loading) {
    return null; // Bạn có thể render một spinner hoặc thông báo "Đang tải..."
  }

  // Nếu chưa đăng nhập, chuyển hướng tới trang login
  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return children; // Nếu đã đăng nhập, render trang con
};

export default ProtectedRoute;
