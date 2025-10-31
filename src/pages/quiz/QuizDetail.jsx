import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiClock, FiUser, FiEye , FiMessageCircle, FiHeart, 
  FiBookmark, FiCopy, FiAlertTriangle, FiInfo, 
  FiFileText, FiPlayCircle, FiDownload, FiStar
} from 'react-icons/fi';
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import Navbar from '../../components/Navbar';
// -----------------------------------------------------------------
// GIẢ LẬP DỮ LIỆU JSON CHI TIẾT
// -----------------------------------------------------------------
const MOCK_EXAM_DETAILS = {
  // Key này phải khớp với 'id' từ trang danh sách (ví dụ: /quizz/1)
  "1": { 
    title: "Triết học Mác - Lê Nin",
    author: "Dao Tung Lam",
    date: "05/10/2025",
    thumbnail: "https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg?w=826&t=st=1729880894~exp=1729881494~hmac=62d64917452174c139c898c692021665e317d6c66922b0704d2011703e39b9b0", // Placeholder cho ảnh thumbnail của bạn
    stats: {
      users: 261,
      views: 1723,
      awards: 0,
      comments: 123
    },
    rating: 5.0,
    reviewCount: 5,
    school: "Đại học Kinh doanh và Công nghệ Hà Nội",
    reviews: [
      {
        id: 'r1',
        author: "Tung Lam",
        role: "Thành viên",
        avatar: "https://cdn-icons-png.flaticon.com/512/201/201818.png", // Placeholder
        rating: 5,
        date: "22:51 - 10/10/2025",
        comment: "10 điểm không có nhưng"
      },
      // Thêm các review khác ở đây...
    ]
  },
  // Thêm chi tiết cho các 'id' khác (2, 3, 4, 5, 6...) ở đây
};

// -----------------------------------------------------------------
// COMPONENT PHỤ: HIỂN THỊ SAO (TĨNH)
// -----------------------------------------------------------------
const StaticStarRating = ({ rating, size = "w-5 h-5" }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <FiStar key={`f-${i}`} className={`${size} fill-current`} />
      ))}
      {/* Tạm thời không xử lý half-star, chỉ fill hoặc empty */}
      {[...Array(emptyStars)].map((_, i) => (
        <FiStar key={`e-${i}`} className={size} />
      ))}
    </div>
  );
};

