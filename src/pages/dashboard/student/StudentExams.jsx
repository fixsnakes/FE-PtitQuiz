import React, { useState, useEffect, useMemo } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
} from "lucide-react";
import { getStudentResults } from "../../../services/examResultService";
import { toast } from "react-toastify";

export default function StudentExams() {
  const navigate = useNavigate();

  // State cho phần lịch sử làm bài (bảng)
  const [allCompletedExams, setAllCompletedExams] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Load data từ API
  useEffectOnce(() => {
    loadCompletedExams();
  }, []);

  const loadCompletedExams = async () => {
    setLoadingCompleted(true);
    try {
      const response = await getStudentResults();
      console.log("API Response:", response); // Debug log

      // apiClient trả về data trực tiếp, không phải response.data
      const results = Array.isArray(response) ? response : (response?.data || []);

      if (Array.isArray(results) && results.length > 0) {
        // Map data từ API response
        const mappedExams = results.map((result) => {
          const exam = result.exam || {};
          const session = result.session || {};
          return {
            id: result.id,
            examId: exam.id,
            examCode: `${exam.id}`,
            examTitle: exam.title || "Không có tiêu đề",
            score: parseFloat(result.total_score) || 0,
            correctCount: result.correct_count || 0,
            wrongCount: result.wrong_count || 0,
            completedAt: result.submitted_at || session.submitted_at,
            endTime: session.end_time,
            sessionId: session.id || result.session_id,
            feedback: result.feedback || null,
            hasFeedback: !!result.feedback,
          };
        });
        console.log("Mapped exams:", mappedExams); // Debug log
        setAllCompletedExams(mappedExams);
      } else {
        console.log("No results found");
        setAllCompletedExams([]);
      }
    } catch (error) {
      console.error("Error loading completed exams:", error);
      toast.error("Không thể tải lịch sử làm bài");
      setAllCompletedExams([]);
    } finally {
      setLoadingCompleted(false);
    }
  };


  // Filter exams theo search term
  const filteredExams = useMemo(() => {
    if (!searchTerm.trim()) {
      return allCompletedExams;
    }
    const term = searchTerm.toLowerCase().trim();
    return allCompletedExams.filter(
      (exam) =>
        exam.examTitle.toLowerCase().includes(term) ||
        exam.examCode.toLowerCase().includes(term)
    );
  }, [allCompletedExams, searchTerm]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExams = filteredExams.slice(startIndex, endIndex);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetail = (examId, sessionId) => {
    navigate(`/student/exams/${examId}/result/${sessionId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Tính toán các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">


        {/* Filter Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2">
              <Search className="text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên bài thi hoặc mã bài thi..."
                className="w-full border-none bg-transparent text-sm text-slate-600 outline-none focus:ring-0"
              />
            </div>
          </div>
        </section>

        {/* Table Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {loadingCompleted ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                Đang tải dữ liệu...
              </div>
            </div>
          ) : paginatedExams.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p>
                {searchTerm
                  ? "Không tìm thấy bài thi nào phù hợp"
                  : "Chưa có bài thi nào đã hoàn thành"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                        Mã bài thi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                        Tên bài thi
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                        Số câu làm đúng
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                        Số câu làm sai
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                        Điểm số
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                        Ngày hoàn thành
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                        Ngày kết thúc bài thi
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedExams.map((item) => {
                      const isPassed = item.score >= 5.0;
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-indigo-50/50"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-indigo-600">
                              {item.examCode}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-900">
                                {item.examTitle}
                              </div>
                              {item.hasFeedback && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                                  <MessageSquare className="h-3 w-3" />
                                  Có feedback
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                              {item.correctCount} câu
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                              {item.wrongCount} câu
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`text-base font-bold ${isPassed ? "text-emerald-600" : "text-red-600"
                                }`}
                            >
                              {item.score.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">
                              {formatDate(item.completedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">
                              {formatDate(item.endTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() =>
                                handleViewDetail(item.examId, item.sessionId)
                              }
                              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-400"
                            >
                              <Eye className="h-4 w-4" />
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-600">
                    Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
                    <span className="font-semibold">
                      {Math.min(endIndex, filteredExams.length)}
                    </span>{" "}
                    trong tổng số <span className="font-semibold">{filteredExams.length}</span> bài thi
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${currentPage === pageNum
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

