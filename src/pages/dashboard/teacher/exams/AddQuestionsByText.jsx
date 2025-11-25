import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiLoader,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";
import {
  createQuestion as createQuestionApi,
  listQuestions,
} from "../../../../services/questionService";

function parseExamText(text) {
  const lines = text.split("\n");
  const questions = [];
  const errors = [];
  let currentQuestion = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      if (currentQuestion) {
        questions.push(currentQuestion);
        currentQuestion = null;
      }
    } else if (trimmedLine.startsWith("*") || /^[A-Z]\./.test(trimmedLine)) {
      if (!currentQuestion) {
        errors.push({
          line: index + 1,
          content: line,
          message: "Đáp án không thuộc câu hỏi nào.",
        });
        return;
      }

      if (currentQuestion.type !== "MCQ") {
        errors.push({
          line: index + 1,
          content: line,
          message: "Câu hỏi điền từ không hỗ trợ đáp án A/B/C.",
        });
        return;
      }

      const isCorrect = trimmedLine.startsWith("*");
      const optionText = line.replace(/^\*?[A-Z]\.\s*/, "").replace(/<br \/>/g, "\n");
      currentQuestion.options.push({
        text: optionText,
        isCorrect,
      });
    } else if (trimmedLine.length > 0) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        type: "MCQ",
        text: line.replace(/<br \/>/g, "\n"),
        options: [],
      };
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return { questions, errors };
}

const ExamInstructions = () => (
  <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-700">
    <h4 className="font-semibold text-gray-800">Quy tắc soạn câu hỏi</h4>
    <ul className="list-disc list-inside space-y-1">
      <li>Mỗi câu hỏi cách nhau 1 dòng trống.</li>
      <li>
        Đáp án đúng có dấu <span className="font-semibold text-blue-600">*</span>{" "}
        ở đầu (ví dụ: <code className="rounded bg-gray-200 px-1">*B. Đáp án đúng</code>).
      </li>
      <li>
        Xuống dòng trong câu hỏi/đáp án hãy dùng{" "}
        <code className="rounded bg-gray-200 px-1">&lt;br /&gt;</code>
      </li>
    </ul>
  </div>
);

