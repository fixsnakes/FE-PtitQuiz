import React, { useState } from 'react'; // <-- 1. Import useState
import { 
  FiSearch, FiFilter, FiClock, FiUser, 
  FiShare2, FiEdit, FiBarChart2, 
  FiTrash2
} from 'react-icons/fi';
import { BsQuestionCircleFill, BsTrophyFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

// -----------------------------------------------------------------
// 2. DỮ LIỆU GIẢ LẬP ĐÃ CẬP NHẬT VỚI NHIỀU MỤC VÀ TRƯỜNG 'isPublished'
// -----------------------------------------------------------------
const examData = [
  {
    id: 1,
    title: 'Triết học Mác-Lênin (Giữa kỳ)',
    date: '23/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg?w=826&t=st=1729880894~exp=1729881494~hmac=62d64917452174c139c898c692021665e317d6c66922b0704d2011703e39b9b0',
    stats: { questions: 20, students: 150, awards: 5 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 2,
    title: 'Tư Tưởng Hồ Chí Minh (Cuối kỳ)',
    date: '13/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-back-school-background_23-2149486445.jpg?w=826&t=st=1729880922~exp=1729881522~hmac=9e1c4b7875b15a3151978d38c104e7c7a5f6e812542a19b803f29d2b21c43d92',
    stats: { questions: 50, students: 145, awards: 3 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 3,
    title: 'Kinh tế Chính trị (Nháp)',
    date: '10/11/2025',
    image: 'https://img.freepik.com/free-vector/economy-charts-graphs_23-2148564149.jpg?w=826',
    stats: { questions: 5, students: 0, awards: 0 },
    isPublished: false, // <-- Đã thêm
  },
  {
    id: 4,
    title: 'Lịch sử Đảng (Ôn tập)',
    date: '05/10/2025',
    image: 'https://img.freepik.com/free-vector/history-book-doodle_1034-1104.jpg?w=740',
    stats: { questions: 30, students: 90, awards: 1 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 5,
    title: 'Toán cao cấp A1 (Chưa duyệt)',
    date: '20/11/2025',
    image: 'https://img.freepik.com/free-vector/math-background_23-2148146263.jpg?w=826',
    stats: { questions: 15, students: 0, awards: 0 },
    isPublished: false, // <-- Đã thêm
  },
  {
    id: 6,
    title: 'Vật lý Đại cương 1',
    date: '01/10/2025',
    image: 'https://img.freepik.com/free-vector/colorful-physics-elements-background_23-2148385703.jpg?w=826',
    stats: { questions: 40, students: 120, awards: 8 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 7,
    title: 'Triết học Mác-Lênin (Giữa kỳ)',
    date: '23/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg?w=826&t=st=1729880894~exp=1729881494~hmac=62d64917452174c139c898c692021665e317d6c66922b0704d2011703e39b9b0',
    stats: { questions: 20, students: 150, awards: 5 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 8,
    title: 'Tư Tưởng Hồ Chí Minh (Cuối kỳ)',
    date: '13/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-back-school-background_23-2149486445.jpg?w=826&t=st=1729880922~exp=1729881522~hmac=9e1c4b7875b15a3151978d38c104e7c7a5f6e812542a19b803f29d2b21c43d92',
    stats: { questions: 50, students: 145, awards: 3 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 9,
    title: 'Kinh tế Chính trị (Nháp)',
    date: '10/11/2025',
    image: 'https://img.freepik.com/free-vector/economy-charts-graphs_23-2148564149.jpg?w=826',
    stats: { questions: 5, students: 0, awards: 0 },
    isPublished: false, // <-- Đã thêm
  },
  {
    id: 10,
    title: 'Lịch sử Đảng (Ôn tập)',
    date: '05/10/2025',
    image: 'https://img.freepik.com/free-vector/history-book-doodle_1034-1104.jpg?w=740',
    stats: { questions: 30, students: 90, awards: 1 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 11,
    title: 'Toán cao cấp A1 (Chưa duyệt)',
    date: '20/11/2025',
    image: 'https://img.freepik.com/free-vector/math-background_23-2148146263.jpg?w=826',
    stats: { questions: 15, students: 0, awards: 0 },
    isPublished: false, // <-- Đã thêm
  },
  {
    id: 12,
    title: 'Vật lý Đại cương 1',
    date: '01/10/2025',
    image: 'https://img.freepik.com/free-vector/colorful-physics-elements-background_23-2148385703.jpg?w=826',
    stats: { questions: 40, students: 120, awards: 8 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 13,
    title: 'Triết học Mác-Lênin (Giữa kỳ)',
    date: '23/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg?w=826&t=st=1729880894~exp=1729881494~hmac=62d64917452174c139c898c692021665e317d6c66922b0704d2011703e39b9b0',
    stats: { questions: 20, students: 150, awards: 5 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 14,
    title: 'Tư Tưởng Hồ Chí Minh (Cuối kỳ)',
    date: '13/10/2025',
    image: 'https://img.freepik.com/free-vector/hand-drawn-back-school-background_23-2149486445.jpg?w=826&t=st=1729880922~exp=1729881522~hmac=9e1c4b7875b15a3151978d38c104e7c7a5f6e812542a19b803f29d2b21c43d92',
    stats: { questions: 50, students: 145, awards: 3 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 15,
    title: 'Kinh tế Chính trị (Nháp)',
    date: '10/11/2025',
    image: 'https://img.freepik.com/free-vector/economy-charts-graphs_23-2148564149.jpg?w=826',
    stats: { questions: 5, students: 0, awards: 0 },
    isPublished: false, // <-- Đã thêm
  },
  {
    id: 16,
    title: 'Lịch sử Đảng (Ôn tập)',
    date: '05/10/2025',
    image: 'https://img.freepik.com/free-vector/history-book-doodle_1034-1104.jpg?w=740',
    stats: { questions: 30, students: 90, awards: 1 },
    isPublished: true, // <-- Đã thêm
  },
  {
    id: 17,
    title: 'Toán cao cấp A1 (Chưa duyệt)',
    date: '20/11/2025',
    image: 'https://img.freepik.com/free-vector/math-background_23-2148146263.jpg?w=826',
    stats: { questions: 15, students: 0, awards: 0 },
    isPublished: false, // <-- Đã thêm
  },
  {
    id: 18,
    title: 'Vật lý Đại cương 1',
    date: '01/10/2025',
    image: 'https://img.freepik.com/free-vector/colorful-physics-elements-background_23-2148385703.jpg?w=826',
    stats: { questions: 40, students: 120, awards: 8 },
    isPublished: true, // <-- Đã thêm
  },
];

// -----------------------------------------------------------------
// 3. COMPONENT EXAMCARD ĐÃ CẬP NHẬT
// -----------------------------------------------------------------
const ExamCard = ({ id,title, date, image, stats, isPublished }) => { // <-- Thêm prop 'isPublished'
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:scale-105 hover:cursor-pointer">


      <Link to={`/quiz/${id}`}>
          <img src={image} alt={title} className="w-full h-40 object-cover" />
      </Link>
      
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
        
        <div className="flex items-center text-gray-500 text-sm mt-1">
          <FiClock className="mr-1.5" />
          <span>{date}</span>
        </div>
        
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <div className="flex items-center text-yellow-500">
            <BsQuestionCircleFill className="mr-1" />
            <span className="font-medium">{stats.questions}</span>
          </div>
          <div className="flex items-center text-blue-500">
            <FiUser className="mr-1" />
            <span className="font-medium">{stats.students}</span>
          </div>

        </div>
        
        <hr className="my-3 border-gray-200" />

        {/* Các nút icon hành động */}
        <div className="flex items-center space-x-3 text-gray-600">
          <FiShare2 className="cursor-pointer hover:text-blue-600" title="Chia sẻ" />
          <FiBarChart2 className="text-blue-500 cursor-pointer hover:text-blue-600" title="Thống kê" />
          <FiTrash2 className="text-red-500 cursor-pointer hover:text-red-600" title="Xóa" />
          <FiEdit className="text-green-500 cursor-pointer hover:text-green-600" title="Chỉnh sửa" />
        </div>
        
        {/* ------------------------------------------------- */}
        {/* 4. THAY THẾ NÚT "GIAO BÀI" BẰNG TRẠNG THÁI        */}
        {/* ------------------------------------------------- */}
        <div className="flex justify-start mt-4">
          {isPublished ? (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
              Đã xuất bản
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
              Chưa xuất bản
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


/**
 * Component trang chính chứa danh sách đề thi
 */
export default function ExamListPage() {
  // 5. Thêm State để quản lý Tab
 const [activeTab, setActiveTab] = useState('published');
  // -----------------------------------------------------------------
  // 2. THÊM STATE CHO TÌM KIẾM
  // -----------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc danh sách đề thi dựa trên tab (giữ nguyên)
  const publishedExams = examData.filter(exam => exam.isPublished);
  const draftExams = examData.filter(exam => !exam.isPublished);

  // Quyết định danh sách NỀN TẢNG (base) dựa trên tab
  const baseList = activeTab === 'published' ? publishedExams : draftExams;

  // -----------------------------------------------------------------
  // 3. LỌC TIẾP DANH SÁCH NỀN TẢNG DỰA TRÊN TÌM KIẾM
  // -----------------------------------------------------------------
  const examsToDisplay = baseList.filter(exam => 
    // Chuyển cả tiêu đề và nội dung tìm kiếm về chữ thường để tìm kiếm không phân biệt hoa/thường
    exam.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen w-full bg-gray-100 p-10 md:p-8 mt-20">
      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-6">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Danh sách đề thi
        </h1>
        
        {/* ------------------------------------------------- */}
        {/* 7. GIAO DIỆN CÁC TAB ĐÃ THÊM                     */}
        {/* ------------------------------------------------- */}
        <div className="flex border-b border-gray-200 mb-5">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === 'published'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã xuất bản ({publishedExams.length})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === 'draft'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chưa xuất bản ({draftExams.length})
          </button>
        </div>

        {/* Thanh công cụ (Tìm kiếm và Filter) */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-3 md:space-y-0">
          <div className="flex items-center space-x-2">
            {/* 8. Cập nhật số lượng đề thi theo tab */}
            <span className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 text-sm font-bold rounded-full">
              {examsToDisplay.length}
            </span>
            <span className="text-lg font-semibold text-gray-700">Đề thi</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <FiFilter className="text-xl" />
            </button>
          </div>
        </div>
        
        {/* Lưới chứa các thẻ đề thi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* 9. Render danh sách đã lọc */}
          {examsToDisplay.map((exam) => (
            <ExamCard
              key={exam.id}
              id = {exam.id}
              title={exam.title}
              date={exam.date}
              image={exam.image}
              stats={exam.stats}
              isPublished={exam.isPublished} // <-- Truyền prop mới
            />
          ))}
        </div>
        
        {/* Xử lý trường hợp không có đề thi nào trong tab */}
        {examsToDisplay.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Không có đề thi nào trong mục này.
          </div>
        )}
        
      </div>
    </div>
  );
}