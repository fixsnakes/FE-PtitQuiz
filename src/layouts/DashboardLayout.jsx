// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/SideBar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 w-full">
          {/* Chỗ này sẽ render các trang con */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
