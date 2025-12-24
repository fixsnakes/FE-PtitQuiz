import React, { useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getStudentExamDetail, getSimilarExams } from "../../../services/studentExamService";
import { addFavorite, removeFavorite, checkFavorite } from "../../../services/examFavoriteService";
import {
  Clock,
  Eye,
  Star,
  Heart,
  Facebook,
  Linkedin,
  X,
  Copy,
  ArrowLeft,
  Play,
  BookOpen,
} from "lucide-react";

export default function ExamDetail() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [similarExams, setSimilarExams] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffectOnce(() => {
    loadExamDetail();
  }, [examId]);

  const loadExamDetail = async () => {
    try {
      setLoading(true);
      const response = await getStudentExamDetail(examId);
      const examData = Array.isArray(response) ? response[0] : (response?.data || response);
      setExam(examData);
      
      // Check if exam is favorited
      if (examData) {
        try {
          const favoriteResponse = await checkFavorite(examId);
          // API trả về { is_favorited: true/false }
          const responseData = Array.isArray(favoriteResponse) ? favoriteResponse[0] : (favoriteResponse?.data || favoriteResponse);
          setIsFavorited(responseData?.is_favorited || false);
        } catch (error) {
          console.error("Error checking favorite:", error);
          // Không hiển thị lỗi nếu không check được favorite
          setIsFavorited(false);
        }
        
        // Load similar exams
        loadSimilarExams(examData);
      }
    } catch (error) {
      console.error("Error loading exam detail:", error);
      toast.error(error.message || "Không thể tải thông tin đề thi");
      navigate("/dashboard/student");
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarExams = async (currentExam) => {
    try {
      const response = await getSimilarExams(examId, { limit: 6 });
      const examsData = Array.isArray(response) ? response : (response?.data || []);
      setSimilarExams(examsData);
    } catch (error) {
      console.error("Error loading similar exams:", error);
      // Không hiển thị lỗi nếu không load được bài thi tương tự
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleFavorite = async () => {
    try {
      if (isFavorited) {
        // Remove from favorites
        await removeFavorite(examId);
        setIsFavorited(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        // Add to favorites
        await addFavorite(examId);
        setIsFavorited(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Không thể cập nhật yêu thích");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/dashboard/student/exams/${examId}`;
    navigator.clipboard.writeText(link);
    toast.success("Đã sao chép link!");
  };

  const handleShare = (platform) => {
    const link = `${window.location.origin}/dashboard/student/exams/${examId}`;
    const title = exam?.title || "Đề thi";
    const text = `Xem đề thi: ${title}`;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleStartExam = () => {
    navigate(`/student/exams/${examId}/take`);
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="text-slate-600">Đang tải thông tin đề thi...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-slate-600">Không tìm thấy đề thi</p>
            <button
              onClick={() => navigate("/dashboard/student")}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white"
            >
              Quay lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard/student")}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </button>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Panel - Exam Visual */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* Exam Image or Default Icon */}
                {exam.image_url ? (
                  <div className="mb-4 h-48 w-full overflow-hidden rounded-2xl">
                    <img
                      src={exam.image_url.startsWith('http') ? exam.image_url : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"}${exam.image_url}`}
                      alt={exam.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden h-48 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                      <div className="relative">
                        <span className="text-4xl">📚</span>
                        <span className="absolute -right-2 -top-2 text-2xl">🧠</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <div className="relative">
                      <span className="text-4xl">📚</span>
                      <span className="absolute -right-2 -top-2 text-2xl">🧠</span>
                    </div>
                  </div>
                )}
                
                {/* School name */}
                <p className="mb-2 text-sm font-medium text-slate-600">
                  {exam.class?.className || "Đề thi công khai"}
                </p>
                
                {/* Exam code/title highlight */}
                <div className="mb-2">
                  <h2 className="text-3xl font-bold text-red-600">
                    {exam.title?.split(' ')[0] || 'EXAM'}
                  </h2>
                  {exam.title?.includes('(') && (
                    <p className="text-sm font-semibold text-slate-700">
                      {exam.title.match(/\(([^)]+)\)/)?.[1] || ''}
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-slate-500">
                  {new Date(exam.created_at).getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Central Content - Exam Details */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Title */}
              <h1 className="mb-4 text-2xl font-bold text-slate-900">
                {exam.title}
              </h1>

              {/* Uploader/Source */}
              {exam.creator && (
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <span className="text-xs font-bold">
                      {exam.creator.fullName?.charAt(0)?.toUpperCase() || 'T'}
                    </span>
                  </div>
                  <span className="font-medium">{exam.creator.fullName || 'Giáo viên'}</span>
                  {exam.class && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="line-clamp-1">{exam.class.className}</span>
                    </>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{formatDate(exam.created_at)}</span>
              </div>

              {/* Metrics */}
              <div className="mb-4 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-lg font-semibold">?</span>
                  <span>{exam.question_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Eye className="h-4 w-4" />
                  <span>{exam.count || 0}</span>
                </div>
              </div>

              {/* Rating */}
              {exam.average_rating !== undefined && (
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Đánh giá ({exam.average_rating > 0 ? exam.average_rating.toFixed(1) : 'Chưa có'})
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(exam.average_rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  {exam.total_ratings > 0 && (
                    <span className="text-xs text-slate-500">
                      ({exam.total_ratings} đánh giá)
                    </span>
                  )}
                </div>
              )}

              {/* Favorite button */}
              <div className="mb-4">
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                    isFavorited
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-600" : ""}`} />
                  <span>{isFavorited ? "Đã yêu thích" : "Yêu thích"}</span>
                </button>
              </div>

              {/* School info */}
              {exam.class && (
                <div className="mb-4 rounded-lg bg-green-50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">🏫</span>
                    <span className="font-semibold text-green-700">
                      Trường học: {exam.class.className}
                    </span>
                  </div>
                </div>
              )}

              {/* Start exam button */}
              <button
                onClick={handleStartExam}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <div className="flex items-center justify-center gap-2">
                  <Play className="h-5 w-5" />
                  <span>Bắt đầu làm bài</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Panel - Share Options */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Chia sẻ đề thi</h3>

              {/* Social media buttons */}
              <div className="mb-4 flex gap-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
                >
                  <Facebook className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white transition hover:bg-blue-800"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare("x")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 text-center text-sm text-slate-500">hoặc</div>

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                <Copy className="h-4 w-4" />
                <span>Sao chép link</span>
              </button>
            </div>
          </div>
        </div>

        {/* Similar Exams Section */}
        {similarExams.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Đề thi tương tự</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {similarExams.map((similarExam) => (
                <div
                  key={similarExam.id}
                  onClick={() => {
                    navigate(`/dashboard/student/exams/${similarExam.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600">
                        {similarExam.title}
                      </h3>
                      {similarExam.class && (
                        <p className="mb-2 text-xs text-slate-500">
                          {similarExam.class.className}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{similarExam.minutes} phút</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{similarExam.question_count || 0} câu</span>
                    </div>
                  </div>
                  {similarExam.status && (
                    <div className="mt-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        similarExam.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                        similarExam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        similarExam.status === 'ended' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {similarExam.status === 'ongoing' ? 'Đang diễn ra' :
                         similarExam.status === 'upcoming' ? 'Sắp tới' :
                         similarExam.status === 'ended' ? 'Đã kết thúc' :
                         'Không giới hạn'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

