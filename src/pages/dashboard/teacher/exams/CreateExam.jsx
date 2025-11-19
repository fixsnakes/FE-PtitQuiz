import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiLoader } from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getTeacherClasses } from "../../../../services/classService";
import { createExam } from "../../../../services/examService";

const DEFAULT_CONFIG = {
  title: "",
  minutes: 45,
  startTime: "",
  endTime: "",
  classId: "",
  description: "",
  totalScore: "",
  isPublic: true,
  isPaid: false,
  fee: "",
};

function getCurrentDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function normalizeClasses(payload) {
  if (!payload) return [];
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.classes)
    ? payload.classes
    : [];

  return items.map((item) => ({
    id: item.id ?? item.classId ?? item._id ?? item.class_id,
    className: item.className ?? item.name ?? "Không tên",
    classCode: item.classCode ?? item.class_code ?? "—",
  }));
}

function FormSection({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

const Toggle = ({ label, checked, onChange, description }) => (
  <div>
    <label className="flex items-center justify-between text-sm font-medium text-gray-700">
      {label}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
          checked ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
    {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
  </div>
);

function CreateExamPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    ...DEFAULT_CONFIG,
    startTime: getCurrentDateTimeLocal(),
  });
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitState, setSubmitState] = useState({
    loading: false,
    message: "",
    examId: null,
  });

  useEffect(() => {
    async function loadClasses() {
      setLoadingClasses(true);
      try {
        const response = await getTeacherClasses();
        setClasses(normalizeClasses(response));
      } catch (error) {
        console.error("Không thể tải lớp:", error);
      } finally {
        setLoadingClasses(false);
      }
    }

    loadClasses();
  }, []);

  const updateConfig = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!config.title.trim()) {
      alert("Vui lòng nhập tên đề thi.");
      return false;
    }

    if (!config.minutes || Number(config.minutes) <= 0) {
      alert("Thời gian làm bài phải lớn hơn 0.");
      return false;
    }

    if (config.totalScore && Number(config.totalScore) <= 0) {
      alert("Tổng điểm phải lớn hơn 0.");
      return false;
    }

    if (config.startTime && config.endTime && config.startTime >= config.endTime) {
      alert("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return false;
    }

    if (config.isPaid && (!config.fee || Number(config.fee) <= 0)) {
      alert("Vui lòng nhập mức phí hợp lệ.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

    const examPayload = {
      title: config.title.trim(),
      minutes: Number(config.minutes),
      start_time: toIso(config.startTime),
      end_time: toIso(config.endTime),
      class_id: config.classId || undefined,
      des: config.description.trim() || undefined,
      total_score: config.totalScore ? Number(config.totalScore) : undefined,
      is_public: config.isPublic,
      is_paid: config.isPaid,
      fee: config.isPaid ? Number(config.fee) : undefined,
    };

    setSubmitState({ loading: true, message: "", examId: null });
    try {
      const response = await createExam(examPayload);
      const newExamId =
        response?.id ??
        response?.exam_id ??
        response?.examId ??
        response?.data?.id ??
        response?.data?.exam_id ??
        null;

      setSubmitState({
        loading: false,
        message: "Đã tạo đề thi. Tiếp tục thêm câu hỏi để hoàn thiện.",
        examId: newExamId,
      });

      if (newExamId) {
        const goToQuestions = window.confirm(
          "Đề thi đã được tạo. Bạn có muốn chuyển sang trang thêm câu hỏi ngay bây giờ?"
        );
        if (goToQuestions) {
          navigate(`/dashboard/teacher/exams/${newExamId}/questions`);
        }
      }
    } catch (error) {
      const message =
        error?.body?.message || error?.message || "Không thể tạo đề thi. Vui lòng thử lại.";
      setSubmitState({ loading: false, message, examId: null });
      alert(message);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Tạo đề thi
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {config.title || "Chưa đặt tên"}
            </h1>
            <p className="text-sm text-slate-500">
              Bước 1: cấu hình thông tin đề thi. Sau khi tạo thành công, bạn sẽ thêm câu hỏi ở bước
              tiếp theo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitState.loading}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60"
          >
            {submitState.loading && <FiLoader className="animate-spin" />}
            Tạo đề thi
          </button>
        </header>

        {submitState.message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p>{submitState.message}</p>
            {submitState.examId && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/teacher/exams/${submitState.examId}/questions`)
                  }
                  className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Thêm câu hỏi
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          <FormSection title="Thông tin chung">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(event) => updateConfig("title", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="Nhập tên đề thi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tổng điểm</label>
                <input
                  type="number"
                  value={config.totalScore}
                  min={0}
                  onChange={(event) => updateConfig("totalScore", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ví dụ: 100"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thời gian làm bài (phút) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={config.minutes}
                  onChange={(event) => updateConfig("minutes", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bắt đầu</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={config.startTime}
                    onChange={(event) => updateConfig("startTime", event.target.value)}
                    step="60"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                  <FiCalendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kết thúc</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={config.endTime}
                    min={config.startTime || undefined}
                    onChange={(event) => updateConfig("endTime", event.target.value)}
                    step="60"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                  <FiCalendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(event) => updateConfig("description", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                placeholder="Thông tin mô tả đề thi, hướng dẫn, ghi chú..."
              />
            </div>
          </FormSection>

          <FormSection title="Giao đề cho lớp">
            {loadingClasses ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FiLoader className="animate-spin" />
                Đang tải danh sách lớp...
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Bạn chưa có lớp nào. Vào mục Lớp học để tạo mới hoặc bỏ trống trường này.
              </p>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Chọn lớp</label>
                <select
                  value={config.classId}
                  onChange={(event) => updateConfig("classId", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Không gán lớp</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </FormSection>

          <FormSection title="Công khai và thu phí">
            <div className="grid gap-4 md:grid-cols-2">
              <Toggle
                label="Cho phép học sinh bên ngoài lớp truy cập (is_public)"
                checked={config.isPublic}
                onChange={(value) => updateConfig("isPublic", value)}
              />
              <Toggle
                label="Thu phí tham gia đề thi"
                checked={config.isPaid}
                onChange={(value) => updateConfig("isPaid", value)}
                description="Nếu bật, cần nhập số tiền (đơn vị VNĐ)."
              />
            </div>

            {config.isPaid && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mức phí (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    value={config.fee}
                    onChange={(event) => updateConfig("fee", event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    placeholder="Ví dụ: 50000"
                  />
                </div>
              </div>
            )}
          </FormSection>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateExamPage;

