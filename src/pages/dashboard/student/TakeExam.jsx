import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  startExamSession,
  getCurrentSession,
  getSessionQuestions,
  submitAnswer,
  getSessionAnswers,
  submitExam,
} from "../../../services/examSessionService";
import { logCheatingEvent } from "../../../services/cheatingLogService";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

// Hook để phát hiện gian lận
function useCheatingDetection(sessionId, isActive) {
  const [cheatingCount, setCheatingCount] = useState(0);
  const warningShown = useRef(false);

  const logCheating = useCallback(
    async (type, description, severity = "medium", metadata = {}) => {
      if (!sessionId || !isActive) return;

      try {
        await logCheatingEvent(sessionId, {
          cheating_type: type,
          description,
          severity,
          metadata: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ...metadata,
          },
        });
        
        // Sử dụng functional update để tránh dependency vào cheatingCount
        setCheatingCount((prev) => {
          const newCount = prev + 1;
          
          // Hiển thị cảnh báo nếu chưa hiển thị và đạt ngưỡng
          if (!warningShown.current && newCount >= 2) {
            toast.warning(
              "Hệ thống đã phát hiện nhiều hành vi bất thường. Vui lòng làm bài nghiêm túc!",
              { autoClose: 5000 }
            );
            warningShown.current = true;
          }
          
          return newCount;
        });
      } catch (error) {
        console.error("Error logging cheating event:", error);
      }
    },
    [sessionId, isActive]
  );

  // Phát hiện chuyển tab
  useEffect(() => {
    if (!isActive) return;

    let lastVisibilityChange = 0;
    const DEBOUNCE_TIME = 500; // 500ms để tránh ghi log trùng lặp

    const handleVisibilityChange = () => {
      const now = Date.now();
      // Chỉ ghi log nếu đã qua đủ thời gian debounce
      if (now - lastVisibilityChange < DEBOUNCE_TIME) {
        return;
      }
      
      if (document.hidden) {
        lastVisibilityChange = now;
        logCheating(
          "tab_switch",
          "Student switched to another tab",
          "medium",
          { window_count: window.length }
        );
      }
    };

    const handleFocus = () => {
      // Reset warning khi quay lại
      if (document.hasFocus()) {
        warningShown.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isActive, logCheating]);

  // Phát hiện copy/paste
  useEffect(() => {
    if (!isActive) return;

    const handleCopy = (e) => {
      e.preventDefault();
      logCheating("copy_paste", "Copy detected", "high", {
        clipboard_data: e.clipboardData?.getData("text")?.substring(0, 50),
      });
      toast.error("Không được phép copy trong lúc thi!", { autoClose: 3000 });
    };

    const handlePaste = (e) => {
      e.preventDefault();
      logCheating("copy_paste", "Paste detected", "high", {
        clipboard_data: e.clipboardData?.getData("text")?.substring(0, 50),
      });
      toast.error("Không được phép paste trong lúc thi!", { autoClose: 3000 });
    };

    const handleCut = (e) => {
      e.preventDefault();
      logCheating("copy_paste", "Cut detected", "high");
      toast.error("Không được phép cut trong lúc thi!", { autoClose: 3000 });
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
    };
  }, [isActive, logCheating]);

  // Phát hiện click chuột phải
  useEffect(() => {
    if (!isActive) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      logCheating("right_click", "Right click detected", "medium", {
        target: e.target?.tagName,
      });
      toast.warning("Không được phép click chuột phải!", { autoClose: 2000 });
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isActive, logCheating]);

  // Phát hiện phím tắt
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Phát hiện Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, Ctrl+Shift+I, Ctrl+Shift+J
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" ||
          e.key === "v" ||
          e.key === "x" ||
          e.key === "a" ||
          e.key === "s" ||
          e.key === "p")
      ) {
        e.preventDefault();
        logCheating("keyboard_shortcut", `Keyboard shortcut detected: ${e.key}`, "high", {
          key: e.key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
        });
        toast.error(`Không được phép sử dụng phím tắt ${e.key.toUpperCase()}!`, {
          autoClose: 3000,
        });
      }

      // Phát hiện F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        logCheating("keyboard_shortcut", "F12 (DevTools) detected", "critical");
        toast.error("Không được phép mở DevTools!", { autoClose: 3000 });
      }

      // Phát hiện Ctrl+Shift+I/J (DevTools)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "I" || e.key === "J")
      ) {
        e.preventDefault();
        logCheating("keyboard_shortcut", "DevTools shortcut detected", "critical");
        toast.error("Không được phép mở DevTools!", { autoClose: 3000 });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, logCheating]);

  // Phát hiện nhiều tab
  useEffect(() => {
    if (!isActive) return;

    const checkMultipleTabs = () => {
      if (window.length > 1) {
        logCheating("multiple_tabs", "Multiple tabs detected", "medium", {
          window_count: window.length,
        });
      }
    };

    const interval = setInterval(checkMultipleTabs, 5000);
    return () => clearInterval(interval);
  }, [isActive, logCheating]);

  return { cheatingCount };
}

