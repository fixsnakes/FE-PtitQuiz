import React, { useEffect, useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  Search,
  Play,
  Clock,
  BookOpen,
  Star,
  GraduationCap,
  Filter,
  X,
  Wallet,
  Users,
} from "lucide-react";
import { getStudentExams } from "../../../services/studentExamService";
import { getClasses } from "../../../services/classServiceTemp";
import formatCurrency from "../../../utils/format_currentcy";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search term đang nhập
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // Search term đang được query
  const [exams, setExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const pageSize = 12;

  // Filter states
  const [filters, setFilters] = useState({
    is_paid: "", // "" = all, "true" = paid, "false" = free
    class_id: "", // "" = all, or specific class_id
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Load classes for filter dropdown
  useEffectOnce(() => {
    const loadClasses = async () => {
      try {
        const response = await getClasses(100, 0); // Lấy tối đa 100 lớp
        if (response.status && response.data) {
          const classesData = response.data.map((classItem) => ({
            id: classItem.id,
            name: classItem.className,
            code: classItem.classCode || "",
          }));
          setAvailableClasses(classesData);
        }
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    };

    loadClasses();
  }, []);

  // Load exams when filters, activeSearchTerm, or page change
  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: pageSize,
        };

        // Thêm search vào params nếu có
        if (activeSearchTerm && activeSearchTerm.trim()) {
          params.search = activeSearchTerm.trim();
        }

        if (filters.is_paid !== "") {
          params.is_paid = filters.is_paid;
        }

        if (filters.class_id !== "") {
          params.class_id = filters.class_id;
        }

        const response = await getStudentExams(params);

        // API trả về { data: [...], pagination: {...} }
        const examsData = response?.data || [];
        const paginationData = response?.pagination || {
          page: currentPage,
          limit: pageSize,
          total: examsData.length,
          totalPages: Math.ceil((examsData.length || 0) / pageSize) || 1,
        };

        // Đảm bảo pagination có đầy đủ thông tin
        const finalPagination = {
          page: paginationData.page || currentPage,
          limit: paginationData.limit || pageSize,
          total: paginationData.total !== undefined ? paginationData.total : examsData.length,
          totalPages: paginationData.totalPages !== undefined
            ? paginationData.totalPages
            : Math.ceil((paginationData.total || examsData.length) / (paginationData.limit || pageSize)) || 1,
        };

        console.log("Exams data:", examsData.length);
        console.log("Pagination data:", finalPagination);

        setExams(examsData);
        setPagination(finalPagination);
      } catch (error) {
        console.error("Error loading exams:", error);
        toast.error(error.message || "Không thể tải danh sách đề thi");
        setExams([]);
        setPagination({
          page: 1,
          limit: pageSize,
          total: 0,
          totalPages: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [currentPage, filters.is_paid, filters.class_id, activeSearchTerm, pageSize]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.is_paid, filters.class_id, activeSearchTerm]);

  // Handle search button click
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      is_paid: "",
      class_id: "",
    });
    setSearchTerm("");
    setActiveSearchTerm("");
  };

  const hasActiveFilters =
    filters.is_paid !== "" ||
    filters.class_id !== "" ||
    activeSearchTerm.trim();

  const activeFilterCount = [
    filters.is_paid !== "" && "1",
    filters.class_id !== "" && "1",
    activeSearchTerm.trim() && "1",
  ].filter(Boolean).length;

  const handleExamClick = (examId) => {
    navigate(`/dashboard/student/exams/${examId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderCard = (exam) => {
    return (
      <div
        key={exam.id}
        className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
      >
        <div className="relative overflow-hidden rounded-t-2xl">
          {/* Exam Image */}
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={exam.image_url
                ? (exam.image_url.startsWith('http')
                  ? exam.image_url
                  : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"}${exam.image_url}`)
                : "https://images.pexels.com/photos/167682/pexels-photo-167682.jpeg"}
              alt={exam.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                // Fallback to default image if image fails to load
                e.target.src = "https://images.pexels.com/photos/167682/pexels-photo-167682.jpeg";
              }}
            />
            {/* Overlay info on image */}
            <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {exam.classes && exam.classes.length > 0
                    ? (exam.classes.length > 1 ? `${exam.classes.length} lớp` : exam.classes[0].className)
                    : exam.class?.className || "Public"}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-white">
                  {formatDate(exam.created_at)}
                </span>
              </div>
              <div>
                <h3 className="line-clamp-2 text-lg font-bold text-white">
                  {exam.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-white/90">
                  {exam.des || (exam.classes && exam.classes.length > 0 ? exam.classes.map(c => c.className).join(", ") : null) || exam.class?.className || "Không có mô tả"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <Clock className="h-4 w-4 text-slate-400" />
              {exam.minutes} phút
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <BookOpen className="h-4 w-4 text-slate-400" />
              {exam.question_count || 0} câu
            </span>
            {/* Rating - Luôn hiển thị */}
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {exam.average_rating > 0 ? exam.average_rating.toFixed(1) : "0.0"}
              {exam.total_ratings > 0 && (
                <span className="text-xs text-amber-600">
                  ({exam.total_ratings})
                </span>
              )}
            </span>
            {/* Số lượt làm */}
            {exam.count !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                <Users className="h-4 w-4 text-blue-600" />
                {exam.count || 0} lượt làm
              </span>
            )}
            {exam.status && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${exam.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                exam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  exam.status === 'ended' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                }`}>
                {exam.status === 'ongoing' ? 'Đang diễn ra' :
                  exam.status === 'upcoming' ? 'Sắp tới' :
                    exam.status === 'ended' ? 'Đã kết thúc' :
                      'Không giới hạn thời gian'}
              </span>
            )}
            {exam.is_paid && parseFloat(exam.fee || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <Wallet className="h-4 w-4 text-emerald-600" />
                {formatCurrency(exam.fee)}/ lượt thi
              </span>
            )}
          </div>

          {exam.classes && exam.classes.length > 0 && (
            <div className="space-y-1 text-sm text-slate-600">
              {exam.classes.length > 1 ? (
                <div>
                  <p className="font-semibold text-slate-800">{exam.classes.length} lớp học</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {exam.classes.map((cls, idx) => (
                      <span key={cls.id || idx} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                        {cls.className} {cls.classCode ? `(${cls.classCode})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">{exam.classes[0].className}</p>
                  {exam.classes[0].classCode && (
                    <p className="text-slate-500 line-clamp-1">Mã lớp: {exam.classes[0].classCode}</p>
                  )}
                </>
              )}
            </div>
          )}
          {!exam.classes && exam.class && (
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{exam.class.className}</p>
              {exam.class.classCode && (
                <p className="text-slate-500 line-clamp-1">Mã lớp: {exam.class.classCode}</p>
              )}
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={() => handleExamClick(exam.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Play className="h-4 w-4" />
              Xem
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Tìm kiếm bài thi</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                {pagination.total.toLocaleString("vi-VN")}
              </span>
              kết quả
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-4 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    type="text"
                    placeholder="Nhập từ khóa tên bài thi"
                    className="w-full border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <Search className="h-4 w-4" />
                  Tìm kiếm
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                Lọc
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Bộ lọc</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      <X className="h-3 w-3" />
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {/* Filter Inputs */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Filter: Có trả phí hay không */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Trả phí
                    </label>
                    <select
                      value={filters.is_paid}
                      onChange={(e) => handleFilterChange("is_paid", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Có trả phí</option>
                      <option value="false">Miễn phí</option>
                    </select>
                  </div>

                  {/* Filter: Theo lớp */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Theo lớp mình đang tham gia
                    </label>
                    <select
                      value={filters.class_id}
                      onChange={(e) => handleFilterChange("class_id", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    >
                      <option value="">Tất cả</option>
                      {availableClasses.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name} {classItem.code ? `(${classItem.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent" />
              <p className="mt-3 text-sm font-medium text-slate-600">Đang tải danh sách đề thi...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-base font-semibold text-slate-800">Không tìm thấy đề thi phù hợp</p>
              <p className="mt-1 text-sm text-slate-500">
                {activeSearchTerm.trim()
                  ? "Thử đổi từ khóa khác hoặc kiểm tra chính tả."
                  : "Không có đề thi nào phù hợp với bộ lọc của bạn."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {exams.map(renderCard)}
              </div>

              {/* Pagination - Luôn hiển thị khi có dữ liệu */}
              {!loading && exams.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm text-slate-600">
                    Hiển thị
                    <span className="mx-1 font-semibold">
                      {pagination.total > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0}
                    </span>
                    -
                    <span className="mx-1 font-semibold">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    trong
                    <span className="mx-1 font-semibold">{pagination.total}</span>
                    đề thi
                  </div>
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page === 1}
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <div className="hidden items-center gap-2 md:flex">
                        {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                          const page = idx + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${pagination.page === page
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.page === pagination.totalPages}
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

