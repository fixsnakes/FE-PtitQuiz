import React from 'react';
import { FiX, FiZap, FiFileText, FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom'; // <-- 1. Import Link

// <-- 2. Thêm 'to' và 'onClick' vào props
const OptionCard = ({ title, description, icon: Icon, to, onClick }) => (
  // <-- 3. Thay thế 'div' bằng 'Link' và thêm props
  <Link 
    to={to}
    onClick={onClick}
    className="flex-1 p-6 text-center bg-white rounded-xl border border-gray-200 
               hover:border-indigo-400 hover:shadow-lg transition-all duration-300 
               cursor-pointer transform hover:-translate-y-1" 
  >
    <div className="flex justify-center items-center h-24 mb-4">
      <Icon className="w-16 h-16 text-indigo-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </Link>
);

export default function CreateExamModal({ onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-gray-100/80 flex justify-center items-center z-50"
      onClick={onClose} 
    >
      <div 
        className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full mx-4 relative"
        onClick={e => e.stopPropagation()} 
      >
        {/* Nút đóng (X) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Đóng"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        {/* Tiêu đề Modal */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Tạo đề thi mới
        </h2>
        
        {/* 3 Lựa chọn */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* <-- 4. Thêm props 'to' và 'onClick' cho mỗi Card --> */}
          <OptionCard 
            to="/createai"
            onClick={onClose}
            icon={FiZap} // Icon cho AI
            title="Trợ lý AI"
            description="Tạo đề thi nhanh hơn với trợ lý AI"
          />
          <OptionCard 
            to="/workspace/exams/create-with-text"
            onClick={onClose}
            icon={FiFileText} // Icon cho Văn bản
            title="Văn bản"
            description="Tạo đề thi nhanh bằng cách soạn thảo văn bản"
          />
          <OptionCard 
            to="/workspace/exams/new"
            onClick={onClose}
            icon={FiEdit} // Icon cho Trình soạn thảo
            title="Trình soạn thảo"
            description="Tạo đề thi từ đầu và chỉnh sửa thủ công"
          />
        </div>
      </div>
    </div>
  );
}