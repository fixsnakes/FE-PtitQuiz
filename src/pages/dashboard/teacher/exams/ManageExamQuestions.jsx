import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUp,
  FiArrowDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiPlus,
  FiSave,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";
import {
  listQuestions,
  createQuestion as createQuestionApi,
  updateQuestion as updateQuestionApi,
  deleteQuestion as deleteQuestionApi,
  reorderQuestions as reorderQuestionsApi,
} from "../../../../services/questionService";

const QUESTION_TYPES = [
  { value: "single_choice", label: "Trắc nghiệm (1 đáp án đúng)" },
  { value: "multiple_choice", label: "Trắc nghiệm (nhiều đáp án đúng)" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

const ANSWER_TYPES = ["single_choice", "multiple_choice"];

const QUESTION_METHOD_LABELS = {
  text: "Văn bản",
  editor: "Trình soạn thảo",
};

const makeBlankAnswers = (count = 4) =>
  Array.from({ length: count }, (_, index) => ({
    text: "",
    is_correct: index === 0,
  }));

const TRUE_FALSE_PRESET = [
  { text: "Đúng", is_correct: true },
  { text: "Sai", is_correct: false },
];

const createDefaultFormState = (type = "single_choice") => ({
  question_text: "",
  type,
  difficulty: "medium",
  image_url: "",
  answers: makeBlankAnswers(),
});

function normalizeQuestion(raw) {
  if (!raw) return null;
  const answers = (raw.answers ?? raw.question_answers ?? []).map(
    (answer, index) => ({
      id: answer.id ?? answer.answer_id ?? answer._id ?? `${index}`,
      text: answer.text ?? answer.answer_text ?? answer.content ?? "",
      is_correct: Boolean(
        answer.is_correct ?? answer.correct ?? answer.isCorrect ?? answer.is_true
      ),
      order: answer.order ?? answer.answer_order ?? index + 1,
    })
  );

  return {
    id: raw.id ?? raw.question_id ?? raw._id,
    question_text:
      raw.question_text ?? raw.question ?? raw.text ?? "Không có tiêu đề",
    type: raw.type ?? raw.question_type ?? "single_choice",
    order: raw.order ?? raw.question_order ?? raw.position ?? 0,
    difficulty: raw.difficulty ?? "medium",
    image_url: raw.image_url ?? "",
    answers,
  };
}

function normalizeExam(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.exam_id ?? raw._id,
    title: raw.title ?? raw.name ?? "Đề thi",
    minutes: raw.minutes ?? raw.duration ?? null,
    start_time: raw.start_time ?? raw.startTime ?? null,
    end_time: raw.end_time ?? raw.endTime ?? null,
    class_name: raw.class?.className ?? raw.className ?? raw.class_name,
    question_creation_method:
      raw.question_creation_method ??
      raw.questionMethod ??
      raw.question_method ??
      null,
  };
}

function AnswersEditor({ type, answers, onChange, disabled }) {
  if (!ANSWER_TYPES.includes(type)) {
    return null;
  }

  const updateAnswer = (index, partial) => {
    const next = answers.map((answer, idx) =>
      idx === index ? { ...answer, ...partial } : answer
    );
    onChange(next);
  };

  const toggleCorrect = (index) => {
    if (type === "single_choice") {
      // Single choice: chỉ cho phép 1 đáp án đúng
      const next = answers.map((answer, idx) => ({
        ...answer,
        is_correct: idx === index,
      }));
      onChange(next);
    } else if (type === "multiple_choice") {
      // Multiple choice: cho phép nhiều đáp án đúng
      const next = answers.map((answer, idx) =>
        idx === index ? { ...answer, is_correct: !answer.is_correct } : answer
      );
      onChange(next);
    }
  };

  const addAnswer = () => {
    if (type !== "single_choice" && type !== "multiple_choice") return;
    onChange([...answers, { text: "", is_correct: false }]);
  };

  const removeAnswer = (index) => {
    if (answers.length <= 2) return;
    const next = answers.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const minOptions = (type === "single_choice" || type === "multiple_choice") ? 2 : 2;

  return (
    <div className="space-y-3">
      {answers.map((answer, index) => (
        <div key={index} className="flex items-start gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => toggleCorrect(index)}
            className={`mt-2 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
              answer.is_correct
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
            title="Đánh dấu đáp án đúng"
          >
            {String.fromCharCode(65 + index)}
          </button>

          <div className="flex-1">
            <input
              type="text"
              disabled={disabled}
              value={answer.text}
              onChange={(event) =>
                updateAnswer(index, { text: event.target.value })
              }
              placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              {answer.is_correct ? "Đáp án đúng" : "Đáp án sai"}
            </p>
          </div>

          {(type === "single_choice" || type === "multiple_choice") && answers.length > minOptions && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeAnswer(index)}
              className="mt-2 rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
              title="Xóa đáp án"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      ))}

      {(type === "single_choice" || type === "multiple_choice") && (
        <button
          type="button"
          disabled={disabled}
          onClick={addAnswer}
          className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <FiPlus />
          Thêm đáp án
        </button>
      )}
    </div>
  );
}

export default function ManageExamQuestions() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [formState, setFormState] = useState(() =>
    createDefaultFormState("single_choice")
  );
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editForm, setEditForm] = useState(() =>
    createDefaultFormState("single_choice")
  );
  const [updating, setUpdating] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  useEffect(() => {
    if (!examId) return;
    fetchExam();
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  useEffect(() => {
    if (loadingExam) return;
    if (!examId) return;
    if (!exam) return;

    const method = exam.question_creation_method;
    if (!method) {
      navigate(`/dashboard/teacher/exams/${examId}/questions`, { replace: true });
      return;
    }
    if (method !== "editor") {
      navigate(`/dashboard/teacher/exams/${examId}/questions/${method}`, { replace: true });
    }
  }, [exam, examId, loadingExam, navigate]);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort(
      (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
    );
  }, [questions]);

  const requiresAnswers = (type) => ANSWER_TYPES.includes(type);

  const resetForm = () => {
    setFormState((prev) => createDefaultFormState(prev.type));
  };

  async function fetchExam() {
    setLoadingExam(true);
    try {
      const response = await getExamDetail(examId);
      setExam(normalizeExam(response));
    } catch (err) {
      setError(
        err?.body?.message ||
          err?.message ||
          "Không thể tải thông tin đề thi, vui lòng thử lại."
      );
    } finally {
      setLoadingExam(false);
    }
  }

  async function fetchQuestions() {
    setLoadingQuestions(true);
    try {
      const response = await listQuestions({ examId });
      const normalized = response.map(normalizeQuestion).filter(Boolean);
      setQuestions(normalized);
      // Tự động chọn câu hỏi đầu tiên khi load xong
      if (normalized.length > 0 && selectedQuestionId === null) {
        setSelectedQuestionId(normalized[0].id);
      }
    } catch (err) {
      setError(
        err?.body?.message ||
          err?.message ||
          "Không thể tải danh sách câu hỏi."
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  function validateForm(payload) {
    if (!payload.question_text?.trim()) {
      throw new Error("Vui lòng nhập nội dung câu hỏi.");
    }
    if (requiresAnswers(payload.type)) {
      const answers = payload.answers ?? [];
      if (answers.length < 2) {
        throw new Error("Cần ít nhất 2 đáp án cho câu hỏi trắc nghiệm.");
      }
      const correctCount = answers.filter((answer) => answer.is_correct).length;
      if (correctCount === 0) {
        throw new Error("Vui lòng chọn ít nhất 1 đáp án đúng.");
      }
      if (payload.type === "single_choice" && correctCount !== 1) {
        throw new Error("Câu hỏi trắc nghiệm (1 đáp án đúng) phải có đúng 1 đáp án đúng.");
      }
      if (answers.some((answer) => !answer.text?.trim())) {
        throw new Error("Đáp án không được để trống.");
      }
    } else {
      delete payload.answers;
    }
    return payload;
  }

  const handleFormChange = (field, value, mode = "create") => {
    const updater = mode === "edit" ? setEditForm : setFormState;
    updater((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type") {
        // Chỉ cho phép single_choice hoặc multiple_choice
        if (value === "single_choice" || value === "multiple_choice") {
          next.answers = makeBlankAnswers();
        } else {
          // Nếu type không hợp lệ, đặt về single_choice
          next.type = "single_choice";
          next.answers = makeBlankAnswers();
        }
      }
      return next;
    });
  };

  const handleAnswersChange = (answers, mode = "create") => {
    if (mode === "edit") {
      setEditForm((prev) => ({ ...prev, answers }));
    } else {
      setFormState((prev) => ({ ...prev, answers }));
    }
  };

  const buildPayloadFromForm = (state, extra = {}) => {
    const payload = {
      question_text: state.question_text?.trim(),
      type: state.type,
      difficulty: state.difficulty || undefined,
      image_url: state.image_url || undefined,
      answers: state.answers?.map((answer) => ({
        text: answer.text?.trim(),
        is_correct: Boolean(answer.is_correct),
      })),
      ...extra,
    };
    return validateForm(payload);
  };

  const handleCreateQuestion = async () => {
    try {
      setCreating(true);
      setError("");
      const payload = buildPayloadFromForm(formState, {
        exam_id: examId,
        order: sortedQuestions.length + 1,
      });
      const response = await createQuestionApi(payload);
      const newQuestionId =
        response?.id ?? response?.question_id ?? response?.data?.id ?? null;
      setMessage("Đã thêm câu hỏi mới.");
      resetForm();
      await fetchQuestions();
      // Tự động chọn câu hỏi mới sau khi tạo
      if (newQuestionId) {
        setTimeout(() => {
          setSelectedQuestionId(newQuestionId);
          const element = document.getElementById(`question-${newQuestionId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      }
    } catch (err) {
      setError(err?.body?.message || err?.message || "Không thể tạo câu hỏi.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (question) => {
    setEditingQuestionId(question.id);
    setSelectedQuestionId(question.id);
    setEditForm({
      question_text: question.question_text,
      type: question.type,
      difficulty: question.difficulty ?? "medium",
      image_url: question.image_url ?? "",
      answers: requiresAnswers(question.type)
        ? question.answers?.map((answer) => ({
            id: answer.id,
            text: answer.text,
            is_correct: answer.is_correct,
          })) ?? makeBlankAnswers()
        : [],
    });
  };

  const cancelEdit = () => {
    setEditingQuestionId(null);
    setSelectedQuestionId(null);
    setEditForm(createDefaultFormState());
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestionId) return;
    try {
      setUpdating(true);
      setError("");
      const payload = buildPayloadFromForm(editForm);
      await updateQuestionApi(editingQuestionId, payload);
      setMessage("Đã cập nhật câu hỏi.");
      const currentSelectedId = editingQuestionId;
      cancelEdit();
      fetchQuestions();
      // Giữ lại selection sau khi update
      setTimeout(() => {
        setSelectedQuestionId(currentSelectedId);
      }, 100);
    } catch (err) {
      setError(err?.body?.message || err?.message || "Không thể cập nhật.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    try {
      await deleteQuestionApi(questionId);
      setMessage("Đã xóa câu hỏi.");
      if (selectedQuestionId === questionId) {
        setSelectedQuestionId(null);
      }
      fetchQuestions();
    } catch (err) {
      setError(err?.body?.message || err?.message || "Không thể xóa câu hỏi.");
    }
  };

  const handleMoveQuestion = async (question, direction) => {
    const currentIndex = sortedQuestions.findIndex(
      (item) => item.id === question.id
    );
    if (currentIndex === -1) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= sortedQuestions.length) return;

    // Giữ lại selection nếu câu hỏi đang được chọn
    const wasSelected = selectedQuestionId === question.id;

    // Tạo mảng mới với order đã cập nhật ngay lập tức
    const nextOrder = [...sortedQuestions];
    const [removed] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, removed);

    // Cập nhật order cho từng câu hỏi ngay lập tức
    const updatedQuestions = nextOrder.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    // Cập nhật state ngay lập tức để UI phản hồi ngay
    setQuestions(updatedQuestions);
    
    // Giữ lại selection sau khi di chuyển
    if (wasSelected) {
      setSelectedQuestionId(question.id);
    }
    
    setReorderLoading(true);
    
    try {
      await reorderQuestionsApi(
        examId,
        updatedQuestions.map((item) => ({
          question_id: item.id,
          order: item.order,
        }))
      );
      setMessage("Đã cập nhật thứ tự câu hỏi.");
    } catch (err) {
      setError(
        err?.body?.message || err?.message || "Không thể sắp xếp câu hỏi."
      );
      // Nếu API thất bại, reload lại từ server
      fetchQuestions();
    } finally {
      setReorderLoading(false);
    }
  };

  const renderQuestionCard = (question) => {
    const isEditing = editingQuestionId === question.id;
    const isSelected = selectedQuestionId === question.id;
    return (
      <div
        id={`question-${question.id}`}
        key={`${question.id}-${question.order}`}
        className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 ease-in-out ${
          isSelected && !isEditing ? "ring-2 ring-indigo-300 border-indigo-400" : ""
        }`}
        style={{
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Câu hỏi {question.order || sortedQuestions.indexOf(question) + 1}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {question.question_text}
            </h3>
            <p className="text-sm text-slate-500">
              {QUESTION_TYPES.find((type) => type.value === question.type)
                ?.label || "Không xác định"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleMoveQuestion(question, -1)}
              disabled={reorderLoading || sortedQuestions.findIndex((item) => item.id === question.id) === 0}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {reorderLoading ? <FiLoader className="animate-spin" /> : <FiArrowUp />} Lên
            </button>
            <button
              type="button"
              onClick={() => handleMoveQuestion(question, 1)}
              disabled={reorderLoading || sortedQuestions.findIndex((item) => item.id === question.id) === sortedQuestions.length - 1}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {reorderLoading ? <FiLoader className="animate-spin" /> : <FiArrowDown />} Xuống
            </button>
            <button
              type="button"
              onClick={() => startEdit(question)}
              className="inline-flex items-center gap-1 rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              <FiEdit3 /> Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => handleDeleteQuestion(question.id)}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <FiTrash2 /> Xóa
            </button>
          </div>
        </div>

        {requiresAnswers(question.type) && question.answers?.length > 0 && (
          <div className="mt-4 space-y-2">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  answer.is_correct
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {answer.is_correct ? <FiCheckCircle /> : <FiAlertTriangle />}
                <span className="font-medium">{answer.text}</span>
              </div>
            ))}
          </div>
        )}

        {isEditing && (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-sm font-semibold text-indigo-700">
              Đang chỉnh sửa câu hỏi
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nội dung câu hỏi
                </label>
                <textarea
                  value={editForm.question_text}
                  onChange={(event) =>
                    handleFormChange("question_text", event.target.value, "edit")
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Loại câu hỏi
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(event) =>
                      handleFormChange("type", event.target.value, "edit")
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {QUESTION_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Độ khó
                  </label>
                  <select
                    value={editForm.difficulty}
                    onChange={(event) =>
                      handleFormChange("difficulty", event.target.value, "edit")
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <AnswersEditor
                type={editForm.type}
                answers={editForm.answers}
                onChange={(answers) => handleAnswersChange(answers, "edit")}
                disabled={updating}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleUpdateQuestion}
                  disabled={updating}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
                >
                  {updating && <FiLoader className="animate-spin" />}
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            Thêm câu hỏi
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Xây dựng ngân hàng câu hỏi cho đề thi
          </h2>
        </div>
        <button
          type="button"
          onClick={handleCreateQuestion}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
        >
          {creating ? <FiLoader className="animate-spin" /> : <FiPlus />}
          Lưu câu hỏi
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Nội dung câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formState.question_text}
            onChange={(event) =>
              handleFormChange("question_text", event.target.value)
            }
            placeholder="Nhập câu hỏi..."
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Loại câu hỏi
            </label>
            <select
              value={formState.type}
              onChange={(event) =>
                handleFormChange("type", event.target.value)
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {QUESTION_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Độ khó
            </label>
            <select
              value={formState.difficulty}
              onChange={(event) =>
                handleFormChange("difficulty", event.target.value)
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnswersEditor
          type={formState.type}
          answers={formState.answers}
          onChange={handleAnswersChange}
          disabled={creating}
        />
      </div>
    </section>
  );

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              <FiArrowLeft /> Quay lại
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Quản lý câu hỏi
            </p>
            {loadingExam ? (
              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                Đang tải...
              </h1>
            ) : (
              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                {exam?.title || "Đề thi"}
              </h1>
            )}
            {exam?.minutes && (
              <p className="text-sm text-slate-500">
                Thời lượng: {exam.minutes} phút
              </p>
            )}
            {exam?.question_creation_method && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Phương thức:{" "}
                {QUESTION_METHOD_LABELS[exam.question_creation_method] || "Không xác định"}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/teacher/exams/${examId}/questions`)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FiArrowLeft />
              Chọn phương thức khác
            </button>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              Trình soạn thảo - Tạo và chỉnh sửa câu hỏi thủ công
            </div>
            <button
              type="button"
              onClick={() => navigate("/dashboard/teacher/exams")}
              disabled={sortedQuestions.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-700"
            >
              <FiSave />
              Lưu đề thi ({sortedQuestions.length} câu hỏi)
            </button>
          </div>
        </header>

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Cột trái: Form tạo câu hỏi */}
          <div className="space-y-6">
            {renderForm()}
          </div>

          {/* Cột phải: Danh sách ô số và chi tiết câu hỏi */}
          <div className="sticky top-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Danh sách câu hỏi
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {sortedQuestions.length} câu hỏi
                  </h2>
                </div>
              </div>

              {loadingQuestions ? (
                <div className="flex items-center gap-2 py-10 text-slate-500">
                  <FiLoader className="animate-spin" />
                  Đang tải câu hỏi...
                </div>
              ) : sortedQuestions.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  Chưa có câu hỏi nào cho đề này. Hãy sử dụng biểu mẫu bên trái để
                  thêm câu hỏi đầu tiên.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Danh sách câu hỏi</h3>
                    <div className="flex flex-wrap gap-2">
                      {sortedQuestions.map((question, index) => {
                        const isSelected = selectedQuestionId === question.id;
                        const isEditing = editingQuestionId === question.id;
                        return (
                          <button
                            key={`${question.id}-${question.order}`}
                            type="button"
                            onClick={() => {
                              setSelectedQuestionId(question.id);
                            }}
                            className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out transform ${
                              isSelected || isEditing
                                ? "bg-indigo-600 text-white ring-2 ring-indigo-300 scale-110"
                                : "bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:scale-105"
                            }`}
                            style={{
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chỉ hiển thị câu hỏi được chọn */}
                  {selectedQuestionId && sortedQuestions.find((q) => q.id === selectedQuestionId) && (
                    <div className="mt-6">
                      {renderQuestionCard(
                        sortedQuestions.find((q) => q.id === selectedQuestionId)
                      )}
                    </div>
                  )}

                  {!selectedQuestionId && sortedQuestions.length > 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Chọn một câu hỏi để xem chi tiết
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

