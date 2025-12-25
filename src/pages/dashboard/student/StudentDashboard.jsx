import React, { useEffect, useMemo, useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  Search,
  Play,
  Clock,
  BookOpen,
  Users,
  Star,
  GraduationCap,
  Filter,
  X,
  Calendar,
} from "lucide-react";
import { getStudentExams } from "../../../services/studentExamService";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  
  // Filter states - multiple filters can be active at once
  const [filters, setFilters] = useState({
    created_at_from: "",
    created_at_to: "",
    minutes_min: "",
    minutes_max: "",
    question_count_min: "",
    question_count_max: "",
    average_rating_min: "",
    average_rating_max: "",
  });
  
  // Sort state (separate from filters)
  const [sortBy, setSortBy] = useState(""); // "created_at", "minutes", "question_count", "average_rating"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"
  const [showFilters, setShowFilters] = useState(false);

  useEffectOnce(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const response = await getStudentExams();
        // API trả về mảng exams trực tiếp hoặc trong data
        const examsData = Array.isArray(response) ? response : (response?.data || []);
        setExams(examsData);
      } catch (error) {
        console.error("Error loading exams:", error);
        toast.error(error.message || "Không thể tải danh sách đề thi");
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  const filteredAndSortedExams = useMemo(() => {
    // Filter by search term
    let filtered = exams;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = exams.filter(
        (exam) =>
          exam.title?.toLowerCase().includes(term) ||
          exam.des?.toLowerCase().includes(term) ||
          exam.class?.className?.toLowerCase().includes(term)
      );
    }

    // Apply multiple filters
    filtered = filtered.filter((exam) => {
      // Filter by created date
      if (filters.created_at_from) {
        const examDate = new Date(exam.created_at || 0);
        const fromDate = new Date(filters.created_at_from);
        if (examDate < fromDate) return false;
      }
      if (filters.created_at_to) {
        const examDate = new Date(exam.created_at || 0);
        const toDate = new Date(filters.created_at_to);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (examDate > toDate) return false;
      }

      // Filter by minutes (time duration)
      if (filters.minutes_min) {
        const minMinutes = parseInt(filters.minutes_min);
        if (isNaN(minMinutes) || (exam.minutes || 0) < minMinutes) return false;
      }
      if (filters.minutes_max) {
        const maxMinutes = parseInt(filters.minutes_max);
        if (isNaN(maxMinutes) || (exam.minutes || 0) > maxMinutes) return false;
      }

      // Filter by question count
      if (filters.question_count_min) {
        const minQuestions = parseInt(filters.question_count_min);
        if (isNaN(minQuestions) || (exam.question_count || 0) < minQuestions) return false;
      }
      if (filters.question_count_max) {
        const maxQuestions = parseInt(filters.question_count_max);
        if (isNaN(maxQuestions) || (exam.question_count || 0) > maxQuestions) return false;
      }

      // Filter by average rating
      if (filters.average_rating_min) {
        const minRating = parseFloat(filters.average_rating_min);
        if (isNaN(minRating) || (exam.average_rating || 0) < minRating) return false;
      }
      if (filters.average_rating_max) {
        const maxRating = parseFloat(filters.average_rating_max);
        if (isNaN(maxRating) || (exam.average_rating || 0) > maxRating) return false;
      }

      return true;
    });

    // Sort
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case "created_at":
            aValue = new Date(a.created_at || 0).getTime();
            bValue = new Date(b.created_at || 0).getTime();
            break;
          case "minutes":
            aValue = a.minutes || 0;
            bValue = b.minutes || 0;
            break;
          case "question_count":
            aValue = a.question_count || 0;
            bValue = b.question_count || 0;
            break;
          case "average_rating":
            aValue = a.average_rating || 0;
            bValue = b.average_rating || 0;
            break;
          default:
            return 0;
        }

        if (sortOrder === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    return filtered;
  }, [exams, searchTerm, filters, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedExams.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExams = filteredAndSortedExams.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy, sortOrder]);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
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
      created_at_from: "",
      created_at_to: "",
      minutes_min: "",
      minutes_max: "",
      question_count_min: "",
      question_count_max: "",
      average_rating_min: "",
      average_rating_max: "",
    });
    setSortBy("");
    setSortOrder("desc");
    setSearchTerm("");
  };

  const hasActiveFilters = 
    Object.values(filters).some((v) => v !== "") || 
    sortBy || 
    searchTerm.trim();

  const activeFilterCount = [
    ...Object.values(filters).filter((v) => v !== ""),
    sortBy && "1",
    searchTerm.trim() && "1",
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
          {/* Exam Image or Default Gradient */}
          {exam.image_url ? (
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={exam.image_url.startsWith('http') ? exam.image_url : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000"}${exam.image_url}`}
                alt={exam.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback to default gradient if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="hidden h-full w-full bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {exam.class?.className || "Public"}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {formatDate(exam.created_at)}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">
                  {exam.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-indigo-600">
                  {exam.des || exam.class?.className || "Không có mô tả"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {exam.class?.className || "Public"}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formatDate(exam.created_at)}
                </span>
              </div>
              <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">
                {exam.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-indigo-600">
                {exam.des || exam.class?.className || "Không có mô tả"}
              </p>
            </div>
          )}
          
          {/* Overlay info on image */}
          {exam.image_url && (
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {exam.class?.className || "Public"}
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
                  {exam.des || exam.class?.className || "Không có mô tả"}
                </p>
              </div>
            </div>
          )}
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
            {exam.average_rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {exam.average_rating.toFixed(1)}
                {exam.total_ratings > 0 && (
                  <span className="text-xs text-amber-600">
                    ({exam.total_ratings})
                  </span>
                )}
              </span>
            )}
            {exam.status && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                exam.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                exam.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                exam.status === 'ended' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {exam.status === 'ongoing' ? 'Đang diễn ra' :
                 exam.status === 'upcoming' ? 'Sắp tới' :
                 exam.status === 'ended' ? 'Đã kết thúc' :
                 'Không giới hạn'}
              </span>
            )}
          </div>

          {exam.class && (
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
              Vào ôn thi
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
                {filteredAndSortedExams.length.toLocaleString("vi-VN")}
              </span>
              kết quả
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full items-center gap-3 rounded-full border border-slate-200 px-4 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Nhập từ khóa tên bài thi, môn học, tác giả..."
                  className="w-full border-none bg-transparent text-sm text-slate-700 outline-none focus:ring-0"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                Lọc & Sắp xếp
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Ngày tạo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Calendar className="h-3.5 w-3.5" />
                      Ngày tạo
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={filters.created_at_from}
                        onChange={(e) => handleFilterChange("created_at_from", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Từ ngày"
                      />
                      <input
                        type="date"
                        value={filters.created_at_to}
                        onChange={(e) => handleFilterChange("created_at_to", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Đến ngày"
                      />
                    </div>
                  </div>

                  {/* Thời gian làm bài */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Clock className="h-3.5 w-3.5" />
                      Thời gian (phút)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="0"
                        value={filters.minutes_min}
                        onChange={(e) => handleFilterChange("minutes_min", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Tối thiểu"
                      />
                      <input
                        type="number"
                        min="0"
                        value={filters.minutes_max}
                        onChange={(e) => handleFilterChange("minutes_max", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Tối đa"
                      />
                    </div>
                  </div>

                  {/* Số câu hỏi */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <BookOpen className="h-3.5 w-3.5" />
                      Số câu hỏi
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="0"
                        value={filters.question_count_min}
                        onChange={(e) => handleFilterChange("question_count_min", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Tối thiểu"
                      />
                      <input
                        type="number"
                        min="0"
                        value={filters.question_count_max}
                        onChange={(e) => handleFilterChange("question_count_max", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Tối đa"
                      />
                    </div>
                  </div>

                  {/* Số sao */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Star className="h-3.5 w-3.5" />
                      Số sao
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.average_rating_min}
                        onChange={(e) => handleFilterChange("average_rating_min", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Tối thiểu (0-5)"
                      />
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.average_rating_max}
                        onChange={(e) => handleFilterChange("average_rating_max", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        placeholder="Tối đa (0-5)"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Section */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="mb-3 text-xs font-semibold text-slate-700">Sắp xếp theo</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      onClick={() => handleSortChange("created_at")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        sortBy === "created_at"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      Ngày tạo
                      {sortBy === "created_at" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSortChange("minutes")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        sortBy === "minutes"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      Thời gian
                      {sortBy === "minutes" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSortChange("question_count")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        sortBy === "question_count"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      Số câu hỏi
                      {sortBy === "question_count" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSortChange("average_rating")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        sortBy === "average_rating"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Star className="h-4 w-4" />
                      Số sao
                      {sortBy === "average_rating" && (
                        <span className="text-xs">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
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
          ) : paginatedExams.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-base font-semibold text-slate-800">Không tìm thấy đề thi phù hợp</p>
              <p className="mt-1 text-sm text-slate-500">
                Thử đổi từ khóa khác hoặc kiểm tra chính tả.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedExams.map(renderCard)}
              </div>

              {filteredAndSortedExams.length > pageSize && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm text-slate-600">
                    Hiển thị
                    <span className="mx-1 font-semibold">{startIndex + 1}</span>
                    -
                    <span className="mx-1 font-semibold">
                      {Math.min(endIndex, filteredAndSortedExams.length)}
                    </span>
                    trong
                    <span className="mx-1 font-semibold">{filteredAndSortedExams.length}</span>
                    đề thi
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <div className="hidden items-center gap-2 md:flex">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const page = idx + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${currentPage === page
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
