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
} from "lucide-react";
import { getStudentExams } from "../../../services/studentExamService";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

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

  const filteredExams = useMemo(() => {
    if (!searchTerm.trim()) return exams;
    const term = searchTerm.toLowerCase().trim();
    return exams.filter(
      (exam) =>
        exam.title?.toLowerCase().includes(term) ||
        exam.des?.toLowerCase().includes(term) ||
        exam.class?.className?.toLowerCase().includes(term)
    );
  }, [exams, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExams = filteredExams.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
                {filteredExams.length.toLocaleString("vi-VN")}
              </span>
              kết quả
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
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

              {filteredExams.length > pageSize && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm text-slate-600">
                    Hiển thị
                    <span className="mx-1 font-semibold">{startIndex + 1}</span>
                    -
                    <span className="mx-1 font-semibold">
                      {Math.min(endIndex, filteredExams.length)}
                    </span>
                    trong
                    <span className="mx-1 font-semibold">{filteredExams.length}</span>
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
