import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSessionResult } from "../../../services/examSessionService";
import { createOrUpdateRating, getUserRating } from "../../../services/examRatingService";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
  Star,
  BookOpen,
} from "lucide-react";

export default function ExamResult() {
  const { examId, sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        const data = await getSessionResult(sessionId);
        setResult(data.result);
        setAnswers(data.answers || []);

        // Load user rating nếu có
        if (data.result?.exam_id) {
          try {
            const ratingData = await getUserRating(data.result.exam_id);
            if (ratingData) {
              setUserRating(ratingData);
              setRating(ratingData.rating || 0);
              setComment(ratingData.comment || "");
            }
          } catch (error) {
            console.error("Error loading user rating:", error);
            // Không hiển thị lỗi nếu chưa có rating
          }
        }
      } catch (error) {
        console.error("Error loading result:", error);
        toast.error(error.message || "Không thể tải kết quả");
        navigate("/dashboard/student");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadResult();
    }
  }, [sessionId, navigate]);

  const handleSubmitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5");
      return;
    }

    if (!result?.exam_id) {
      toast.error("Không tìm thấy thông tin đề thi");
      return;
    }

    try {
      setSubmittingRating(true);
      await createOrUpdateRating({
        exam_id: result.exam_id,
        rating: rating,
        comment: comment.trim() || null,
        result_id: result.id
      });
      toast.success("Đánh giá đã được lưu thành công!");

      // Reload user rating
      const ratingData = await getUserRating(result.exam_id);
      if (ratingData) {
        setUserRating(ratingData);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(error.message || "Không thể lưu đánh giá");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="text-slate-600">Đang tải kết quả...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
            <p className="font-semibold">Không tìm thấy kết quả</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Đảm bảo percentage là số
  const percentage = typeof result.percentage === 'number'
    ? result.percentage
    : parseFloat(result.percentage) || 0;
  const isPassed = percentage >= 50; // Có thể điều chỉnh ngưỡng

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/student")}
              className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
            {examId && (
              <button
                onClick={() => navigate(`/dashboard/student/exams/${examId}`)}
                className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                <BookOpen className="h-4 w-4" />
                <span>Quay lại đề thi</span>
              </button>
            )}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            Kết quả thi
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Kết quả bài thi
          </h1>
          <p className="mt-2 text-slate-600">{result.exam?.title}</p>
        </header>

        {/* Summary Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mb-2 flex items-center justify-center">
                <Award
                  className={`h-12 w-12 ${isPassed ? "text-emerald-500" : "text-red-500"
                    }`}
                />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {result.total_score || 0}
              </div>
              <div className="text-sm text-slate-500">
                / {result.exam?.total_score || 0} điểm
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mb-2 flex items-center justify-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${isPassed ? "bg-emerald-100" : "bg-red-100"
                    }`}
                >
                  <span
                    className={`text-2xl font-bold ${isPassed ? "text-emerald-600" : "text-red-600"
                      }`}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500">Tỷ lệ đúng</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mb-2 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <span className="text-2xl font-bold text-slate-900">
                  {result.correct_count || 0}
                </span>
              </div>
              <div className="text-sm text-slate-500">Câu đúng</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-xl font-semibold text-slate-700">
                  {result.wrong_count || 0}
                </span>
              </div>
              <div className="text-sm text-slate-500">Câu sai</div>
            </div>
          </div>

          {result.feedback && (
            <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="mb-2 font-semibold text-indigo-900">
                Nhận xét từ giáo viên:
              </h3>
              <p className="text-indigo-800">{result.feedback}</p>
            </div>
          )}
        </section>

        {/* Rating Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Đánh giá đề thi
          </h2>
          <p className="mb-6 text-sm text-slate-600">
            Hãy chia sẻ đánh giá của bạn về đề thi này để giúp cải thiện chất lượng
          </p>

          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Số sao đánh giá *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="mt-2 text-sm text-slate-600">
                  Bạn đã chọn {rating} {rating === 1 ? "sao" : "sao"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="rating-comment"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nhận xét (tùy chọn)
              </label>
              <textarea
                id="rating-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ suy nghĩ của bạn về đề thi này..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitRating}
              disabled={submittingRating || !rating}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingRating ? "Đang lưu..." : userRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
            </button>

            {userRating && (
              <p className="text-center text-xs text-slate-500">
                Bạn đã đánh giá đề thi này vào{" "}
                {new Date(userRating.created_at).toLocaleDateString("vi-VN")}
              </p>
            )}
          </div>
        </section>

        {/* Answers Review */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Chi tiết câu trả lời
          </h2>

          <div className="space-y-6">
            {answers.map((answer, index) => {
              const question = answer.question;
              const isCorrect = answer.is_correct;
              const selectedAnswer = answer.selectedAnswer;
              const isAnswered = answer.id !== null && answer.id !== undefined;
              const isBlank = !isAnswered;

              return (
                <div
                  key={answer.exam_question_id || question?.id || index}
                  className={`rounded-2xl border-2 p-5 ${isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : isBlank
                      ? "border-amber-200 bg-amber-50"
                      : "border-red-200 bg-red-50"
                    }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          Câu {index + 1}:
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : isBlank ? (
                          <Clock className="h-5 w-5 text-amber-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${isCorrect
                            ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                            : isBlank
                              ? "border-amber-200 bg-amber-100 text-amber-700"
                              : "border-red-200 bg-red-100 text-red-700"
                            }`}
                        >
                          {isCorrect ? "Đúng" : isBlank ? "Bỏ trống" : "Sai"} ({answer.score || 0}{" "}
                          điểm)
                        </span>
                      </div>
                      <p className="text-lg font-medium text-slate-900">
                        {question?.question_text}
                      </p>
                    </div>
                  </div>

                  {/* Single Choice / Multiple Choice / True-False */}
                  {(question?.type === "single_choice" ||
                    question?.type === "multiple_choice" ||
                    question?.type === "true_false") && (
                      <div className="space-y-2">
                        {question.answers?.map((ans) => {
                          const isSelected = selectedAnswer?.id === ans.id;
                          const isCorrectAnswer = ans.is_correct;

                          return (
                            <div
                              key={ans.id}
                              className={`rounded-xl border-2 p-3 ${isCorrectAnswer
                                ? "border-emerald-500 bg-emerald-100"
                                : isSelected && !isCorrectAnswer
                                  ? "border-red-500 bg-red-100"
                                  : "border-slate-200 bg-white"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                )}
                                {isSelected && !isCorrectAnswer && (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span
                                  className={`font-medium ${isCorrectAnswer
                                    ? "text-emerald-800"
                                    : isSelected && !isCorrectAnswer
                                      ? "text-red-800"
                                      : "text-slate-700"
                                    }`}
                                >
                                  {ans.text}
                                </span>
                                {isSelected && (
                                  <span className="ml-auto text-xs text-slate-500">
                                    (Bạn chọn)
                                  </span>
                                )}
                                {isCorrectAnswer && !isSelected && (
                                  <span className="ml-auto text-xs text-emerald-600">
                                    (Đáp án đúng)
                                  </span>
                                )}
                                {isBlank && isCorrectAnswer && (
                                  <span className="ml-auto text-xs text-amber-600">
                                    (Đáp án đúng - bạn chưa chọn)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Short Answer / Essay */}
                  {(question?.type === "short_answer" ||
                    question?.type === "essay") && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Câu trả lời của bạn:
                          </label>
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className={`${isBlank ? "text-amber-600 italic" : "text-slate-900"}`}>
                              {answer.answer_text || "Chưa trả lời"}
                            </p>
                          </div>
                        </div>
                        {isBlank && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm text-amber-800">
                              ⚠️ Câu hỏi này cần giáo viên chấm điểm thủ công
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {examId && (
            <button
              onClick={() => navigate(`/dashboard/student/exams/${examId}`)}
              className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <BookOpen className="h-4 w-4" />
              Quay lại đề thi
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard/student")}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

