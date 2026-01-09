import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiLoader,
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiFile,
} from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";
import {
  createQuestion as createQuestionApi,
  listQuestions,
  updateQuestion as updateQuestionApi,
} from "../../../../services/questionService";
import { toast } from "react-toastify";
import { parseFile, formatTextForQuestions } from "../../../../utils/fileParser";

const QUESTION_METHOD_LABELS = {
  text: "Văn bản",
  editor: "Trình soạn thảo",
};

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

  const sanitizedQuestions = questions.filter((question) => {
    const hasTitle = question.text?.trim();
    const hasOption = question.options?.some((option) => option.text?.trim());
    return Boolean(hasTitle) || Boolean(hasOption);
  });

  return { questions: sanitizedQuestions, errors };
}

function normalizeOption(option = {}) {
  return {
    text: (option.text ?? option.answer_text ?? option.content ?? "").trim(),
    isCorrect: Boolean(
      option.isCorrect ?? option.is_correct ?? option.correct ?? option.is_true ?? false
    ),
  };
}

function areOptionsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    const optionA = a[index];
    const optionB = b[index];
    if ((optionA.text ?? "").trim() !== (optionB.text ?? "").trim()) {
      return false;
    }
    if (Boolean(optionA.isCorrect) !== Boolean(optionB.isCorrect)) {
      return false;
    }
  }
  return true;
}

function hasQuestionChanged(existingQuestion, parsedQuestion) {
  if (!existingQuestion) return true;
  const existingText = (existingQuestion.text ?? "").trim();
  const parsedText = (parsedQuestion.text ?? "").trim();
  if (existingText !== parsedText) return true;
  if (!areOptionsEqual(existingQuestion.options ?? [], parsedQuestion.options ?? [])) {
    return true;
  }
  return false;
}

function buildRawTextFromQuestions(questions = []) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "";
  }

  const blocks = questions.map((question) => {
    const title = (question.text ?? "").trimEnd();
    const options = (question.options ?? []).map((option, index) => {
      const letter = String.fromCharCode(65 + index);
      const prefix = option.isCorrect ? `*${letter}.` : `${letter}.`;
      const body = (option.text ?? "").trim();
      return `${prefix} ${body}`.trimEnd();
    });
    return [title, ...options].join("\n").trim();
  });

  return blocks.join("\n\n").trim();
}

function updateQuestionInRawText(rawText, questionIndex, updatedQuestion) {
  const parsed = parseExamText(rawText);
  if (!parsed.questions) {
    // Nếu không parse được, trả về rawText mới từ updatedQuestion
    return buildRawTextFromQuestions([updatedQuestion]);
  }

  // Tạo danh sách câu hỏi mới, thay thế câu hỏi tại questionIndex
  const updatedQuestions = [...parsed.questions];
  if (questionIndex < updatedQuestions.length) {
    // Thay thế câu hỏi tại index bằng câu hỏi đã cập nhật
    updatedQuestions[questionIndex] = {
      text: updatedQuestion.text || "",
      options: updatedQuestion.options || [],
      type: "MCQ",
    };
  } else {
    // Nếu index vượt quá, thêm vào cuối
    updatedQuestions.push({
      text: updatedQuestion.text || "",
      options: updatedQuestion.options || [],
      type: "MCQ",
    });
  }

  // Tạo lại rawText từ danh sách câu hỏi đã cập nhật
  return buildRawTextFromQuestions(updatedQuestions);
}

function buildQuestionPayload(question) {
  // Đảm bảo answers luôn được tạo từ options
  const answers = (question.options ?? [])
    .filter((option) => (option.text ?? "").trim().length > 0) // Loại bỏ options rỗng
    .map((option) => ({
      text: (option.text ?? "").trim(),
      is_correct: Boolean(option.isCorrect),
    }));

  // Đảm bảo có ít nhất 2 answers
  if (answers.length < 2) {
    throw new Error("Mỗi câu hỏi phải có ≥ 2 đáp án.");
  }

  // Đảm bảo có ít nhất 1 đáp án đúng
  const correctCount = answers.filter((answer) => answer.is_correct).length;
  if (correctCount === 0) {
    throw new Error("Mỗi câu hỏi phải có ít nhất 1 đáp án đúng.");
  }

  const questionType = correctCount === 1 ? "single_choice" : "multiple_choice";

  const payload = {
    question_text: (question.text ?? "").trim(),
    type: questionType,
    answers, // Luôn gửi answers array
  };

  return payload;
}

