import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiFileText, FiEdit, FiLoader, FiArrowLeft, FiCheckCircle, FiInfo, FiRefreshCcw } from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import {
  getExamDetail,
  updateExam,
  switchQuestionCreationMethod,
} from "../../../../services/examService";
import { listQuestions } from "../../../../services/questionService";

function normalizeExam(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.exam_id ?? raw._id,
    title: raw.title ?? raw.name ?? "Đề thi",
    question_creation_method:
      raw.question_creation_method ??
      raw.questionMethod ??
      raw.question_method ??
      null,
  };
}

const METHOD_TARGETS = {
  text: {
    label: "Văn bản",
    description: "Tạo đề thi nhanh bằng cách soạn thảo văn bản",
    pathSuffix: "text",
    accentClasses:
      "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-xl hover:-translate-y-1",
    iconAccent: "text-white",
  },
  editor: {
    label: "Trình soạn thảo",
    description: "Tạo đề thi từ đầu và chỉnh sửa thủ công",
    pathSuffix: "editor",
    accentClasses:
      "bg-slate-100 border-2 border-slate-200 text-slate-800 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1",
    iconAccent: "text-slate-400",
  },
};

export default function QuestionMethodSelector() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingMethod, setSavingMethod] = useState("");
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [switchingMethod, setSwitchingMethod] = useState(false);

  const loadExam = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const response = await getExamDetail(examId);
      setExam(normalizeExam(response));
      setError("");
    } catch (err) {
      console.error("Không thể tải thông tin đề thi:", err);
      setError("Không thể tải thông tin đề thi.");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const loadQuestionCount = useCallback(async () => {
    if (!examId) return;
    setLoadingQuestions(true);
    try {
      const questions = await listQuestions({ examId });
      setQuestionCount(questions.length);
    } catch (err) {
      console.error("Không thể tải danh sách câu hỏi:", err);
    } finally {
      setLoadingQuestions(false);
    }
  }, [examId]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  useEffect(() => {
    loadQuestionCount();
  }, [loadQuestionCount]);

  const handleSelectMethod = async (method) => {
    if (!examId || !method) return;
    setError("");

    const target = METHOD_TARGETS[method];
    if (!target) {
      setError("Phương thức không hợp lệ.");
      return;
    }

    if (exam?.question_creation_method) {
      if (exam.question_creation_method === method) {
        navigate(`/dashboard/teacher/exams/${examId}/questions/${target.pathSuffix}`);
        return;
      }
      setError(
        `Bạn đã chọn phương thức "${METHOD_TARGETS[exam.question_creation_method].label}". Không thể thay đổi phương thức khác.`
      );
      return;
    }

    try {
      setSavingMethod(method);
      await updateExam(examId, { question_creation_method: method });
      setExam((prev) => ({
        ...(prev || {}),
        question_creation_method: method,
      }));
      navigate(`/dashboard/teacher/exams/${examId}/questions/${target.pathSuffix}`);
    } catch (err) {
      setError(err?.body?.message || err?.message || "Không thể lưu phương thức tạo câu hỏi.");
    } finally {
      setSavingMethod("");
    }
  };

  const handleSwitchMethod = async () => {
    if (!examId || !exam?.question_creation_method) return;
    const targetMethod =
      exam.question_creation_method === "text"
        ? "editor"
        : exam.question_creation_method === "editor"
        ? "text"
        : null;

    if (!targetMethod) return;

    const targetLabel = METHOD_TARGETS[targetMethod]?.label || targetMethod;
    const confirmMessage = `Thao tác này sẽ xóa ${
      questionCount
    } câu hỏi hiện có và chuyển sang phương thức "${targetLabel}". Bạn có chắc chắn muốn tiếp tục?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSwitchingMethod(true);
      await switchQuestionCreationMethod(examId, targetMethod);
      await Promise.all([loadExam(), loadQuestionCount()]);
      navigate(`/dashboard/teacher/exams/${examId}/questions/${METHOD_TARGETS[targetMethod].pathSuffix}`, {
        replace: true,
      });
    } catch (err) {
      setError(err?.body?.message || err?.message || "Không thể chuyển phương thức tạo câu hỏi.");
    } finally {
      setSwitchingMethod(false);
    }
  };

  const isEditing = Boolean(exam?.question_creation_method);
  const pageTitle = isEditing ? "Chỉnh sửa đề thi" : "Tạo đề thi mới";
  const currentMethod = exam?.question_creation_method ?? null;
  const alternateMethod =
    currentMethod === "text" ? "editor" : currentMethod === "editor" ? "text" : null;

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-64">
          <FiLoader className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/dashboard/teacher/exams")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <FiArrowLeft />
            Quay lại danh sách đề thi
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{pageTitle}</h1>
          <p className="text-slate-600">{exam?.title || "Đề thi"}</p>
        </div>

        {exam?.question_creation_method && (
          <div className="w-full max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-800">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="h-5 w-5 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">
                  Bạn đã chọn phương thức:{" "}
                  {METHOD_TARGETS[exam.question_creation_method]?.label || "Không xác định"}
                </p>
                <p className="mt-1 text-emerald-700/80">
                  {loadingQuestions
                    ? "Đang kiểm tra số lượng câu hỏi..."
                    : `Hiện có ${questionCount} câu hỏi đã được tạo bằng phương thức này.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/dashboard/teacher/exams/${examId}/questions/${METHOD_TARGETS[exam.question_creation_method]?.pathSuffix}`
                    )
                  }
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Tiếp tục
                </button>
                {alternateMethod && (
                  <button
                    type="button"
                    disabled={switchingMethod}
                    onClick={handleSwitchMethod}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {switchingMethod ? (
                      <FiLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      <FiRefreshCcw className="h-4 w-4" />
                    )}
                    Chuyển sang {METHOD_TARGETS[alternateMethod]?.label || "phương thức khác"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <FiInfo className="h-4 w-4 mt-1" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full px-4">
          {Object.entries(METHOD_TARGETS).map(([methodKey, config]) => {
            const isDisabled =
              (!!exam?.question_creation_method && exam.question_creation_method !== methodKey) ||
              switchingMethod;
            const isSelected = exam?.question_creation_method === methodKey;
            const isSaving = savingMethod === methodKey;

            return (
              <button
                key={methodKey}
                type="button"
                onClick={() => handleSelectMethod(methodKey)}
                disabled={isDisabled || isSaving}
                className={`flex-1 relative overflow-hidden rounded-2xl p-8 shadow-lg transition-all duration-300 ${
                  config.accentClasses
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="relative z-10 text-left">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    {config.label}
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-800">
                        <FiCheckCircle /> Đã chọn
                      </span>
                    )}
                  </h3>
                  <p className="text-sm mb-6 opacity-90">{config.description}</p>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <FiFileText className={`w-16 h-16 ${config.iconAccent}`} />
                      {methodKey === "text" ? (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          &lt;/&gt;
                        </div>
                      ) : (
                        <FiEdit className="absolute bottom-0 right-0 w-8 h-8 text-indigo-500" />
                      )}
                    </div>
                  </div>
                </div>
                {isSaving && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <FiLoader className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

