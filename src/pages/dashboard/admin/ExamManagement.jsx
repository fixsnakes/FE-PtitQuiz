import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiEye,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatCurrency from "../../../utils/format_currentcy";
import formatDateTime from "../../../utils/format_time";

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [isPaidFilter, setIsPaidFilter] = useState("");
  const [isPublicFilter, setIsPublicFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [resultsPagination, setResultsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [questionsPagination, setQuestionsPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });

  // Edit form
  const [editForm, setEditForm] = useState({
    title: "",
    des: "",
    minutes: 60,
    total_score: 100,
    is_paid: false,
    fee: 0,
    is_public: true,
  });

  useEffect(() => {
    loadExams();
  }, [pagination.page, isPaidFilter, isPublicFilter, sortBy, order]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(isPaidFilter && { is_paid: isPaidFilter === "true" }),
        ...(isPublicFilter && { is_public: isPublicFilter === "true" }),
        ...(search && { search }),
        sortBy,
        order,
      };

      const response = await adminService.getAllExams(params);
      if (response.success) {
        setExams(response.data.exams);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadExams();
  };

  const handleViewDetail = async (exam) => {
    try {
      const response = await adminService.getExamById(exam.id);
      if (response.success) {
        setSelectedExam(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading exam detail:", error);
      toast.error("Không thể tải thông tin chi tiết");
    }
  };

  const handleViewResults = async (exam, page = 1) => {
    try {
      const params = { page, limit: resultsPagination.limit };
      const response = await adminService.getExamResults(exam.id, params);
      if (response.success) {
        // Backend có thể trả về response.data.results hoặc response.data
        const results = response.data.results || response.data || [];
        setExamResults(Array.isArray(results) ? results : []);
        setResultsPagination(response.data.pagination || { page, limit: 10, total: results.length, totalPages: 1 });
        setSelectedExam(exam);
        setShowResultsModal(true);
      }
    } catch (error) {
      console.error("Error loading exam results:", error);
      toast.error(error.body?.message || "Không thể tải kết quả thi");
    }
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setEditForm({
      title: exam.title,
      des: exam.des || "",
      minutes: exam.minutes,
      total_score: exam.total_score,
      is_paid: exam.is_paid,
      fee: parseFloat(exam.fee) || 0,
      is_public: exam.is_public,
    });
    setShowEditModal(true);
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.updateExam(selectedExam.id, editForm);
      if (response.success) {
        toast.success("Cập nhật đề thi thành công");
        setShowEditModal(false);
        loadExams();
      }
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error(error.body?.message || "Không thể cập nhật đề thi");
    }
  };

  const handleDeleteExam = async (exam) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa đề thi "${exam.title}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deleteExam(exam.id);
      if (response.success) {
        toast.success("Xóa đề thi thành công");
        loadExams();
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error(error.body?.message || "Không thể xóa đề thi");
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (now < start) {
      return { label: "Sắp diễn ra", class: "bg-blue-100 text-blue-700" };
    } else if (now >= start && now <= end) {
      return { label: "Đang diễn ra", class: "bg-green-100 text-green-700" };
    } else {
      return { label: "Đã kết thúc", class: "bg-slate-100 text-slate-700" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý đề thi</h1>
        <p className="text-slate-600 mt-1">
          Xem và quản lý tất cả đề thi trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tiêu đề..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <select
            value={isPaidFilter}
            onChange={(e) => {
              setIsPaidFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả loại</option>
            <option value="true">Trả phí</option>
            <option value="false">Miễn phí</option>
          </select>

          <select
            value={isPublicFilter}
            onChange={(e) => {
              setIsPublicFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả quyền truy cập</option>
            <option value="true">Công khai</option>
            <option value="false">Riêng tư</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="start_time">Thời gian bắt đầu</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="DESC">Mới nhất</option>
            <option value="ASC">Cũ nhất</option>
          </select>

          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Không tìm thấy đề thi nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Tiêu đề
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Giáo viên
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Lớp học
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Trạng thái
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                      Phí
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Lượt nộp
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => {
                    const status = getExamStatus(exam);
                    return (
                      <tr
                        key={exam.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 text-sm text-slate-600">
                          #{exam.id}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">
                            {exam.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FiClock className="h-3 w-3" />
                              {exam.minutes} phút
                            </span>
                            <span>•</span>
                            <span>{exam.total_score} điểm</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-slate-600">
                            {exam.creator?.fullName}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {exam.class ? (
                            <p className="text-sm text-slate-600">
                              {exam.class.className}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Công khai
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${status.class}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {exam.is_paid ? (
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(exam.fee)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">
                              Miễn phí
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-slate-800">
                            {exam.submission_count || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(exam)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Xem chi tiết"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewResults(exam)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Xem kết quả"
                            >
                              <FiCalendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(exam)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExam(exam)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} đề thi
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Chi tiết đề thi
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Tiêu đề</p>
                    <p className="font-semibold">
                      {selectedExam.exam.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Giáo viên</p>
                    <p className="font-semibold">
                      {selectedExam.exam.creator?.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Thời gian</p>
                    <p className="font-semibold">
                      {selectedExam.exam.minutes} phút
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tổng điểm</p>
                    <p className="font-semibold">
                      {selectedExam.exam.total_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Bắt đầu</p>
                    <p className="font-semibold">
                      {formatDateTime(selectedExam.exam.start_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Kết thúc</p>
                    <p className="font-semibold">
                      {formatDateTime(selectedExam.exam.end_time)}
                    </p>
                  </div>
                </div>
                {selectedExam.exam.des && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">Mô tả</p>
                    <p className="text-slate-800 mt-1">
                      {selectedExam.exam.des}
                    </p>
                  </div>
                )}
              </div>

              {/* Statistics */}
              {selectedExam.statistics && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    Thống kê
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Lượt nộp</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {selectedExam.statistics.submissionCount}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Lượt mua</p>
                      <p className="text-2xl font-bold text-green-700">
                        {selectedExam.statistics.purchaseCount}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">Điểm TB</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {selectedExam.statistics.avgScore}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600">Doanh thu</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {formatCurrency(selectedExam.statistics.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions */}
              {selectedExam.exam.questions && (() => {
                const totalQuestions = selectedExam.exam.questions.length;
                const startIdx = (questionsPagination.page - 1) * questionsPagination.limit;
                const endIdx = startIdx + questionsPagination.limit;
                const paginatedQuestions = selectedExam.exam.questions.slice(startIdx, endIdx);
                const totalPages = Math.ceil(totalQuestions / questionsPagination.limit);
                
                return (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    Câu hỏi ({totalQuestions})
                  </h3>
                  <div className="space-y-4">
                    {paginatedQuestions.map((q, idx) => (
                      <div key={q.id} className="bg-slate-50 p-4 rounded-lg">
                        <p className="font-medium text-slate-800">
                          Câu {startIdx + idx + 1}: {q.question_text}
                        </p>
                        {q.answers && q.answers.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {q.answers.map((ans) => (
                              <div
                                key={ans.id}
                                className={`text-sm ${
                                  ans.is_correct
                                    ? "text-green-600 font-medium"
                                    : "text-slate-600"
                                }`}
                              >
                                {ans.is_correct ? "✓" : "○"} {ans.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Questions Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Hiển thị câu hỏi {startIdx + 1} - {Math.min(endIdx, totalQuestions)} / {totalQuestions}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setQuestionsPagination({ ...questionsPagination, page: questionsPagination.page - 1 })}
                          disabled={questionsPagination.page === 1}
                          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Trước
                        </button>
                        <span className="px-4 py-2 text-sm text-slate-600">
                          Trang {questionsPagination.page} / {totalPages}
                        </span>
                        <button
                          onClick={() => setQuestionsPagination({ ...questionsPagination, page: questionsPagination.page + 1 })}
                          disabled={questionsPagination.page >= totalPages}
                          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Chỉnh sửa đề thi
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editForm.des}
                  onChange={(e) =>
                    setEditForm({ ...editForm, des: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thời gian (phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.minutes}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        minutes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tổng điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.total_score}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        total_score: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_paid}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_paid: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">Trả phí</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_public}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_public: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">Công khai</span>
                </label>
              </div>

              {editForm.is_paid && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.fee}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        fee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Kết quả thi: {selectedExam.title}
              </h2>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {examResults.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                Chưa có kết quả nào
              </p>
            ) : (
              <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Học sinh
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        Điểm
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        Đúng/Sai
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                        %
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Thời gian nộp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResults.map((result) => {
                      // Parse dữ liệu an toàn
                      const totalScore = parseFloat(result.total_score) || 0;
                      const correctCount = result.correct_count || 0;
                      const wrongCount = result.wrong_count || 0;
                      const totalQuestions = correctCount + wrongCount;
                      
                      // Tính percentage an toàn
                      let percentage = 0;
                      if (result.percentage !== undefined && result.percentage !== null) {
                        percentage = parseFloat(result.percentage) || 0;
                      } else if (totalQuestions > 0) {
                        percentage = (correctCount / totalQuestions) * 100;
                      }
                      
                      return (
                        <tr
                          key={result.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-800">
                              {result.student?.fullName || `Student #${result.student_id}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {result.student?.email || ""}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-lg text-slate-800">
                              {totalScore.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-slate-600">
                              {correctCount} / {wrongCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`font-semibold ${
                                percentage >= 80
                                  ? "text-green-600"
                                  : percentage >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {result.submitted_at ? formatDateTime(result.submitted_at) : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Results Pagination */}
              {resultsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Hiển thị {((resultsPagination.page - 1) * resultsPagination.limit) + 1} - {Math.min(resultsPagination.page * resultsPagination.limit, resultsPagination.total)} trong tổng số {resultsPagination.total} kết quả
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewResults(selectedExam, resultsPagination.page - 1)}
                      disabled={resultsPagination.page === 1}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-600">
                      Trang {resultsPagination.page} / {resultsPagination.totalPages}
                    </span>
                    <button
                      onClick={() => handleViewResults(selectedExam, resultsPagination.page + 1)}
                      disabled={resultsPagination.page >= resultsPagination.totalPages}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
              </>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