// -----------------------------------------------------------------
// COMPONENT PHỤ: HIỂN THỊ SAO (TƯƠNG TÁC ĐỂ ĐÁNH GIÁ)
// -----------------------------------------------------------------
const InteractiveStarRating = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-7 h-7 cursor-pointer transition-colors
            ${(hoverRating || rating) >= star 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
            }`}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        />
      ))}
    </div>
  );
};


// -----------------------------------------------------------------
// COMPONENT CHÍNH CỦA TRANG
// -----------------------------------------------------------------
export default function ExamDetailPage() {
  const { id } = useParams(); // Lấy 'id' từ URL (ví dụ: /quizz/1)
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState('danh-gia'); // 'danh-gia' là tab active
  
  // State cho form đánh giá của người dùng
  const [myRating, setMyRating] = useState(0);
  const [myReviewText, setMyReviewText] = useState('');

  // 1. Giả lập "fetch" dữ liệu chi tiết
  useEffect(() => {
    // --- BẮT ĐẦU GIẢ LẬP FETCH ---
    const fetchedExam = MOCK_EXAM_DETAILS[id];
    // --- KẾT THÚC GIẢ LẬP FETCH ---
    
    if (fetchedExam) {
      setExam(fetchedExam);
    } else {
      // Xử lý không tìm thấy (ví dụ: quay về trang chủ)
      console.error("Không tìm thấy đề thi với id:", id);
      navigate('/'); // Điều hướng về trang chủ nếu không có dữ liệu
    }
  }, [id, navigate]);

  // Xử lý khi nhấn nút "Bắt đầu ôn thi"
  const handleStartQuiz = () => {
    // Bạn có thể dùng 'id' của exam để điều hướng đến trang làm bài
    // Ví dụ: trang làm bài của chúng ta từ câu trước
    navigate(`/quiz/test/acbdfda`); // Giả sử đây là route làm bài
  };
  
  // Xử lý gửi đánh giá
  const handleSubmitReview = () => {
    if (myRating === 0) {
      alert("Vui lòng chọn số sao để đánh giá.");
      return;
    }
    console.log("ĐÁNH GIÁ ĐÃ GỬI:", { rating: myRating, comment: myReviewText });
    alert("Cảm ơn bạn đã đánh giá!");
    // Reset form
    setMyRating(0);
    setMyReviewText('');
  };

  // Hiển thị loading...
  if (!exam) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải chi tiết đề thi...</div>;
  }

  return (

    <>
        <Navbar></Navbar>
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 mt-15">
        <div className="max-w-7xl mx-auto space-y-5">
            
            {/* === KHỐI 1: THÔNG TIN CHÍNH VÀ CHIA SẺ === */}
            <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cột 1: Ảnh thumbnail */}
                <div className="lg:col-span-1">
                <img 
                    src={exam.thumbnail} 
                    alt={exam.title} 
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                />
                </div>
                
                {/* Cột 2: Thông tin chi tiết */}
                <div className="lg:col-span-1 space-y-3">
                <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
                
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div> {/* Placeholder avatar tác giả */}
                    <span className="font-semibold text-gray-700">{exam.author}</span>
                </div>
                
                <p className="text-sm text-gray-500">
                    <FiClock className="inline mr-1.5" />
                    Cập nhật lần cuối: {exam.date}
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center"><FiUser className="mr-1.5 text-blue-500" /> {exam.stats.users} Lượt làm</div>
                    <div className="flex items-center"><FiMessageCircle className="mr-1.5 text-green-500" /> {exam.stats.comments} Bình luận</div>
                </div>

                {/* Đánh giá */}
                <div className="flex items-center space-x-2">
                    <StaticStarRating rating={exam.rating} />
                    <span className="font-bold text-gray-700">{exam.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({exam.reviewCount} đánh giá)</span>
                </div>
                
                {/* Actions: Like/Bookmark */}
                <div className="flex items-center space-x-4 pt-2">
                    <button className="text-gray-500 hover:text-red-500" title="Yêu thích">
                    <FiHeart className="w-6 h-6" />
                    </button>
                    <button className="text-gray-500 hover:text-blue-500" title="Lưu lại">
                    <FiBookmark className="w-6 h-6" />
                    </button>
                </div>

            
                </div>
                
                {/* Cột 3: Chia sẻ */}
                <div className="lg:col-span-1 h-fit">
                <div className="border border-gray-200 rounded-lg p-4 h-full">
                    <h3 className="font-semibold text-gray-800 mb-3">Chia sẻ đề thi</h3>
                    <div className="flex items-center space-x-3 mb-4">
                    <span className="text-gray-600">hoặc</span>
                    <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"><FaFacebookF /></a>
                    <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800"><FaLinkedinIn /></a>
                    <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"><FaXTwitter /></a>
                    </div>
                    <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
                        <FiCopy />
                        <span>Sao chép link</span>
                    </button>
                    </div>
                </div>
                </div>

            </div>
            </div>



            {/* === KHỐI 3: HÀNH ĐỘNG CHÍNH === */}
            <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button 
                    onClick={handleStartQuiz}
                    className="flex-1 flex items-center justify-center w-full gap-2 p-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FiPlayCircle className="w-5 h-5" />
                    <span>Bắt đầu làm bài thi</span>
                </button>
                </div>
            </div>
            </div>

            {/* === KHỐI 4: NỘI DUNG TAB === */}
            <div className="bg-white rounded-xl shadow-lg">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
                <button
                onClick={() => setActiveTab('danh-gia')}
                className={`px-5 py-4 text-sm font-semibold ${
                    activeTab === 'danh-gia'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Đánh giá
                </button>
                <button
                onClick={() => setActiveTab('ket-qua')}
                className={`px-5 py-4 text-sm font-semibold ${
                    activeTab === 'ket-qua'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Kết quả thi
                </button>
            
            </div>

            {/* Tab Content */}
            <div className="p-6">
            
                {/* --- Tab 2: Đánh giá --- */}
                {activeTab === 'danh-gia' && (
                <div className="space-y-8">
                    {/* 1. Form viết đánh giá */}
                    <div className="border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Đánh giá đề thi</h3>
                    <div className="mb-4">
                        <InteractiveStarRating rating={myRating} setRating={setMyRating} />
                    </div>
                    <textarea
                        value={myReviewText}
                        onChange={(e) => setMyReviewText(e.target.value)}
                        rows="4"
                        placeholder="Nhập nội dung đánh giá của bạn..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                    <div className="flex justify-end mt-3">
                        <button 
                        onClick={handleSubmitReview}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                        >
                        Đánh giá
                        </button>
                    </div>
                    </div>

                    {/* 2. Tóm tắt đánh giá */}
                    <div className="border border-gray-200 rounded-lg p-5">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <div>
                        <h3 className="text-xl font-bold text-gray-800">{exam.rating.toFixed(1)} trên 5</h3>
                        <StaticStarRating rating={exam.rating} />
                        </div>
                        {/* Filter buttons */}
                        <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-full font-medium">Tất cả</button>
                        <button className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">5 sao (0)</button>
                        <button className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">4 sao (0)</button>
                        <button className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">3 sao (0)</button>
                        <button className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">2 sao (0)</button>
                        <button className="px-4 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">1 sao (0)</button>
                        </div>
                    </div>

                    {/* 3. Danh sách review */}
                    <div className="space-y-5 divide-y divide-gray-100">
                        {exam.reviews.map(review => (
                        <div key={review.id} className="flex pt-5">
                            <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full mr-4" />
                            <div className="flex-1">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                                <div>
                                <span className="font-semibold text-gray-800">{review.author}</span>
                                <span className="text-sm text-gray-500 ml-2">({review.role})</span>
                                </div>
                                <StaticStarRating rating={review.rating} size="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{review.date}</p>
                            <p className="text-gray-700">{review.comment}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                )}
                
                {/* --- Tab 3: Kết quả --- */}
                {activeTab === 'ket-qua' && (
                <div>Kết quả ôn tập sẽ được hiển thị ở đây.</div>
                )}
            </div>
            </div>

        </div>
        </div>
    </>

  );
}