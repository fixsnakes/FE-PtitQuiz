import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

export default function StudentExams() {
  const navigate = useNavigate();

  // State cho phần lịch sử làm bài (bảng)
  const [allCompletedExams, setAllCompletedExams] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // Giả lập data bài thi đã làm
  useEffect(() => {
    setLoadingCompleted(true);
    // Mock data - giả lập danh sách bài thi đã làm
    const mockCompletedExams = [
      {
        id: 1,
        examId: 101,
        examCode: "EXAM001",
        examTitle: "Kiểm tra giữa kỳ môn Toán",
        score: 8.5,
        correctCount: 17,
        wrongCount: 3,
        completedAt: "2024-01-15T10:30:00",
        endTime: "2024-01-15T11:30:00",
        sessionId: "session-001",
      },
      {
        id: 2,
        examId: 102,
        examCode: "EXAM002",
        examTitle: "Bài kiểm tra Vật lý",
        score: 7.0,
        correctCount: 14,
        wrongCount: 6,
        completedAt: "2024-01-14T14:20:00",
        endTime: "2024-01-14T15:05:00",
        sessionId: "session-002",
      },
      {
        id: 3,
        examId: 103,
        examCode: "EXAM003",
        examTitle: "Thi cuối kỳ Hóa học",
        score: 9.0,
        correctCount: 18,
        wrongCount: 2,
        completedAt: "2024-01-13T09:15:00",
        endTime: "2024-01-13T10:45:00",
        sessionId: "session-003",
      },
      {
        id: 4,
        examId: 104,
        examCode: "EXAM004",
        examTitle: "Kiểm tra tiếng Anh",
        score: 8.0,
        correctCount: 16,
        wrongCount: 4,
        completedAt: "2024-01-12T16:45:00",
        endTime: "2024-01-12T17:35:00",
        sessionId: "session-004",
      },
      {
        id: 5,
        examId: 105,
        examCode: "EXAM005",
        examTitle: "Bài thi Lịch sử",
        score: 6.5,
        correctCount: 13,
        wrongCount: 7,
        completedAt: "2024-01-11T11:00:00",
        endTime: "2024-01-11T11:40:00",
        sessionId: "session-005",
      },
      {
        id: 6,
        examId: 106,
        examCode: "EXAM006",
        examTitle: "Kiểm tra Địa lý",
        score: 7.5,
        correctCount: 15,
        wrongCount: 5,
        completedAt: "2024-01-10T13:30:00",
        endTime: "2024-01-10T14:05:00",
        sessionId: "session-006",
      },
      {
        id: 7,
        examId: 107,
        examCode: "EXAM007",
        examTitle: "Thi thử Toán nâng cao",
        score: 9.5,
        correctCount: 19,
        wrongCount: 1,
        completedAt: "2024-01-09T15:20:00",
        endTime: "2024-01-09T16:35:00",
        sessionId: "session-007",
      },
      {
        id: 8,
        examId: 108,
        examCode: "EXAM008",
        examTitle: "Bài kiểm tra Sinh học",
        score: 8.0,
        correctCount: 16,
        wrongCount: 4,
        completedAt: "2024-01-08T10:00:00",
        endTime: "2024-01-08T10:55:00",
        sessionId: "session-008",
      },
      {
        id: 9,
        examId: 109,
        examCode: "EXAM009",
        examTitle: "Kiểm tra Văn học",
        score: 7.0,
        correctCount: 14,
        wrongCount: 6,
        completedAt: "2024-01-07T14:15:00",
        endTime: "2024-01-07T14:55:00",
        sessionId: "session-009",
      },
      {
        id: 10,
        examId: 110,
        examCode: "EXAM010",
        examTitle: "Thi thử Tin học",
        score: 8.5,
        correctCount: 17,
        wrongCount: 3,
        completedAt: "2024-01-06T09:30:00",
        endTime: "2024-01-06T10:20:00",
        sessionId: "session-010",
      },
      {
        id: 11,
        examId: 111,
        examCode: "EXAM011",
        examTitle: "Bài kiểm tra GDCD",
        score: 9.0,
        correctCount: 18,
        wrongCount: 2,
        completedAt: "2024-01-05T11:45:00",
        endTime: "2024-01-05T12:35:00",
        sessionId: "session-011",
      },
      {
        id: 12,
        examId: 112,
        examCode: "EXAM012",
        examTitle: "Kiểm tra Công nghệ",
        score: 7.5,
        correctCount: 15,
        wrongCount: 5,
        completedAt: "2024-01-04T13:00:00",
        endTime: "2024-01-04T13:35:00",
        sessionId: "session-012",
      },
      {
        id: 13,
        examId: 113,
        examCode: "EXAM013",
        examTitle: "Kiểm tra Vật lý nâng cao",
        score: 8.5,
        correctCount: 17,
        wrongCount: 3,
        completedAt: "2024-01-03T10:00:00",
        endTime: "2024-01-03T10:45:00",
        sessionId: "session-013",
      },
      {
        id: 14,
        examId: 114,
        examCode: "EXAM014",
        examTitle: "Thi thử Hóa học",
        score: 9.0,
        correctCount: 18,
        wrongCount: 2,
        completedAt: "2024-01-02T14:30:00",
        endTime: "2024-01-02T16:00:00",
        sessionId: "session-014",
      },
      {
        id: 15,
        examId: 115,
        examCode: "EXAM015",
        examTitle: "Bài kiểm tra Toán cơ bản",
        score: 7.5,
        correctCount: 15,
        wrongCount: 5,
        completedAt: "2024-01-01T09:00:00",
        endTime: "2024-01-01T09:40:00",
        sessionId: "session-015",
      },
    ];

    setTimeout(() => {
      setAllCompletedExams(mockCompletedExams);
      setLoadingCompleted(false);
    }, 500);
  }, []);

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
                    <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
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
                            <div className="text-sm font-medium text-slate-900">
                              {item.examTitle}
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