const ExamInstructions = () => (
  <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-700">
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
      <li>
        Bạn có thể import file Word (.docx) bằng nút{" "}
        <span className="font-semibold text-indigo-600">Import Word</span>.
        Sau khi import, vui lòng thêm dấu <span className="font-semibold text-blue-600">*</span> vào đáp án đúng.
      </li>
    </ul>

    <div className="mt-4 rounded-lg border border-blue-300 bg-white p-3">
      <h5 className="mb-2 font-semibold text-gray-800">Nội dung mẫu:</h5>
      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
        {`Phần 1

When we went back to the bookstore, the bookseller _ the book we wanted.
A. sold    
*B. had sold    
C. sells     
D. has sold

By the end of last summer, the farmers _ all the crop.
A. harvested    
*B. had harvested   
C. harvest     
D. are harvested`}
      </pre>
    </div>
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
            const isSaved = question.isExisting || savedQuestions.has(questionIndex);
            const isSelected = selectedQuestionIndex === questionIndex;
            return (
              <button
                key={questionIndex}
                type="button"
                onClick={() => onSelectQuestion(questionIndex)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${isSelected
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
          {(() => {
            const question = questions[selectedQuestionIndex];
            const isExisting = question?.isExisting;
            const isNewSaved = !isExisting && savedQuestions.has(selectedQuestionIndex);
            const canUpdateExisting = isExisting && question.hasChanges;

            return (
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-600">
                  Câu {selectedQuestionIndex + 1} (Một đáp án)
                </p>
                {/* {!isExisting && (
                  <button
                    type="button"
                    onClick={() => onSaveQuestion(selectedQuestionIndex)}
                    disabled={
                      savingQuestionIndex === selectedQuestionIndex || isNewSaved
                    }
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${isNewSaved
                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      }`}
                  >
                    {savingQuestionIndex === selectedQuestionIndex ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : isNewSaved ? (
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
                )} */}
                {isExisting &&
                  (canUpdateExisting ? (
                    <button
                      type="button"
                      onClick={() => onSaveQuestion(selectedQuestionIndex)}
                      disabled={savingQuestionIndex === selectedQuestionIndex}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {savingQuestionIndex === selectedQuestionIndex ? (
                        <>
                          <FiLoader className="animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <FiSave />
                          Cập nhật câu hỏi
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <FiCheckCircle />
                      Đã lưu
                    </div>
                  ))}
              </div>
            );
          })()}

          <p className="font-semibold text-gray-800 whitespace-pre-wrap mb-4">
            {questions[selectedQuestionIndex].text}
          </p>

          <div className="space-y-2">
            {questions[selectedQuestionIndex].options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className={`flex items-center gap-3 rounded-lg border-2 p-3 ${option.isCorrect
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-red-300 bg-red-50"
                  }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold ${option.isCorrect
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
                  className={`flex-1 whitespace-pre-wrap ${option.isCorrect
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
    minutes: raw.minutes ?? raw.duration ?? null,
    question_creation_method:
      raw.question_creation_method ??
      raw.questionMethod ??
      raw.question_method ??
      null,
  };
}

function normalizeExistingQuestion(raw) {
  if (!raw) return null;
  const answers = raw.answers ?? raw.question_answers ?? [];
  return {
    id: raw.id ?? raw.question_id ?? raw._id,
    text: (raw.question_text ?? raw.question ?? raw.text ?? "").trim(),
    type: raw.type ?? "single_choice",
    options: answers.map((answer) => ({
      text: (answer.text ?? answer.answer_text ?? answer.content ?? "").trim(),
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
  const [hasManualRawTextChange, setHasManualRawTextChange] = useState(false);
  const [parsedExam, setParsedExam] = useState({ questions: [], errors: [] });
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [savingQuestionIndex, setSavingQuestionIndex] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const refreshExistingQuestions = useCallback(async () => {
    if (!examId) return;
    const questionsResponse = await listQuestions({ examId });
    const normalized = (questionsResponse ?? [])
      .map(normalizeExistingQuestion)
      .filter(Boolean);
    setExistingQuestions(normalized);
    return normalized;
  }, [examId]);

  useEffect(() => {
    async function loadData() {
      if (!examId) return;
      setLoadingExam(true);
      try {
        const examResponse = await getExamDetail(examId);
        setExam(normalizeExam(examResponse));
        await refreshExistingQuestions();
      } catch (err) {
        console.error("Không thể tải thông tin đề thi:", err);
      } finally {
        setLoadingExam(false);
      }
    }
    loadData();
  }, [examId, refreshExistingQuestions]);

  useEffect(() => {
    if (loadingExam) return;
    if (!examId) return;
    if (!exam) return;

    const method = exam.question_creation_method;
    if (!method) {
      navigate(`/dashboard/teacher/exams/${examId}/questions`, { replace: true });
      return;
    }
    if (method !== "text") {
      navigate(`/dashboard/teacher/exams/${examId}/questions/${method}`, { replace: true });
    }
  }, [exam, examId, loadingExam, navigate]);

  useEffect(() => {
    if (hasManualRawTextChange) return;
    if (rawText.trim().length > 0) return;
    if (existingQuestions.length === 0) return;

    const generated = buildRawTextFromQuestions(existingQuestions);
    if (generated) {
      setRawText(generated);
    }
  }, [existingQuestions, hasManualRawTextChange, rawText]);

  useEffect(() => {
    setParsedExam(parseExamText(rawText));
  }, [rawText]);

  const normalizedParsedQuestions = useMemo(() => {
    if (!parsedExam.questions || parsedExam.questions.length === 0) {
      return [];
    }

    return parsedExam.questions.map((parsedQuestion, index) => {
      const text = (parsedQuestion.text ?? "").trim();
      const options = (parsedQuestion.options ?? []).map((option) => normalizeOption(option));
      const existingQuestion = existingQuestions[index];
      const hasChanges = hasQuestionChanged(existingQuestion, { text, options });

      if (existingQuestion) {
        return {
          ...existingQuestion,
          text,
          options,
          isExisting: true,
          hasChanges,
        };
      }

      return {
        id: undefined,
        text,
        options,
        isExisting: false,
        hasChanges: true,
      };
    });
  }, [parsedExam.questions, existingQuestions]);

  const allQuestions = useMemo(() => {
    if (normalizedParsedQuestions.length > 0) {
      const additionalExisting = existingQuestions
        .slice(normalizedParsedQuestions.length)
        .map((question) => ({
          ...question,
          isExisting: true,
          hasChanges: false,
        }));
      return [...normalizedParsedQuestions, ...additionalExisting];
    }
    return existingQuestions.map((question) => ({
      ...question,
      isExisting: true,
      hasChanges: false,
    }));
  }, [normalizedParsedQuestions, existingQuestions]);

  const newQuestionIndexes = useMemo(() => {
    return allQuestions
      .map((question, index) => (!question.isExisting ? index : null))
      .filter((index) => index !== null);
  }, [allQuestions]);

  const unsavedQuestionIndexes = useMemo(() => {
    return allQuestions
      .map((question, index) => {
        if (question.isExisting) {
          return question.hasChanges ? index : null;
        }
        return savedQuestions.has(index) ? null : index;
      })
      .filter((index) => index !== null);
  }, [allQuestions, savedQuestions]);

  const newQuestionsCount = newQuestionIndexes.length;

  useEffect(() => {
    if (allQuestions.length === 0) {
      setSelectedQuestionIndex(null);
      return;
    }
    if (selectedQuestionIndex === null) {
      setSelectedQuestionIndex(0);
      return;
    }
    if (selectedQuestionIndex >= allQuestions.length) {
      setSelectedQuestionIndex(allQuestions.length - 1);
    }
  }, [allQuestions, selectedQuestionIndex]);

  const hasContent = useMemo(
    () => rawText.trim().length > 0 || allQuestions.length > 0,
    [rawText, allQuestions.length]
  );

  const validateQuestion = (questionIndex) => {
    const question = allQuestions[questionIndex];
    if (!question) return false;
    if (question.options.length < 2) {
      toast.error("Mỗi câu hỏi phải có ≥ 2 lựa chọn.", { autoClose: 3000 });
      return false;
    }

    if (!question.options.some((option) => option.isCorrect)) {
      toast.error("Mỗi câu hỏi phải có ít nhất 1 đáp án đúng.", { autoClose: 3000 });
      return false;
    }

    return true;
  };

  const handleSaveQuestion = async (questionIndex) => {
    const question = allQuestions[questionIndex];
    if (!question) return;

    const isExisting = question.isExisting;
    const isAlreadySaved = isExisting ? !question.hasChanges : savedQuestions.has(questionIndex);
    if (isAlreadySaved) return;

    if (!validateQuestion(questionIndex)) return;

    setSavingQuestionIndex(questionIndex);

    try {
      // Tạo payload với đầy đủ thông tin bao gồm answers
      const payload = buildQuestionPayload(question);

      // Đảm bảo payload luôn có answers khi cập nhật
      if (isExisting) {
        if (!payload.answers || !Array.isArray(payload.answers) || payload.answers.length === 0) {
          toast.error("Lỗi: Không thể tạo payload cập nhật vì thiếu đáp án. Vui lòng thử lại.", { autoClose: 3000 });
          return;
        }

        // Đảm bảo có ít nhất 1 đáp án đúng
        const correctCount = payload.answers.filter((a) => a.is_correct).length;
        if (correctCount === 0) {
          toast.error("Lỗi: Phải có ít nhất 1 đáp án đúng.", { autoClose: 3000 });
          return;
        }
      }

      if (isExisting) {
        // Gửi payload cập nhật bao gồm cả answers
        await updateQuestionApi(question.id, payload);
      } else {
        await createQuestionApi({
          exam_id: examId,
          order: existingQuestions.length + 1,
          ...payload,
        });
      }

      if (!isExisting) {
        setSavedQuestions((prev) => new Set([...prev, questionIndex]));
      }

      // Refresh questions và lấy dữ liệu đã cập nhật
      const updatedQuestions = await refreshExistingQuestions();

      // Sau khi refresh, cập nhật rawText để đồng bộ với câu hỏi vừa cập nhật
      // Chỉ cập nhật câu hỏi tại questionIndex để không làm mất các chỉnh sửa khác
      if (isExisting && question.id && updatedQuestions) {
        // Tìm câu hỏi đã cập nhật theo ID trong danh sách mới
        const updatedQuestion = updatedQuestions.find((q) => q.id === question.id);
        if (updatedQuestion) {
          // Cập nhật rawText để phản ánh trạng thái đã lưu của câu hỏi này
          // Sử dụng questionIndex vì nó tương ứng với vị trí trong parsed questions
          setRawText((currentRawText) => {
            return updateQuestionInRawText(currentRawText, questionIndex, updatedQuestion);
          });
        }
      } else if (!isExisting && updatedQuestions) {
        // Đối với câu hỏi mới, sau khi tạo và refresh, regenerate toàn bộ rawText
        // để đảm bảo đồng bộ
        const generated = buildRawTextFromQuestions(updatedQuestions);
        if (generated) {
          setRawText(generated);
          setHasManualRawTextChange(false);
        }
      }

      setSavedQuestions(new Set());
      toast.success("Đã lưu câu hỏi thành công!", { autoClose: 2000 });
    } catch (error) {
      const message =
        error?.body?.message || error?.message || "Không thể lưu câu hỏi. Vui lòng thử lại.";
      toast.error(message, { autoClose: 3000 });
    } finally {
      setSavingQuestionIndex(null);
    }
  };

  const handleSaveAll = async () => {
    if (unsavedQuestionIndexes.length === 0) {
      toast.info("Tất cả câu hỏi đã được lưu.", { autoClose: 2000 });
      return;
    }

    // Validate tất cả câu hỏi trước
    for (const index of unsavedQuestionIndexes) {
      if (!validateQuestion(index)) {
        return;
      }
    }

    // Lưu từng câu hỏi
    let savedCount = 0;
    const baseOrder = existingQuestions.length;
    let createdCount = 0;

    for (const questionIndex of unsavedQuestionIndexes) {
      const question = allQuestions[questionIndex];
      if (!question) continue;

      try {
        setSavingQuestionIndex(questionIndex);
        if (question.isExisting) {
          await updateQuestionApi(question.id, buildQuestionPayload(question));
        } else {
          await createQuestionApi({
            exam_id: examId,
            order: baseOrder + createdCount + 1,
            ...buildQuestionPayload(question),
          });
          createdCount += 1;
        }

        savedCount += 1;
      } catch (error) {
        const message =
          error?.body?.message || error?.message || `Không thể lưu câu hỏi ${questionIndex + 1}.`;
        toast.error(message, { autoClose: 3000 });
        break;
      } finally {
        setSavingQuestionIndex(null);
      }
    }

    if (savedCount > 0) {
      toast.success(`Đã lưu ${savedCount} câu hỏi thành công!`, { autoClose: 2000 });
      await refreshExistingQuestions();
      setSavedQuestions(new Set());
    }
  };

  const handleRawTextChange = (value) => {
    setRawText(value);
    setHasManualRawTextChange(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - only Word (.docx) is supported
    const fileName = file.name.toLowerCase();
    const isValidFile =
      fileName.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isValidFile) {
      toast.error(
        "Định dạng file không được hỗ trợ. Vui lòng chọn file Word (.docx).",
        { autoClose: 3000 }
      );
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadingFile(true);
    try {
      // Parse file
      const extractedText = await parseFile(file);
      
      // Format text for questions
      const formattedText = formatTextForQuestions(extractedText);
      
      if (!formattedText || formattedText.trim().length === 0) {
        toast.warning(
          "Không thể trích xuất nội dung từ file. Vui lòng kiểm tra lại file.",
          { autoClose: 3000 }
        );
        return;
      }

      // Append to existing text or replace
      if (rawText.trim().length > 0) {
        const shouldAppend = window.confirm(
          "Bạn có muốn thêm nội dung từ file vào văn bản hiện tại? "
        );
        if (shouldAppend) {
          setRawText((prev) => {
            const separator = prev.trim().endsWith("\n") ? "" : "\n\n";
            return prev + separator + formattedText;
          });
        } else {
          setRawText(formattedText);
        }
      } else {
        setRawText(formattedText);
      }

      setHasManualRawTextChange(true);
      toast.success(
        `Đã import thành công từ file ${file.name}. Vui lòng kiểm tra và thêm dấu * vào đáp án đúng.`,
        { autoClose: 4000 }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        error.message || "Không thể đọc file. Vui lòng thử lại.",
        { autoClose: 3000 }
      );
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const regenerateRawText = () => {
    const generated = buildRawTextFromQuestions(existingQuestions);
    if (!generated) {
      toast.warning("Hiện không có câu hỏi đã lưu để khôi phục.", { autoClose: 2000 });
      return;
    }
    setHasManualRawTextChange(false);
    setRawText(generated);
    toast.success("Đã khôi phục văn bản từ câu hỏi đã lưu.", { autoClose: 2000 });
  };

  const handleSaveExam = () => {
    if (existingQuestions.length === 0) {
      toast.warning("Vui lòng lưu ít nhất một câu hỏi trước khi quay lại.", { autoClose: 3000 });
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
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/teacher/exams/${examId}/questions`)}
              className="rounded-full border border-slate-200 p-2 hover:bg-slate-50"
            >
              <FiArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="mt-2 text-2xl lg:text-3xl font-bold text-slate-900 break-words">
                {exam?.title || "Đề thi"}
              </h1>
              {exam?.question_creation_method && (
                <p className="mt-1 text-xs font-normal text-emerald-600">
                  Phương thức:{" "}
                  {QUESTION_METHOD_LABELS[exam.question_creation_method] || "Không xác định"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={
                newQuestionsCount === 0 ||
                parsedExam.errors.length > 0 ||
                unsavedQuestionIndexes.length === 0 ||
                savingQuestionIndex !== null
              }
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700 whitespace-nowrap"
            >
              {savingQuestionIndex !== null ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span className="hidden sm:inline">Đang lưu...</span>
                  <span className="sm:hidden">Đang lưu</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span className="hidden md:inline">
                    Lưu tất cả ({unsavedQuestionIndexes.length} câu chưa lưu)
                  </span>
                  <span className="md:hidden">
                    Lưu tất cả ({unsavedQuestionIndexes.length})
                  </span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSaveExam}
              disabled={existingQuestions.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-700 whitespace-nowrap"
            >
              <FiSave />
              <span className="hidden md:inline">
                Lưu đề thi ({existingQuestions.length} câu đã lưu)
              </span>
              <span className="md:hidden">
                Lưu đề thi ({existingQuestions.length})
              </span>
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
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Soạn câu hỏi
                </label>
                <button
                  type="button"
                  onClick={handleFileButtonClick}
                  disabled={uploadingFile}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingFile ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FiUpload />
                      Import Word
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <textarea
                value={rawText}
                onChange={(event) => handleRawTextChange(event.target.value)}
                placeholder="Ví dụ:&#10;When we went back to the bookstore, the bookseller_ the book we wanted.&#10;A. sold&#10;*B. had sold&#10;C. sells&#10;D. has sold&#10;&#10;By the end of last summer, the farmers_ all the crop.&#10;A. harvested&#10;*B. had harvested&#10;C. harvest&#10;D. are harvested"
                rows={30}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={regenerateRawText}
                  disabled={existingQuestions.length === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Khôi phục văn bản từ câu hỏi đã lưu
                </button>
                <span>
                  {existingQuestions.length > 0
                    ? `Đang có ${existingQuestions.length} câu hỏi đã lưu.`
                    : "Chưa có câu hỏi đã lưu để khôi phục."}
                </span>
              </div>
            </div>
          </div>

          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiCalendar />
              Xem trước ({allQuestions.length} câu - {existingQuestions.length} đã lưu,{" "}
              {newQuestionsCount} mới)
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

