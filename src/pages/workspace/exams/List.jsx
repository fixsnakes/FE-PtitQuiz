import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiClock, FiUser, 
  FiShare2, FiSettings, FiHelpCircle, FiEdit, 
  FiBarChart2, FiEdit3, FiTrash2, FiArrowRight 
} from 'react-icons/fi';
import { BsQuestionCircleFill } from 'react-icons/bs';

import { BsTrophyFill } from 'react-icons/bs';

// Dữ liệu giả lập ban đầu cho các thẻ đề thi
const initialExamData = [
  {
    id: 1,
    title: 'Triết học',
    date: '23/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg?w=826&t=st=1729880894~exp=1729881494~hmac=62d64917452174c139c898c692021665e317d6c66922b0704d2011703e39b9b0', // Thay bằng ảnh của bạn
    stats: {
      questions: 2,
      students: 0,
      awards: 0,
    },
  },
  {
    id: 2,
    title: 'Tư Tưởng Hồ Chí Minh',
    date: '13/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-back-school-background_23-2149486445.jpg?w=826&t=st=1729880922~exp=1729881522~hmac=9e1c4b7875b15a3151978d38c104e7c7a5f6e812542a19b803f29d2b21c43d92', // Thay bằng ảnh của bạn
    stats: {
      questions: 2,
      students: 0,
      awards: 0,
    },
  },
  // Thêm các đề thi khác nếu muốn
];

/**
 * Component Card cho từng đề thi
 */
const ExamCard = ({ id, title, date, image, stats, isCreated = false }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (isCreated) {
      // Navigate to edit page for user-created exams
      navigate(`/workspace/exams/edit/${id}`);
    } else {
      // For mock exams, show alert or navigate to create new
      alert('Đây là đề thi mẫu. Bạn có thể tạo đề thi mới từ menu.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      {/* Hình ảnh */}
      <img src={image} alt={title} className="w-full h-40 object-cover" />
      
      <div className="p-4">
        {/* Tiêu đề */}
        <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
        
        {/* Ngày tháng */}
        <div className="flex items-center text-gray-500 text-sm mt-1">
          <FiClock className="mr-1.5" />
          <span>{date}</span>
        </div>
        
        {/* Thống kê */}
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <div className="flex items-center text-yellow-500">
            <BsQuestionCircleFill className="mr-1" />
            <span className="font-medium">{stats.questions}</span>
          </div>
          <div className="flex items-center text-blue-500">
            <FiUser className="mr-1" />
            <span className="font-medium">{stats.students}</span>
          </div>
          <div className="flex items-center text-green-500">
            <BsTrophyFill className="mr-1" />
            <span className="font-medium">{stats.awards}</span>
          </div>
        </div>
        

        
        <hr className="my-3 border-gray-200" />


        <div className="flex items-center space-x-3 text-gray-600">
        <FiShare2 className="cursor-pointer hover:text-blue-600" title="Chia sẻ" />
          <FiBarChart2 className="text-blue-500 cursor-pointer hover:text-blue-600" title="Thống kê" />
          <FiTrash2 className="text-red-500 cursor-pointer hover:text-red-600" title="Xóa" />
          <FiEdit 
            className="text-green-500 cursor-pointer hover:text-green-600" 
            title="Chỉnh sửa"
            onClick={handleEdit}
          />
        </div>
        
        {/* Các nút bấm chính */}
        <div className="flex space-x-2 mt-4">
          {/* <button className="flex-1 flex items-center justify-center bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Vào ôn thi
            <FiArrowRight className="ml-1" />
          </button> */}
          <button className="flex-1 flex items-center justify-center bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Giao bài tập
            <FiArrowRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component trang chính chứa danh sách đề thi
 */
export default function ExamListPage() {
  const [examData, setExamData] = useState(initialExamData);

  // Load exams from localStorage when component mounts
  useEffect(() => {
    const loadExamsFromStorage = () => {
      const createdExams = [];
      
      // Iterate through localStorage to find exam data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('exam_')) {
          try {
            const examData = JSON.parse(localStorage.getItem(key));
            const examId = key.replace('exam_', '');
            
            // Create exam object for display
            const exam = {
              id: parseInt(examId),
              title: examData.title || 'Đề thi không có tên',
              date: new Date().toLocaleDateString('vi-VN'),
              image: 'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg?w=826&t=st=1729880894~exp=1729881494~hmac=62d64917452174c139c898c692021665e317d6c66922b0704d2011703e39b9b0',
              stats: {
                questions: 0, // Will be updated when questions are added
                students: 0,
                awards: 0,
              },
              subject: examData.subject,
              description: examData.description,
              isCreated: true // Flag to identify user-created exams
            };
            
            createdExams.push(exam);
          } catch (error) {
            console.error('Error loading exam from localStorage:', error);
          }
        }
      }
      
      // Combine initial mock data with created exams
      setExamData([...createdExams, ...initialExamData]);
    };

    loadExamsFromStorage();

    // Listen for window focus to refresh the list (when user comes back from creating exam)
    const handleWindowFocus = () => {
      loadExamsFromStorage();
    };

    window.addEventListener('focus', handleWindowFocus);

    // Cleanup event listener
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  return (
    // Nền xám cho cả trang
    <div className="min-h-screen w-full bg-gray-100 p-10 md:p-8 mt-20">
      {/* Container chính màu trắng */}
      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-6">
        
        {/* Tiêu đề trang */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Danh sách đề thi
        </h1>
        
        {/* Thanh công cụ (Tìm kiếm và Filter) */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-3 md:space-y-0">
          {/* Phần bên trái */}
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 text-sm font-bold rounded-full">
              {examData.length}
            </span>
            <span className="text-lg font-semibold text-gray-700">Đề thi</span>
          </div>
          
          {/* Phần bên phải */}
          <div className="flex items-center space-x-3">
            {/* Ô tìm kiếm */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Nút Lọc */}
            <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <FiFilter className="text-xl" />
            </button>
          </div>
        </div>
        
        {/* Lưới chứa các thẻ đề thi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {examData.map((exam) => (
            <ExamCard
              key={exam.id}
              id={exam.id}
              title={exam.title}
              date={exam.date}
              image={exam.image}
              stats={exam.stats}
              isCreated={exam.isCreated}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
}