function ExamPreview({
  questions,
  errors,
  hasContent,
  selectedQuestionIndex,
  onSelectQuestion,
  savedQuestions,
  onSaveQuestion,
  savingQuestionIndex,
}) {
  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Vui lòng soạn câu hỏi theo hướng dẫn.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <h4 className="font-semibold">Lỗi cú pháp</h4>
          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                Dòng {error.line}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Danh sách câu hỏi</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {questions.map((question, questionIndex) => {
            const isSaved = savedQuestions.has(questionIndex);
            const isSelected = selectedQuestionIndex === questionIndex;
            return (
              <button
                key={questionIndex}
                type="button"
                onClick={() => onSelectQuestion(questionIndex)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                    : isSaved
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
                }`}
              >
                {questionIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      {selectedQuestionIndex !== null && questions[selectedQuestionIndex] && (
        <div className="rounded-lg border-2 border-indigo-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-600">
              Câu {selectedQuestionIndex + 1} (Một đáp án)
            </p>
            {!questions[selectedQuestionIndex]?.isExisting && (
              <button
                type="button"
                onClick={() => onSaveQuestion(selectedQuestionIndex)}
                disabled={
                  savingQuestionIndex === selectedQuestionIndex ||
                  savedQuestions.has(selectedQuestionIndex)
                }
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  savedQuestions.has(selectedQuestionIndex)
                    ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                }`}
              >
                {savingQuestionIndex === selectedQuestionIndex ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Đang lưu...
                  </>
                ) : savedQuestions.has(selectedQuestionIndex) ? (
                  <>
                    <FiCheckCircle />
                    Đã lưu
                  </>
                ) : (
                  <>
                    <FiSave />
                    Lưu câu hỏi
                  </>
                )}
              </button>
            )}
            {questions[selectedQuestionIndex]?.isExisting && (
              <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700">
                <FiCheckCircle />
                Đã lưu
              </div>
            )}
          </div>

          <p className="font-semibold text-gray-800 whitespace-pre-wrap mb-4">
            {questions[selectedQuestionIndex].text}
          </p>

          <div className="space-y-2">
            {questions[selectedQuestionIndex].options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                  option.isCorrect
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${
                    option.isCorrect
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {option.isCorrect ? (
                    <FiCheckCircle className="h-5 w-5" />
                  ) : (
                    <FiXCircle className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`flex-1 whitespace-pre-wrap ${
                    option.isCorrect
                      ? "font-semibold text-emerald-800"
                      : "text-red-800"
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedQuestionIndex === null && questions.length > 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Chọn một câu hỏi để xem chi tiết
        </div>
      )}
    </div>
  );
}

function normalizeExam(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.exam_id ?? raw._id,
    title: raw.title ?? raw.name ?? "Đề thi",
  };
}

function normalizeExistingQuestion(raw) {
  if (!raw) return null;
  const answers = raw.answers ?? raw.question_answers ?? [];
  return {
    id: raw.id ?? raw.question_id ?? raw._id,
    text: raw.question_text ?? raw.question ?? raw.text ?? "",
    type: raw.type ?? "single_choice",
    options: answers.map((answer) => ({
      text: answer.text ?? answer.answer_text ?? answer.content ?? "",
      isCorrect: Boolean(
        answer.is_correct ?? answer.correct ?? answer.isCorrect ?? answer.is_true
      ),
    })),
  };
}

export default function AddQuestionsByText() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);
  const [rawText, setRawText] = useState("");
  const [parsedExam, setParsedExam] = useState({ questions: [], errors: [] });
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [savingQuestionIndex, setSavingQuestionIndex] = useState(null);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!examId) return;
      setLoadingExam(true);
      try {
        const examResponse = await getExamDetail(examId);
        setExam(normalizeExam(examResponse));

        const questionsResponse = await listQuestions({ examId });
        const normalized = (questionsResponse ?? [])
          .map(normalizeExistingQuestion)
          .filter(Boolean);
        setExistingQuestions(normalized);
        setExistingCount(normalized.length);
        // Tự động chọn câu hỏi đầu tiên nếu có
        if (normalized.length > 0 && selectedQuestionIndex === null) {
          setSelectedQuestionIndex(0);
        }
      } catch (err) {
        console.error("Không thể tải thông tin đề thi:", err);
      } finally {
        setLoadingExam(false);
      }
    }
    loadData();
  }, [examId]);

  useEffect(() => {
    const parsed = parseExamText(rawText);
    setParsedExam(parsed);
    const totalQuestions = existingQuestions.length + parsed.questions.length;
    // Reset selected question if it's out of bounds
    if (selectedQuestionIndex !== null && selectedQuestionIndex >= totalQuestions) {
      setSelectedQuestionIndex(null);
    }
    // Reset saved questions for new questions only (existing questions are always saved)
    if (parsed.questions.length === 0) {
      setSavedQuestions(new Set());
    }
    // Tự động chọn câu hỏi đầu tiên khi có câu hỏi mới hoặc khi load lại
    if (totalQuestions > 0 && selectedQuestionIndex === null) {
      setSelectedQuestionIndex(0);
    }
  }, [rawText, selectedQuestionIndex, existingQuestions.length]);

  const hasContent = useMemo(
    () => rawText.trim().length > 0 || existingQuestions.length > 0,
    [rawText, existingQuestions.length]
  );

  // Merge existing questions và parsed questions
  const allQuestions = useMemo(() => {
    return [
      ...existingQuestions.map((q) => ({ ...q, isExisting: true })),
      ...parsedExam.questions.map((q) => ({ ...q, isExisting: false })),
    ];
  }, [existingQuestions, parsedExam.questions]);

  // Cập nhật savedQuestions để bao gồm tất cả existing questions
  useEffect(() => {
    const existingIndices = new Set(
      Array.from({ length: existingQuestions.length }, (_, i) => i)
    );
    setSavedQuestions((prev) => {
      const newSet = new Set(existingIndices);
      // Giữ lại các câu hỏi mới đã lưu (index offset by existingQuestions.length)
      prev.forEach((index) => {
        if (index >= existingQuestions.length) {
          newSet.add(index);
        }
      });
      return newSet;
    });
  }, [existingQuestions.length]);

  const validateQuestion = (questionIndex) => {
    const question = allQuestions[questionIndex];
    if (!question || question.isExisting) return true; // Existing questions are already validated

    if (question.options.length < 2) {
      alert("Mỗi câu hỏi phải có ≥ 2 lựa chọn.");
      return false;
    }

    if (!question.options.some((option) => option.isCorrect)) {
      alert("Mỗi câu hỏi phải có ít nhất 1 đáp án đúng.");
      return false;
    }

    return true;
  };

  const handleSaveQuestion = async (questionIndex) => {
    if (savedQuestions.has(questionIndex)) return;
    
    const question = allQuestions[questionIndex];
    if (!question || question.isExisting) return;
    
    if (!validateQuestion(questionIndex)) return;

    setSavingQuestionIndex(questionIndex);

    try {
      // Tính số câu hỏi mới đã được lưu trong session này (không bao gồm existing)
      const newlySavedCount = savedQuestions.size - existingQuestions.length;
      
      // Tự động phát hiện single_choice hay multiple_choice dựa trên số đáp án đúng
      const correctCount = question.options.filter((opt) => opt.isCorrect).length;
      const questionType = correctCount === 1 ? "single_choice" : "multiple_choice";
      
      await createQuestionApi({
        exam_id: examId,
        question_text: question.text.trim(),
        type: questionType,
        order: existingQuestions.length + newlySavedCount + 1,
        answers: question.options.map((option) => ({
          text: option.text.trim(),
          is_correct: option.isCorrect,
        })),
      });

      setSavedQuestions((prev) => new Set([...prev, questionIndex]));
      
      // Reload existing questions để đồng bộ với database
      const questionsResponse = await listQuestions({ examId });
      const normalized = (questionsResponse ?? [])
        .map(normalizeExistingQuestion)
        .filter(Boolean);
      setExistingQuestions(normalized);
      // Cập nhật existingCount để khớp với số lượng câu hỏi đã load
      setExistingCount(normalized.length);
    } catch (error) {
      const message =
        error?.body?.message || error?.message || "Không thể lưu câu hỏi. Vui lòng thử lại.";
      alert(message);
    } finally {
      setSavingQuestionIndex(null);
    }
  };

  const handleSaveAll = async () => {
    // Chỉ lưu các câu hỏi mới (không phải existing)
    const unsavedQuestions = allQuestions
      .map((_, index) => index)
      .filter((index) => !savedQuestions.has(index) && !allQuestions[index].isExisting);

    if (unsavedQuestions.length === 0) {
      alert("Tất cả câu hỏi đã được lưu.");
      return;
    }

    // Validate tất cả câu hỏi trước
    for (const index of unsavedQuestions) {
      if (!validateQuestion(index)) {
        return;
      }
    }

    // Lưu từng câu hỏi
    let savedCount = 0;
    // Tính số câu hỏi mới đã được lưu trong session này (không bao gồm existing)
    const newlySavedCount = savedQuestions.size - existingQuestions.length;
    
    for (const questionIndex of unsavedQuestions) {
      const question = allQuestions[questionIndex];
      if (!question || question.isExisting) continue;
      
      try {
        setSavingQuestionIndex(questionIndex);
        // Tự động phát hiện single_choice hay multiple_choice dựa trên số đáp án đúng
        const correctCount = question.options.filter((opt) => opt.isCorrect).length;
        const questionType = correctCount === 1 ? "single_choice" : "multiple_choice";
        
        // Order = số câu hỏi existing + số câu hỏi mới đã lưu + số câu hỏi đang lưu trong batch này
        await createQuestionApi({
          exam_id: examId,
          question_text: question.text.trim(),
          type: questionType,
          order: existingQuestions.length + newlySavedCount + savedCount + 1,
          answers: question.options.map((option) => ({
            text: option.text.trim(),
            is_correct: option.isCorrect,
          })),
        });

        setSavedQuestions((prev) => new Set([...prev, questionIndex]));
        savedCount += 1;
      } catch (error) {
        const message =
          error?.body?.message || error?.message || `Không thể lưu câu hỏi ${questionIndex + 1}.`;
        alert(message);
        break;
      } finally {
        setSavingQuestionIndex(null);
      }
    }

    if (savedCount > 0) {
      alert(`Đã lưu ${savedCount} câu hỏi thành công!`);
      
      // Reload existing questions để đồng bộ với database
      const questionsResponse = await listQuestions({ examId });
      const normalized = (questionsResponse ?? [])
        .map(normalizeExistingQuestion)
        .filter(Boolean);
      setExistingQuestions(normalized);
      // Cập nhật existingCount để khớp với số lượng câu hỏi đã load
      setExistingCount(normalized.length);
    }
  };

  const handleSaveExam = () => {
    if (savedQuestions.size === 0) {
      alert("Vui lòng lưu ít nhất một câu hỏi trước khi quay lại.");
      return;
    }
    navigate("/dashboard/teacher/exams");
  };

  if (loadingExam) {
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
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/teacher/exams/${examId}/questions`)}
              className="rounded-full border border-slate-200 p-2 hover:bg-slate-50"
            >
              <FiArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Thêm câu hỏi bằng văn bản
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {exam?.title || "Đề thi"}
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={
                parsedExam.questions.length === 0 ||
                parsedExam.errors.length > 0 ||
                allQuestions
                  .filter((q) => !q.isExisting)
                  .every((_, index) => savedQuestions.has(existingQuestions.length + index)) ||
                savingQuestionIndex !== null
              }
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700"
            >
              {savingQuestionIndex !== null ? (
                <>
                  <FiLoader className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiSave />
                  Lưu tất cả (
                  {parsedExam.questions.length -
                    (savedQuestions.size - existingQuestions.length)}{" "}
                  câu chưa lưu)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSaveExam}
              disabled={savedQuestions.size === 0}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-700"
            >
              <FiSave />
              Lưu đề thi ({savedQuestions.size} câu đã lưu)
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-200"
              >
                <FiInfo />
                {showInstructions ? "Ẩn" : "Xem"} hướng dẫn
              </button>
              {showInstructions && (
                <div className="mt-3">
                  <ExamInstructions />
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Soạn câu hỏi
              </label>
              <textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder="Ví dụ:&#10;When we went back to the bookstore, the bookseller_ the book we wanted.&#10;A. sold&#10;*B. had sold&#10;C. sells&#10;D. has sold&#10;&#10;By the end of last summer, the farmers_ all the crop.&#10;A. harvested&#10;*B. had harvested&#10;C. harvest&#10;D. are harvested"
                rows={30}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiCalendar />
              Xem trước ({allQuestions.length} câu - {existingQuestions.length} đã lưu,{" "}
              {parsedExam.questions.length} mới)
            </div>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
              <ExamPreview
                questions={allQuestions}
                errors={parsedExam.errors}
                hasContent={hasContent}
                selectedQuestionIndex={selectedQuestionIndex}
                onSelectQuestion={setSelectedQuestionIndex}
                savedQuestions={savedQuestions}
                onSaveQuestion={handleSaveQuestion}
                savingQuestionIndex={savingQuestionIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

