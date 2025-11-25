import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSessionResult } from "../../../services/examSessionService";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowLeft,
} from "lucide-react";

export default function ExamResult() {
  const { examId, sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        const data = await getSessionResult(sessionId);
        setResult(data.result);
        setAnswers(data.answers || []);
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

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="text-gray-600">Đang tải kết quả...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!result) {
    return (
      <DashboardLayout role="student">
        <div className="flex h-screen items-center justify-center">
          <p className="text-red-500">Không tìm thấy kết quả</p>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/dashboard/student")}
              className="mb-4 flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Kết quả bài thi
            </h1>
            <p className="mt-2 text-gray-600">{result.exam?.title}</p>
          </div>

          {/* Summary Card */}
          <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Award
                    className={`h-12 w-12 ${
                      isPassed ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {result.total_score || 0}
                </div>
                <div className="text-sm text-gray-500">
                  / {result.exam?.total_score || 0} điểm
                </div>
              </div>

              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      isPassed ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <span
                      className={`text-2xl font-bold ${
                        isPassed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Tỷ lệ đúng</div>
              </div>

              <div className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {result.correct_count || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-500">Câu đúng</div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <span className="text-xl font-semibold text-gray-700">
                    {result.wrong_count || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-500">Câu sai</div>
              </div>
            </div>

            {result.feedback && (
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">
                  Nhận xét từ giáo viên:
                </h3>
                <p className="text-blue-800">{result.feedback}</p>
              </div>
            )}
          </div>

          {/* Answers Review */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Chi tiết câu trả lời
            </h2>

            <div className="space-y-6">
              {answers.map((answer, index) => {
                const question = answer.question;
                const isCorrect = answer.is_correct;
                const selectedAnswer = answer.selectedAnswer;

                return (
                  <div
                    key={answer.id}
                    className={`rounded-lg border-2 p-4 ${
                      isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-semibold text-gray-700">
                            Câu {index + 1}:
                          </span>
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isCorrect ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {isCorrect ? "Đúng" : "Sai"} ({answer.score || 0}{" "}
                            điểm)
                          </span>
                        </div>
                        <p className="text-lg font-medium text-gray-900">
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
                              className={`rounded-lg border-2 p-3 ${
                                isCorrectAnswer
                                  ? "border-green-500 bg-green-100"
                                  : isSelected && !isCorrectAnswer
                                  ? "border-red-500 bg-red-100"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                                {isSelected && !isCorrectAnswer && (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span
                                  className={`font-medium ${
                                    isCorrectAnswer
                                      ? "text-green-800"
                                      : isSelected && !isCorrectAnswer
                                      ? "text-red-800"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {ans.text}
                                </span>
                                {isSelected && (
                                  <span className="ml-auto text-sm text-gray-500">
                                    (Bạn chọn)
                                  </span>
                                )}
                                {isCorrectAnswer && !isSelected && (
                                  <span className="ml-auto text-sm text-green-600">
                                    (Đáp án đúng)
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
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Câu trả lời của bạn:
                          </label>
                          <div className="rounded-lg border border-gray-300 bg-white p-4">
                            <p className="text-gray-900">
                              {answer.answer_text || "Chưa trả lời"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard/student")}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

