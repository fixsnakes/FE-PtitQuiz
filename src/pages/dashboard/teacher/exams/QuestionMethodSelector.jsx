import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiFileText, FiEdit, FiLoader, FiArrowLeft } from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";

function normalizeExam(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.exam_id ?? raw._id,
    title: raw.title ?? raw.name ?? "Đề thi",
  };
}

export default function QuestionMethodSelector() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExam() {
      if (!examId) return;
      setLoading(true);
      try {
        const response = await getExamDetail(examId);
        setExam(normalizeExam(response));
      } catch (err) {
        console.error("Không thể tải thông tin đề thi:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId]);

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tạo đề thi mới</h1>
          <p className="text-slate-600">{exam?.title || "Đề thi"}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full px-4">
          {/* Văn bản */}
          <button
            type="button"
            onClick={() => navigate(`/dashboard/teacher/exams/${examId}/questions/text`)}
            className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Văn bản</h3>
              <p className="text-sm text-white/90 mb-6">
                Tạo đề thi nhanh bằng cách soạn thảo văn bản
              </p>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <FiFileText className="w-16 h-16 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                    &lt;/&gt;
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Trình soạn thảo */}
          <button
            type="button"
            onClick={() => navigate(`/dashboard/teacher/exams/${examId}/questions/editor`)}
            className="flex-1 group relative overflow-hidden rounded-2xl bg-slate-100 border-2 border-slate-200 p-8 text-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-300"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Trình soạn thảo</h3>
              <p className="text-sm text-slate-600 mb-6">
                Tạo đề thi từ đầu và chỉnh sửa thủ công
              </p>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <FiFileText className="w-16 h-16 text-slate-400" />
                  <FiEdit className="absolute bottom-0 right-0 w-8 h-8 text-indigo-500" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

