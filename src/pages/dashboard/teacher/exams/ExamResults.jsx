import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiLoader,
  FiEdit2,
  FiSave,
  FiX,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiDownload,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import { getExamDetail } from "../../../../services/examService";
import {
  getExamResults,
  updateExamResultFeedback,
  exportExamResults,
} from "../../../../services/examResultService";
import formatDateTime from "../../../../utils/format_time";

function ExamResultsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (examId) {
      loadData();
    }
  }, [examId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examResponse, resultsResponse] = await Promise.all([
        getExamDetail(examId),
        getExamResults(examId),
      ]);

      setExam(examResponse);
      const resultsData = resultsResponse?.results || [];
      setResults(resultsData);
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể tải dữ liệu kết quả thi."
      );
    } finally {
      setLoading(false);
    }
  };

  const startEditFeedback = (result) => {
    setEditingFeedbackId(result.id);
    setFeedbackText(result.feedback || "");
  };

  const cancelEditFeedback = () => {
    setEditingFeedbackId(null);
    setFeedbackText("");
  };

  const handleSaveFeedback = async (resultId) => {
    setSavingFeedback(true);
    try {
      await updateExamResultFeedback(resultId, { feedback: feedbackText });
      toast.success("Đã cập nhật feedback thành công.");
      setEditingFeedbackId(null);
      setFeedbackText("");
      loadData();
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể cập nhật feedback."
      );
    } finally {
      setSavingFeedback(false);
    }
  };

  const calculatePercentage = (score, totalScore) => {
    if (!totalScore || totalScore === 0) return 0;
    // Đảm bảo cả score và totalScore đều là số
    const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
    const numTotalScore = typeof totalScore === 'number' ? totalScore : parseFloat(totalScore) || 0;
    if (numTotalScore === 0) return 0;
    return ((numScore / numTotalScore) * 100).toFixed(1);
  };

  const handleExportResults = async () => {
    if (!examId || results.length === 0) {
      toast.warning("Không có dữ liệu để xuất.");
      return;
    }

    setExporting(true);
    try {
      const response = await exportExamResults(examId, 'csv');
      
      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ket-qua-thi-${exam?.title?.replace(/[^a-z0-9]/gi, '_') || 'exam'}-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Đã xuất kết quả thi thành công.");
    } catch (error) {
      toast.error(
        error?.body?.message || error?.message || "Không thể xuất kết quả thi."
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-3xl text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
              Quay lại
            </button>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
              Kết quả thi
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {exam?.title || "Đề thi"}
            </h1>
            {exam?.total_score && (
              <p className="text-sm text-slate-500">
                Tổng điểm: {exam.total_score} điểm
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {results.length > 0 && (
              <button
                type="button"
                onClick={handleExportResults}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
              >
                {exporting ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiDownload />
                )}
                {exporting ? "Đang xuất..." : "Xuất Excel/CSV"}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(`/dashboard/teacher/exams/${examId}/monitoring`)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <FiEye />
              Giám sát gian lận
            </button>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Danh sách kết quả ({results.length} bài làm)
            </h2>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiLoader className="animate-spin" />
              Làm mới
            </button>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
              Chưa có học sinh nào làm bài thi này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Học sinh</th>
                    <th className="px-4 py-3 text-center">Điểm số</th>
                    <th className="px-4 py-3 text-center">Đúng/Sai</th>
                    <th className="px-4 py-3 text-center">Tỷ lệ</th>
                    <th className="px-4 py-3 text-center">Thời gian nộp</th>
                    <th className="px-4 py-3 text-left">Feedback</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {results.map((result) => {
                    const isEditing = editingFeedbackId === result.id;
                    const percentage = calculatePercentage(
                      result.total_score,
                      exam?.total_score
                    );

                    return (
                      <tr key={result.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900">
                                {result.student?.fullName || "Không tên"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {result.student?.email || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-lg text-slate-900">
                            {(() => {
                              const score = typeof result.total_score === 'number' 
                                ? result.total_score 
                                : parseFloat(result.total_score) || 0;
                              return score.toFixed(1);
                            })()}
                          </span>
                          {exam?.total_score && (
                            <span className="text-xs text-slate-500">
                              {" "}
                              / {exam.total_score}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="flex items-center gap-1 text-emerald-600">
                              <FiCheckCircle />
                              {result.correct_count || 0}
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="flex items-center gap-1 text-red-600">
                              <FiXCircle />
                              {result.wrong_count || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`font-semibold ${
                              percentage >= 80
                                ? "text-emerald-600"
                                : percentage >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-xs text-slate-600">
                          {result.submitted_at
                            ? formatDateTime(result.submitted_at)
                            : "—"}
                        </td>
                        <td className="px-4 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Nhập feedback cho học sinh..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveFeedback(result.id)}
                                  disabled={savingFeedback}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                                >
                                  {savingFeedback ? (
                                    <FiLoader className="animate-spin" />
                                  ) : (
                                    <FiSave />
                                  )}
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditFeedback}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                                >
                                  <FiX />
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {result.feedback ? (
                                <p className="text-sm text-slate-700">{result.feedback}</p>
                              ) : (
                                <p className="text-xs text-slate-400">Chưa có feedback</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => startEditFeedback(result)}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                            >
                              <FiEdit2 />
                              {result.feedback ? "Sửa" : "Thêm"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ExamResultsPage;

