import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiLoader } from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getTeacherClasses } from "../../../../services/classService";
import { createExam } from "../../../../services/examService";
import { uploadExamImage } from "../../../../services/uploadService";
import { toast } from "react-toastify";

const DEFAULT_CONFIG = {
  title: "",
  minutes: 45,
  startTime: "",
  endTime: "",
  noTimeLimit: false,
  classIds: [], // Array of class IDs
  description: "",
  totalScore: "",
  isPublic: true,
  isPaid: false,
  fee: "",
  imageUrl: "",
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
    imageUrl: "",
  });
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitState, setSubmitState] = useState({
    loading: false,
    message: "",
    examId: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    setConfig((prev) => {
      const newConfig = { ...prev, [field]: value };
      
      // Nếu thay đổi startTime và endTime đã có giá trị, đảm bảo endTime >= startTime
      if (field === 'startTime' && newConfig.endTime && value) {
        const startDate = new Date(value);
        const endDate = new Date(newConfig.endTime);
        if (endDate <= startDate) {
          // Tự động set endTime = startTime + 1 giờ
          const newEndTime = new Date(startDate);
          newEndTime.setHours(newEndTime.getHours() + 1);
          const year = newEndTime.getFullYear();
          const month = String(newEndTime.getMonth() + 1).padStart(2, "0");
          const day = String(newEndTime.getDate()).padStart(2, "0");
          const hours = String(newEndTime.getHours()).padStart(2, "0");
          const minutes = String(newEndTime.getMinutes()).padStart(2, "0");
          newConfig.endTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      }
      
      return newConfig;
    });
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

    if (!config.noTimeLimit) {
      if (!config.startTime || !config.endTime) {
        alert("Vui lòng chọn thời gian bắt đầu và kết thúc, hoặc chọn 'Không giới hạn thời gian'.");
        return false;
      }
      if (config.startTime >= config.endTime) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu.");
        return false;
      }
    }

    if (config.isPaid) {
      const feeValue = Number(config.fee);
      if (!config.fee || isNaN(feeValue) || feeValue <= 0) {
        alert("Vui lòng nhập mức phí hợp lệ (lớn hơn 0).");
        return false;
      }
    }

    return true;
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image immediately
    try {
      setUploadingImage(true);
      const response = await uploadExamImage(file);
      const imageUrl = response.image_url || response.data?.image_url;
      
      if (imageUrl) {
        // Convert relative URL to full URL for preview
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
        
        // Lưu relative URL vào config (backend sẽ xử lý)
        setConfig(prev => ({ ...prev, imageUrl: imageUrl }));
        // Set preview với full URL
        setImagePreview(fullImageUrl);
        toast.success("Upload ảnh thành công!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Không thể upload ảnh");
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setConfig(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

    const examPayload = {
      title: config.title.trim(),
      minutes: Number(config.minutes),
      start_time: config.noTimeLimit ? null : toIso(config.startTime),
      end_time: config.noTimeLimit ? null : toIso(config.endTime),
      class_ids: config.classIds && config.classIds.length > 0 ? config.classIds : undefined,
      des: config.description.trim() || undefined,
      total_score: config.totalScore ? Number(config.totalScore) : undefined,
      is_public: config.isPublic,
      is_paid: config.isPaid,
      fee: config.isPaid ? Number(config.fee) : undefined,
      image_url: config.imageUrl.trim() || undefined,
    };

    // Đảm bảo fee là số hợp lệ khi is_paid = true
    if (examPayload.is_paid && (!examPayload.fee || isNaN(examPayload.fee) || examPayload.fee <= 0)) {
      alert("Vui lòng nhập mức phí hợp lệ (lớn hơn 0).");
      return;
    }

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
        <header className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Tạo đề thi
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {config.title || "Chưa đặt tên"}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Bước 1: cấu hình thông tin đề thi. Sau khi tạo thành công, bạn sẽ thêm câu hỏi ở bước tiếp theo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitState.loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg disabled:opacity-60"
            >
              {submitState.loading && <FiLoader className="animate-spin" />}
              Tạo đề thi
            </button>
          </div>
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-200 opacity-20 blur-2xl"></div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đề thi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(event) => updateConfig("title", event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Nhập tên đề thi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng điểm</label>
                <input
                  type="number"
                  value={config.totalScore}
                  min={0}
                  onChange={(event) => updateConfig("totalScore", event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ví dụ: 100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  id="noTimeLimit"
                  checked={config.noTimeLimit}
                  onChange={(event) => {
                    updateConfig("noTimeLimit", event.target.checked);
                    if (event.target.checked) {
                      updateConfig("startTime", "");
                      updateConfig("endTime", "");
                    } else {
                      updateConfig("startTime", getCurrentDateTimeLocal());
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <label htmlFor="noTimeLimit" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Không giới hạn thời gian
                  </label>
                  <p className="mt-1 text-xs text-slate-600">
                    Nếu chọn, học sinh có thể làm bài thi bất cứ lúc nào mà không bị giới hạn bởi thời gian bắt đầu và kết thúc.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian làm bài (phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={config.minutes}
                    onChange={(event) => updateConfig("minutes", event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                {!config.noTimeLimit && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={config.startTime}
                        onChange={(event) => updateConfig("startTime", event.target.value)}
                        step="60"
                        max={config.endTime || undefined}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={config.endTime}
                        min={config.startTime || undefined}
                        onChange={(event) => {
                          const newEndTime = event.target.value;
                          if (config.startTime && newEndTime) {
                            const startDate = new Date(config.startTime);
                            const endDate = new Date(newEndTime);
                            if (endDate <= startDate) {
                              alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
                              return;
                            }
                          }
                          updateConfig("endTime", newEndTime);
                        }}
                        step="60"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      {config.startTime && config.endTime && new Date(config.endTime) <= new Date(config.startTime) && (
                        <p className="mt-1 text-xs text-red-600">Thời gian kết thúc phải lớn hơn thời gian bắt đầu</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(event) => updateConfig("description", event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                placeholder="Thông tin mô tả đề thi, hướng dẫn, ghi chú..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ảnh đề thi (tùy chọn)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50">
                    {uploadingImage ? (
                      <>
                        <FiLoader className="mr-2 animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Chọn ảnh
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Chọn ảnh từ máy tính (tối đa 5MB). Để trống sẽ sử dụng ảnh mặc định.
                </p>
                {imagePreview && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-slate-700">Xem trước:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                    />
                  </div>
                )}
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn lớp (có thể chọn nhiều lớp)
                </label>
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={config.classIds?.includes(cls.id) || false}
                        onChange={(e) => {
                          const currentIds = config.classIds || [];
                          if (e.target.checked) {
                            updateConfig("classIds", [...currentIds, cls.id]);
                          } else {
                            updateConfig("classIds", currentIds.filter(id => id !== cls.id));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {cls.className} ({cls.classCode})
                      </span>
                    </label>
                  ))}
                </div>
                {config.classIds && config.classIds.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Đã chọn {config.classIds.length} lớp
                  </p>
                )}
              </div>
            )}
          </FormSection>

          <FormSection title="Công khai và thu phí">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Toggle
                  label="Cho phép học sinh bên ngoài lớp truy cập"
                  checked={config.isPublic}
                  onChange={(value) => updateConfig("isPublic", value)}
                  description="Nếu bật, học sinh không thuộc lớp được gán cũng có thể làm bài thi này."
                />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Toggle
                  label="Thu phí mỗi lần làm bài"
                  checked={config.isPaid}
                  onChange={(value) => {
                    updateConfig("isPaid", value);
                    // Nếu bật isPaid và fee chưa có giá trị, set giá trị mặc định
                    if (value && (!config.fee || Number(config.fee) <= 0)) {
                      updateConfig("fee", "10000");
                    }
                  }}
                  description="Học sinh sẽ bị trừ tiền mỗi lần bắt đầu làm bài thi này (đơn vị VNĐ)."
                />
              </div>
            </div>

            {config.isPaid && (
              <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phí mỗi lần làm bài (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={config.fee}
                  onChange={(event) => updateConfig("fee", event.target.value)}
                  className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Ví dụ: 50000"
                />
                {(!config.fee || Number(config.fee) <= 0) && (
                  <p className="mt-1 text-xs text-red-600">Vui lòng nhập mức phí hợp lệ (lớn hơn 0)</p>
                )}
                <p className="mt-2 text-xs text-slate-600">
                  Số tiền sẽ được trừ từ tài khoản học sinh mỗi lần họ bắt đầu làm bài thi.
                </p>
              </div>
            )}
          </FormSection>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateExamPage;