// Component chính
export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const { cheatingCount } = useCheatingDetection(session?.id, isActive);

  // Khởi tạo session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        let currentSession = null;

        // Kiểm tra xem đã có session chưa
        try {
          const sessionData = await getCurrentSession(examId);
          currentSession = sessionData;
        } catch (error) {
          // Nếu chưa có session, tạo mới
          if (error.status === 404) {
            const startData = await startExamSession(examId);
            currentSession = startData.session;
          } else {
            throw error;
          }
        }

        setSession(currentSession);

        // Lấy câu hỏi
        const questionsData = await getSessionQuestions(currentSession.id);
        setExam(questionsData.exam);
        setQuestions(questionsData.questions || []);
        setRemainingTime(questionsData.session.remaining_time_ms || 0);
        setIsActive(true);

        // Load câu trả lời đã lưu
        loadSavedAnswers(currentSession.id);
      } catch (error) {
        console.error("Error initializing session:", error);
        toast.error(error.message || "Không thể khởi tạo bài thi");
        navigate("/dashboard/student");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      initializeSession();
    }
  }, [examId, navigate]);

  // Load câu trả lời đã lưu
  const loadSavedAnswers = async (sessionId) => {
    try {
      const { answers: savedAnswers } = await getSessionAnswers(sessionId);
      const answersMap = {};
      savedAnswers.forEach((answer) => {
        if (answer.selected_answer_id) {
          answersMap[answer.exam_question_id] = {
            selected_answer_id: answer.selected_answer_id,
          };
        } else if (answer.answer_text) {
          answersMap[answer.exam_question_id] = {
            answer_text: answer.answer_text,
          };
        }
      });
      setAnswers(answersMap);
    } catch (error) {
      console.error("Error loading saved answers:", error);
    }
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (remainingTime <= 0 || !isActive) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1000) {
          setIsActive(false);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, isActive]);

  // Format thời gian
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Xử lý trả lời câu hỏi
  const handleAnswer = async (questionId, answerData) => {
    if (!session || !isActive) return;

    try {
      const payload = {
        question_id: questionId,
        ...answerData,
      };

      await submitAnswer(session.id, payload);
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answerData,
      }));

      toast.success("Đã lưu câu trả lời", { autoClose: 1000 });
    } catch (error) {
      console.error("Error submitting answer:", error);
      const errorMessage = 
        error?.body?.message || 
        error?.message || 
        (error?.status === 404 ? "Không tìm thấy session hoặc câu hỏi" : "Không thể lưu câu trả lời");
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  // Xử lý nộp bài
  const handleSubmit = async () => {
    if (!session || isSubmitting) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn không thể chỉnh sửa."
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    setIsActive(false);

    try {
      await submitExam(session.id);
      toast.success("Nộp bài thành công!");
      navigate(`/student/exams/${examId}/result/${session.id}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error(error.message || "Không thể nộp bài");
      setIsSubmitting(false);
      setIsActive(true);
    }
  };

  // Tự động nộp khi hết thời gian
  const handleAutoSubmit = async () => {
    if (!session || isSubmitting) return;

    setIsSubmitting(true);
    setIsActive(false);

    try {
      await submitExam(session.id);
      toast.info("Đã hết thời gian! Bài thi đã được tự động nộp.");
      navigate(`/student/exams/${examId}/result/${session.id}`);
    } catch (error) {
      console.error("Error auto-submitting exam:", error);
      toast.error("Đã hết thời gian nhưng không thể nộp bài tự động");
    }
  };

  // Tính toán progress
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  // Warning khi rời trang
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Bạn có chắc chắn muốn rời khỏi trang? Tiến trình làm bài sẽ bị mất!";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Chỉ xử lý khi không đang focus vào input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentQuestionIndex, questions.length]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-lg font-semibold text-gray-700">Đang tải bài thi...</p>
          <p className="mt-2 text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!session || !exam || questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <p className="text-xl font-semibold text-red-600">Không tìm thấy bài thi hoặc câu hỏi</p>
          <button
            onClick={() => navigate("/dashboard/student/exams")}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Quay lại danh sách bài thi
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header cố định */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-[1920px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
              {exam.des && (
                <p className="mt-1 text-sm text-slate-600">{exam.des}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Progress bar */}
              <div className="hidden md:block w-32">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>Tiến độ</span>
                  <span className="font-semibold">{answeredCount}/{questions.length}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Cheating warning */}
              {cheatingCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">
                    {cheatingCount} cảnh báo
                  </span>
                </div>
              )}

              {/* Timer */}
              <div
                className={`flex items-center gap-3 rounded-xl border-2 px-5 py-3 shadow-md transition-all ${
                  remainingTime < 300000
                    ? "border-red-400 bg-gradient-to-r from-red-50 to-red-100 text-red-700 animate-pulse"
                    : remainingTime < 600000
                    ? "border-orange-400 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700"
                    : "border-indigo-400 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700"
                }`}
              >
                <Clock className={`h-6 w-6 ${remainingTime < 300000 ? "animate-pulse" : ""}`} />
                <div>
                  <div className="text-xs font-medium opacity-75">Thời gian còn lại</div>
                  <div className="text-2xl font-bold tabular-nums">
                    {formatTime(remainingTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Danh sách câu hỏi */}
        <aside className="hidden lg:block w-80 border-r border-slate-200 bg-white/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Danh sách câu hỏi</h2>
              <div className="text-sm text-slate-600">
                {answeredCount} / {questions.length} câu đã trả lời
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id];
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`relative h-12 rounded-lg border-2 font-semibold transition-all transform hover:scale-105 ${
                      isCurrent
                        ? "border-indigo-500 bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg scale-110 z-10"
                        : isAnswered
                        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 hover:border-emerald-500"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {index + 1}
                    {isAnswered && !isCurrent && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-emerald-500 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-700 mb-2">Chú thích:</div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded border-2 border-indigo-500 bg-gradient-to-br from-indigo-500 to-blue-500"></div>
                <span className="text-slate-600">Đang làm</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50"></div>
                <span className="text-slate-600">Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded border-2 border-slate-200 bg-white"></div>
                <span className="text-slate-600">Chưa trả lời</span>
              </div>
            </div>

            {/* Submit button in sidebar */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isActive}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang nộp bài...
                </span>
              ) : (
                "Nộp bài"
              )}
            </button>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {/* Question card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-lg font-bold text-white shadow-md">
                      {currentQuestionIndex + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500">
                        Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {currentQuestion.type === "multiple_choice" && "Trắc nghiệm"}
                        {currentQuestion.type === "true_false" && "Đúng / Sai"}
                        {currentQuestion.type === "short_answer" && "Tự luận ngắn"}
                        {currentQuestion.type === "essay" && "Bài luận"}
                      </div>
                    </div>
                  </div>
                  {currentAnswer && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 border border-emerald-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">Đã trả lời</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                {/* Question text */}
                <h2 className="mb-6 text-2xl font-bold leading-relaxed text-slate-900">
                  {currentQuestion.question_text}
                </h2>

                {/* Question image */}
                {currentQuestion.image_url && (
                  <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={currentQuestion.image_url}
                      alt="Question"
                      className="w-full object-contain"
                    />
                  </div>
                )}

                {/* Multiple Choice / True-False */}
                {(currentQuestion.type === "multiple_choice" ||
                  currentQuestion.type === "true_false") && (
                  <div className="space-y-3">
                    {currentQuestion.answers?.map((answer, idx) => {
                      const isSelected = currentAnswer?.selected_answer_id === answer.id;
                      const letter = String.fromCharCode(65 + idx); // A, B, C, D...

                      return (
                        <label
                          key={answer.id}
                          className={`group flex cursor-pointer items-center gap-4 rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                            isSelected
                              ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold transition-all ${
                              isSelected
                                ? "bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}
                          >
                            {letter}
                          </div>
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            checked={isSelected}
                            onChange={() =>
                              handleAnswer(currentQuestion.id, {
                                selected_answer_id: answer.id,
                              })
                            }
                            className="h-5 w-5 cursor-pointer text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          />
                          <span className="flex-1 text-lg text-slate-700">
                            {answer.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer / Essay */}
                {(currentQuestion.type === "short_answer" ||
                  currentQuestion.type === "essay") && (
                  <div>
                    <textarea
                      value={currentAnswer?.answer_text || ""}
                      onChange={(e) =>
                        handleAnswer(currentQuestion.id, {
                          answer_text: e.target.value,
                        })
                      }
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full rounded-xl border-2 border-slate-200 p-5 text-lg text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
                      rows={currentQuestion.type === "essay" ? 12 : 6}
                    />
                    <div className="mt-2 text-sm text-slate-500">
                      {(currentAnswer?.answer_text || "").length} ký tự
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        prev > 0 ? prev - 1 : prev
                      )
                    }
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700"
                  >
                    <span>←</span> Câu trước
                  </button>

                  <div className="text-sm text-slate-500">
                    Sử dụng <kbd className="rounded bg-slate-100 px-2 py-1 font-mono">←</kbd>{" "}
                    <kbd className="rounded bg-slate-100 px-2 py-1 font-mono">→</kbd> để điều hướng
                  </div>

                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        prev < questions.length - 1 ? prev + 1 : prev
                      )
                    }
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-white disabled:hover:text-slate-700"
                  >
                    Câu sau <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile submit button */}
            <div className="mt-6 lg:hidden">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isActive}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

