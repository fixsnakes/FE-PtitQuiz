// App.js (hoặc file component chính của bạn)
import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiX } from 'react-icons/fi'; // Import các icon cần thiết

import DashboardLayout from '../../../layouts/DashboardLayout';
// ==============================
// 1. DỮ LIỆU MẪU (DUMMY DATA)
// ==============================
const mockClasses = [
  { id: 1, name: 'Nhập môn Lập trình Web', code: 'INT3306 1', date: '20/10/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 2, name: 'Toán rời rạc', code: 'MAT102 5', date: '15/10/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 3, name: 'Cấu trúc dữ liệu & GT', code: 'INT2201 3', date: '01/11/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 4, name: 'Trí tuệ nhân tạo cơ bản', code: 'INT3401 2', date: '25/10/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 5, name: 'Hệ điều hành', code: 'INT2204 1', date: '20/09/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 6, name: 'Mạng máy tính', code: 'INT2209 4', date: '10/10/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 7, name: 'Phát triển ứng dụng Mobile', code: 'INT3314 2', date: '12/11/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 8, name: 'Cơ sở dữ liệu', code: 'INT2203 7', date: '05/10/2023', image: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

// ==============================
// 2. COMPONENTS CON
// ==============================

// Component thẻ lớp học đơn lẻ
const ClassCard = ({ classInfo }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Ảnh lớp học */}
      <div className="h-40 overflow-hidden relative">
        <img 
          src={classInfo.image} 
          alt={classInfo.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      
      {/* Thông tin lớp học */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 line-clamp-2">
            {classInfo.name}
          </h3>
          {/* Mã lớp nằm bên dưới */}
          <p className="text-sm text-blue-600 font-medium mb-4">
            Mã lớp: {classInfo.code}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
           <span>Ngày tham gia:</span>
           <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
             {classInfo.date}
           </span>
        </div>
      </div>
    </div>
  );
};

// Component Modal tham gia lớp (Giao diện ảnh 2)
const JoinClassModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Overlay nền m
        

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      {/* Container Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-fade-in-up">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Tham gia lớp học mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
            <FiX size={24} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">
              Nhập mã lớp
            </label>
            <div className="relative">
              <input
                type="text"
                id="classCode"
                placeholder="Ví dụ: INT3306"
                className="block w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Hãy hỏi giáo viên của bạn để biết mã lớp học.
            </p>
          </div>
        </div>

        {/* Footer Modal với nút Tham gia */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg flex items-center"
          >
            <FiPlus className="mr-2" /> Tham gia ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// ==============================
// 3. COMPONENT CHÍNH (LAYOUT)
// ==============================
function StudentClasses() {
  // State để điều khiển trạng thái mở/đóng của modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    // Nền tổng thể màu xám rất nhạt để làm nổi bật các thẻ trắng
    <DashboardLayout>
        <div className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                
                {/* --- Header Section --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                
                {/* Khu vực Tìm kiếm và Filter */}
                <div className="flex items-center gap-3 flex-grow max-w-2xl">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" size={20} />
                        </div>
                        <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                        placeholder="Tìm kiếm lớp học của bạn..."
                        />
                    </div>
                    <button className="p-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm flex-shrink-0">
                    <FiFilter size={20} />
                    </button>
                </div>

                {/* Nút Tham gia (Kích hoạt Modal) */}
                <div className="flex-shrink-0">
                    <button 
                    onClick={openModal}
                    className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                    <FiPlus className="mr-2 h-5 w-5" />
                    Tham gia lớp học
                    </button>
                </div>
                </header>

                {/* --- Grid Section (Danh sách lớp) --- */}
                <main>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mockClasses.map((classItem) => (
                    <ClassCard key={classItem.id} classInfo={classItem} />
                    ))}
                </div>
                </main>

                {/* --- Modal Component (Hiển thị khi state isModalOpen = true) --- */}
                <JoinClassModal isOpen={isModalOpen} onClose={closeModal} />
                
            </div>
        </div>
    </DashboardLayout>
  );
}

export default StudentClasses;