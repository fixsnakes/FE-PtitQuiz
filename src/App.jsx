import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Navbar from "./components/Navbar";
function App() {
  return (
    <>
        <Navbar />
        <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<SignUp />} />
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={<h1 className="text-center mt-10 text-red-500">404 - Trang không tồn tại</h1>} />
        </Routes>

    </>
  );
}

export default App;
