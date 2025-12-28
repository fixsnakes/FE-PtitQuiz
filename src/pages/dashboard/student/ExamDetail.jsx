import React, { useState, useEffect } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getStudentExamDetail, getSimilarExams } from "../../../services/studentExamService";
import { addFavorite, removeFavorite, checkFavorite } from "../../../services/examFavoriteService";
import { getExamRatings } from "../../../services/examRatingService";
import { getStudentResults, getStudentComparison } from "../../../services/examResultService";
import { getCommentsByExam, createComment, deleteComment } from "../../../services/examCommentService";
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
  GraduationCap,
  MessageSquare,
  Trophy,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
} from "lucide-react";
import formatCurrency from "../../../utils/format_currentcy";

export default function ExamDetail() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [similarExams, setSimilarExams] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState("info"); // info, ratings, results, ranking, comments

  // Ratings state
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [ratingsTotal, setRatingsTotal] = useState(0);
  const ratingsLimit = 10;

  // Results state
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Ranking state
  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
    if (exam?.is_paid && parseFloat(exam?.fee || 0) > 0) {
      setShowPurchaseModal(true);
    } else {
      navigate(`/student/exams/${examId}/take`);
    }
  };

  const handlePurchaseConfirm = () => {
    setShowPurchaseModal(false);
    navigate(`/student/exams/${examId}/take`);
  };

  // Load ratings
  const loadRatings = async (page = 1) => {
    if (!examId) return;
    try {
      setRatingsLoading(true);
      const response = await getExamRatings(examId, { page, limit: ratingsLimit });
      setRatings(response.ratings || []);
      setRatingsTotal(response.total || 0);
      setRatingsPage(page);
    } catch (error) {
      console.error("Error loading ratings:", error);
      toast.error("Không thể tải đánh giá");
    } finally {
      setRatingsLoading(false);
    }
  };

  // Load results
  const loadResults = async () => {
    if (!examId) return;
    try {
      setResultsLoading(true);
      const response = await getStudentResults({ exam_id: examId });
      setResults(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Không thể tải kết quả thi");
    } finally {
      setResultsLoading(false);
    }
  };

  // Load comparison
  const loadComparison = async () => {
    if (!examId) return;
    try {
      setComparisonLoading(true);
      const response = await getStudentComparison(examId);
      setComparison(response);
    } catch (error) {
      console.error("Error loading comparison:", error);
      // Không hiển thị lỗi nếu chưa có kết quả
      if (error.status !== 404) {
        toast.error("Không thể tải thông tin xếp hạng");
      }
    } finally {
      setComparisonLoading(false);
    }
  };

  // Load comments
  const loadComments = async () => {
    if (!examId) return;
    try {
      setCommentsLoading(true);
      const response = await getCommentsByExam(examId);
      setComments(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Không thể tải bình luận");
    } finally {
      setCommentsLoading(false);
    }
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }
    try {
      await createComment({
        exam_id: examId,
        text: newCommentText.trim(),
      });
      setNewCommentText("");
      toast.success("Đã thêm bình luận");
      loadComments();
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error(error.message || "Không thể thêm bình luận");
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    try {
      await createComment({
        exam_id: examId,
        text: replyText.trim(),
        parent_id: parentId,
      });
      setReplyText("");
      setReplyingTo(null);
      toast.success("Đã thêm phản hồi");
      loadComments();
    } catch (error) {
      console.error("Error creating reply:", error);
      toast.error(error.message || "Không thể thêm phản hồi");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      return;
    }
    try {
      await deleteComment(commentId);
      toast.success("Đã xóa bình luận");
      loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error(error.message || "Không thể xóa bình luận");
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!examId) return;

    if (activeTab === "ratings") {
      loadRatings(1);
    } else if (activeTab === "results") {
      loadResults();
    } else if (activeTab === "ranking") {
      loadComparison();
    } else if (activeTab === "comments") {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, examId]);

  const renderSimilarExamCard = (similarExam) => {
    return (
      <div
        key={similarExam.id}
        onClick={() => {
          navigate(`/dashboard/student/exams/${similarExam.id}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition cursor-pointer hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
      >
        <div className="relative overflow-hidden rounded-t-2xl">
          {/* Exam Image or Default Gradient */}
          {similarExam.image_url ? (
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={similarExam.image_url.startsWith('http') ? similarExam.image_url : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"}${similarExam.image_url}`}
                alt={similarExam.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback to default gradient if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="hidden h-full w-full bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {similarExam.class?.className || "Public"}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {formatDate(similarExam.created_at)}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">
                  {similarExam.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-indigo-600">
                  {similarExam.des || similarExam.class?.className || "Không có mô tả"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {similarExam.class?.className || "Public"}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formatDate(similarExam.created_at)}
                </span>
              </div>
              <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">
                {similarExam.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-indigo-600">
                {similarExam.des || similarExam.class?.className || "Không có mô tả"}
              </p>
            </div>
          )}

          {/* Overlay info on image */}
          {similarExam.image_url && (
            <div className="absolute inset-0 z-[5] flex flex-col justify-between bg-black/60 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {similarExam.class?.className || "Public"}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-white">
                  {formatDate(similarExam.created_at)}
                </span>
              </div>
              <div>
                <h3 className="line-clamp-2 text-lg font-bold text-white">
                  {similarExam.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-white/90">
                  {similarExam.des || similarExam.class?.className || "Không có mô tả"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <Clock className="h-4 w-4 text-slate-400" />
              {similarExam.minutes} phút
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <BookOpen className="h-4 w-4 text-slate-400" />
              {similarExam.question_count || 0} câu
            </span>
            {similarExam.status && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${similarExam.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                similarExam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  similarExam.status === 'ended' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                }`}>
                {similarExam.status === 'ongoing' ? 'Đang diễn ra' :
                  similarExam.status === 'upcoming' ? 'Sắp tới' :
                    similarExam.status === 'ended' ? 'Đã kết thúc' :
                      'Không giới hạn'}
              </span>
            )}
          </div>

          {similarExam.class && (
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{similarExam.class.className}</p>
              {similarExam.class.classCode && (
                <p className="text-slate-500 line-clamp-1">Mã lớp: {similarExam.class.classCode}</p>
              )}
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/student/exams/${similarExam.id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Play className="h-4 w-4" />
              Vào ôn thi
            </button>
          </div>
        </div>
      </div>
    );
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
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard/student")}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </button>

        {/* Central Content - Exam Details */}
        <div className="flex gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Exam Image */}
          <div className="w-1/2">
            <img
              src={exam.image_url
                ? (exam.image_url.startsWith('http')
                  ? exam.image_url
                  : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"}${exam.image_url}`)
                : "https://images.pexels.com/photos/167682/pexels-photo-167682.jpeg"}
              alt={exam.title}
              className="h-full w-full rounded-lg object-cover"
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/167682/pexels-photo-167682.jpeg";
              }}
            />
          </div>

          {/* Content */}
          <div className="w-1/2">
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
                {exam.classes && exam.classes.length > 0 && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="line-clamp-1" title={exam.classes.map(c => c.className).join(", ")}>
                      {exam.classes.length > 1 
                        ? `${exam.classes.length} lớp: ${exam.classes.map(c => c.className).join(", ")}`
                        : exam.classes[0].className}
                    </span>
                  </>
                )}
                {!exam.classes && exam.class && (
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
                <BookOpen className="h-4 w-4" />
                <span>{exam.question_count || 0} câu hỏi</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Eye className="h-4 w-4" />
                <span>{exam.count || 0} lượt làm</span>
              </div>
              {/* Hiển thị giá tiền nếu bài thi có phí */}
              {exam.is_paid && parseFloat(exam.fee || 0) > 0 && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Wallet className="h-4 w-4" />
                  <span className="font-semibold">{formatCurrency(exam.fee)}/ lượt thi</span>
                </div>
              )}
            </div>

            {/* Rating */}
            {exam.average_rating !== undefined && (
              <button
                onClick={() => setActiveTab("ratings")}
                className="mb-4 flex items-center gap-3 rounded-lg p-2 transition hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-700">
                  Đánh giá ({exam.average_rating > 0 ? exam.average_rating.toFixed(1) : 'Chưa có'})
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.round(exam.average_rating || 0)
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
              </button>
            )}

            {/* Favorite button */}
            <div className="mb-4">
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${isFavorited
                  ? "bg-red-100 text-red-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-600" : ""}`} />
                <span>{isFavorited ? "Đã yêu thích" : "Yêu thích"}</span>
              </button>
            </div>

            {/* School info */}
            {exam.classes && exam.classes.length > 0 && (
              <div className="mb-4 rounded-lg bg-green-50 p-3">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🏫</span>
                    <span className="font-semibold text-green-700">
                      {exam.classes.length > 1 ? `Lớp học (${exam.classes.length}):` : "Lớp học:"}
                    </span>
                  </div>
                  <div className="ml-6 flex flex-wrap gap-2">
                    {exam.classes.map((cls, idx) => (
                      <span key={cls.id || idx} className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                        {cls.className} {cls.classCode ? `(${cls.classCode})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!exam.classes && exam.class && (
              <div className="mb-4 rounded-lg bg-green-50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">🏫</span>
                  <span className="font-semibold text-green-700">
                    Lớp học: {exam.class.className}
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

        {/* Tabs Section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Tabs Header */}
          <div className="border-b border-slate-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "info"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <BookOpen className="h-4 w-4" />
                Thông tin
              </button>
              <button
                onClick={() => setActiveTab("ratings")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "ratings"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <MessageSquare className="h-4 w-4" />
                Đánh giá {exam?.total_ratings > 0 && `(${exam.total_ratings})`}
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "results"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <Trophy className="h-4 w-4" />
                Kết quả thi
              </button>
              <button
                onClick={() => setActiveTab("ranking")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "ranking"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Xếp hạng
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === "comments"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <MessageSquare className="h-4 w-4" />
                Bình luận {comments.length > 0 && `(${comments.length})`}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">Mô tả</h3>
                  <p className="text-slate-600">
                    {exam.des || "Không có mô tả"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">Thông tin đề thi</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>Thời lượng: {exam.minutes} phút</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen className="h-4 w-4" />
                      <span>Số câu hỏi: {exam.question_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Trophy className="h-4 w-4" />
                      <span>Tổng điểm: {exam.total_score}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Eye className="h-4 w-4" />
                      <span>Lượt làm: {exam.count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ratings" && (
              <div className="space-y-4">
                {ratingsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
                  </div>
                ) : ratings.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">
                    <MessageSquare className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                    <p>Chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {ratings.map((rating) => (
                        <div
                          key={rating.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                                <span className="text-xs font-bold">
                                  {rating.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                              </div>
                              <span className="font-medium text-slate-900">
                                {rating.user?.fullName || "Người dùng"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= rating.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          {rating.comment && (
                            <p className="text-sm text-slate-600">{rating.comment}</p>
                          )}
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(rating.created_at).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {ratingsTotal > ratingsLimit && (
                      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                        <div className="text-sm text-slate-600">
                          Hiển thị {(ratingsPage - 1) * ratingsLimit + 1} - {Math.min(ratingsPage * ratingsLimit, ratingsTotal)} trong {ratingsTotal} đánh giá
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadRatings(ratingsPage - 1)}
                            disabled={ratingsPage === 1}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-sm text-slate-600">
                            Trang {ratingsPage} / {Math.ceil(ratingsTotal / ratingsLimit)}
                          </span>
                          <button
                            onClick={() => loadRatings(ratingsPage + 1)}
                            disabled={ratingsPage >= Math.ceil(ratingsTotal / ratingsLimit)}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-4">
                {resultsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">
                    <Trophy className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                    <p>Bạn chưa có kết quả thi nào cho đề thi này</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => navigate(`/student/exams/${examId}/result/${result.session_id}`)}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-lg font-bold text-indigo-600">
                                {parseFloat(result.total_score || 0).toFixed(1)} / {exam.total_score}
                              </span>
                              <span className="text-sm text-slate-500">
                                ({parseFloat(result.percentage || 0).toFixed(1)}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span>Đúng: {result.correct_count || 0}</span>
                              <span>Sai: {result.wrong_count || 0}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <p>
                              {new Date(result.submitted_at || result.session?.submitted_at).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs">Mã phiên: {result.session?.code || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "ranking" && (
              <div className="space-y-4">
                {comparisonLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
                  </div>
                ) : !comparison ? (
                  <div className="py-10 text-center text-slate-500">
                    <BarChart3 className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                    <p>Bạn chưa có kết quả thi để so sánh</p>
                    <p className="mt-1 text-sm">Hãy làm bài thi trước để xem xếp hạng</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Student Score */}
                    <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                      <h3 className="mb-2 text-lg font-semibold text-indigo-900">Điểm của bạn</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-indigo-600">
                          {parseFloat(comparison.student?.score || 0).toFixed(1)}
                        </span>
                        <span className="text-slate-600">/ {comparison.exam?.total_score}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                        <span>Đúng: {comparison.student?.correct_count || 0}</span>
                        <span>Sai: {comparison.student?.wrong_count || 0}</span>
                      </div>
                    </div>

                    {/* Global Comparison */}
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <h3 className="mb-3 text-lg font-semibold text-slate-900">So sánh với tất cả</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm text-slate-600">Xếp hạng</p>
                          <p className="text-2xl font-bold text-slate-900">
                            #{comparison.comparison?.global?.rank || "N/A"}
                          </p>
                          <p className="text-xs text-slate-500">
                            / {comparison.comparison?.global?.total || 0} người
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm text-slate-600">Phần trăm</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {comparison.comparison?.global?.percentile || 0}%
                          </p>
                          <p className="text-xs text-slate-500">tốt hơn</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm text-slate-600">Điểm trung bình</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {parseFloat(comparison.comparison?.global?.average_score || 0).toFixed(1)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm text-slate-600">So với trung bình</p>
                          <p className={`text-2xl font-bold ${parseFloat(comparison.student?.score || 0) >= parseFloat(comparison.comparison?.global?.average_score || 0)
                            ? "text-green-600"
                            : "text-red-600"
                            }`}>
                            {parseFloat(comparison.student?.score || 0) >= parseFloat(comparison.comparison?.global?.average_score || 0) ? "+" : ""}
                            {(parseFloat(comparison.student?.score || 0) - parseFloat(comparison.comparison?.global?.average_score || 0)).toFixed(1)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {parseFloat(comparison.student?.score || 0) >= parseFloat(comparison.comparison?.global?.average_score || 0)
                              ? "điểm trên trung bình"
                              : "điểm dưới trung bình"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Class Comparison */}
                    {comparison.comparison?.class?.available ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <h3 className="mb-3 text-lg font-semibold text-green-900">So sánh trong lớp</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg bg-white p-3">
                            <p className="text-sm text-slate-600">Xếp hạng trong lớp</p>
                            <p className="text-2xl font-bold text-green-700">
                              #{comparison.comparison?.class?.rank || "N/A"}
                            </p>
                            <p className="text-xs text-slate-500">
                              / {comparison.comparison?.class?.total || 0} học sinh
                            </p>
                          </div>
                          <div className="rounded-lg bg-white p-3">
                            <p className="text-sm text-slate-600">Phần trăm trong lớp</p>
                            <p className="text-2xl font-bold text-green-700">
                              {comparison.comparison?.class?.percentile || 0}%
                            </p>
                            <p className="text-xs text-slate-500">tốt hơn</p>
                          </div>
                          <div className="rounded-lg bg-white p-3">
                            <p className="text-sm text-slate-600">Điểm trung bình lớp</p>
                            <p className="text-2xl font-bold text-green-700">
                              {parseFloat(comparison.comparison?.class?.average_score || 0).toFixed(1)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white p-3">
                            <p className="text-sm text-slate-600">So với trung bình lớp</p>
                            <p className={`text-2xl font-bold ${parseFloat(comparison.student?.score || 0) >= parseFloat(comparison.comparison?.class?.average_score || 0)
                              ? "text-green-600"
                              : "text-red-600"
                              }`}>
                              {parseFloat(comparison.student?.score || 0) >= parseFloat(comparison.comparison?.class?.average_score || 0) ? "+" : ""}
                              {(parseFloat(comparison.student?.score || 0) - parseFloat(comparison.comparison?.class?.average_score || 0)).toFixed(1)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {parseFloat(comparison.student?.score || 0) >= parseFloat(comparison.comparison?.class?.average_score || 0)
                                ? "điểm trên trung bình lớp"
                                : "điểm dưới trung bình lớp"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-600">
                          {comparison.comparison?.class?.reason || "Không có thông tin so sánh trong lớp"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="space-y-6">
                {/* Comment Form */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">Viết bình luận</h3>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Nhập bình luận của bạn..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newCommentText.trim()}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đăng bình luận
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-10 text-center text-slate-500">
                    <MessageSquare className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                    <p>Chưa có bình luận nào</p>
                    <p className="mt-1 text-sm">Hãy là người đầu tiên bình luận!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                      >
                        {/* Comment Header */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                              <span className="text-sm font-bold">
                                {comment.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {comment.user?.fullName || "Người dùng"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          {comment.user_id === parseInt(localStorage.getItem("userId") || "0") && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Comment Content */}
                        <p className="mb-3 text-slate-700 whitespace-pre-wrap">{comment.text}</p>

                        {/* Reply Button */}
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          {replyingTo === comment.id ? "Hủy phản hồi" : "Phản hồi"}
                        </button>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập phản hồi của bạn..."
                              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                              rows={2}
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyText.trim()}
                                className="rounded-lg bg-indigo-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Đăng phản hồi
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="rounded-lg bg-slate-50 p-3">
                                <div className="mb-2 flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                                      <span className="text-xs font-bold">
                                        {reply.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {reply.user?.fullName || "Người dùng"}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {new Date(reply.created_at).toLocaleDateString("vi-VN", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  {reply.user_id === parseInt(localStorage.getItem("userId") || "0") && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Exams Section */}
        {similarExams.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Đề thi tương tự</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {similarExams.map(renderSimilarExamCard)}
            </div>
          </div>
        )}

        {/* Purchase Confirmation Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Xác nhận mua lượt thi</h3>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>Bạn sẽ được trừ số tiền từ tài khoản</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Giá tiền:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(exam?.fee || 0)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-sm text-indigo-900">
                    <strong>Đề thi:</strong> {exam?.title}
                  </p>
                  <p className="mt-1 text-xs text-indigo-700">
                    Sau khi mua, bạn sẽ có thể làm bài thi ngay lập tức.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handlePurchaseConfirm}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Xác nhận - {formatCurrency(exam?.fee || 0)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

