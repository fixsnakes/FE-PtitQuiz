import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    // Giả lập gọi API lấy danh sách đề thi
    setLoading(true);
    const mockExams = [
      {
        id: 1,
        title: "Kinh tế chính trị cuối kì 1",
        subject: "Kinh tế chính trị",
        date: "2025-12-24",
        duration: 45,
        questions: 50,
        attempts: 65,
        liked: 0,
        author: "Bạc Thầy Trắc Nghiệm",
        organization: "ĐH Khoa học Xã hội và Nhân văn",
        level: "Đại học",
      },
      {
        id: 2,
        title: "Lịch sử đảng cuối kì 1",
        subject: "Lịch sử Đảng",
        date: "2025-12-24",
        duration: 60,
        questions: 60,
        attempts: 85,
        liked: 0,
        author: "Bạc Thầy Trắc Nghiệm",
        organization: "Khoa Luật (ĐHQG Hà Nội)",
        level: "Đại học",
      },
      {
        id: 3,
        title: "ĐỀ CƯƠNG GDKTPL ÔN TẬP CUỐI KÌ I KHỐI 12",
        subject: "GD Kinh tế & Pháp luật",
        date: "2025-12-24",
        duration: 50,
        questions: 45,
        attempts: 99,
        liked: 0,
        author: "nguyen hoang hai linh",
        organization: "Trường THPT Nhơn Trạch",
        level: "THPT",
      },
      {
        id: 4,
        title: "Kinh tế mác",
        subject: "Kinh tế",
        date: "2025-12-24",
        duration: 40,
        questions: 40,
        attempts: 130,
        liked: 0,
        author: "Đào tung lâm",
        organization: "Đại học Kinh doanh và Công nghệ",
        level: "Đại học",
      },
      {
        id: 5,
        title: "Mmb6736",
        subject: "Tiếng Anh",
        date: "2025-12-24",
        duration: 30,
        questions: 30,
        attempts: 63,
        liked: 0,
        author: "Nguyễn Anh Khoa",
        organization: "Trường THPT Thái Phiên",
        level: "THPT",
      },
      {
        id: 6,
        title: "Địa lý 12 - Ôn tập học kì",
        subject: "Địa lý",
        date: "2025-12-22",
        duration: 45,
        questions: 55,
        attempts: 72,
        liked: 14,
        author: "Nguyễn Thu Thảo",
        organization: "THPT Kim Liên",
        level: "THPT",
      },
      {
        id: 7,
        title: "Ngữ văn 12 - Ôn thi THPT QG",
        subject: "Ngữ văn",
        date: "2025-12-20",
        duration: 90,
        questions: 5,
        attempts: 112,
        liked: 24,
        author: "Trần Văn Tùng",
        organization: "THPT Lê Quý Đôn",
        level: "THPT",
      },
      {
        id: 8,
        title: "Toán 12 - Trắc nghiệm tổng hợp",
        subject: "Toán học",
        date: "2025-12-18",
        duration: 60,
        questions: 50,
        attempts: 205,
        liked: 36,
        author: "Phạm Đức Anh",
        organization: "THPT Chuyên Hà Nội",
        level: "THPT",
      },
      {
        id: 9,
        title: "Hóa học 12 - Ôn cuối kỳ",
        subject: "Hóa học",
        date: "2025-12-15",
        duration: 50,
        questions: 45,
        attempts: 98,
        liked: 11,
        author: "Bùi Hồng Nhung",
        organization: "THPT Yên Hòa",
        level: "THPT",
      },
      {
        id: 10,
        title: "Sinh học 12 - Tế bào & Di truyền",
        subject: "Sinh học",
        date: "2025-12-12",
        duration: 60,
        questions: 60,
        attempts: 76,
        liked: 9,
        author: "Đặng Hồng Quân",
        organization: "THPT Phan Đình Phùng",
        level: "THPT",
      },
      {
        id: 11,
        title: "Vật lý 12 - Điện xoay chiều",
        subject: "Vật lý",
        date: "2025-12-10",
        duration: 55,
        questions: 50,
        attempts: 88,
        liked: 17,
        author: "Lê Minh Tuấn",
        organization: "THPT Nguyễn Huệ",
        level: "THPT",
      },
      {
        id: 12,
        title: "Tiếng Anh 12 - Practice Test",
        subject: "Tiếng Anh",
        date: "2025-12-08",
        duration: 60,
        questions: 60,
        attempts: 140,
        liked: 32,
        author: "Hoàng Quỳnh Trang",
        organization: "THPT Cầu Giấy",
        level: "THPT",
      },
      {
        id: 1,
        title: "Kinh tế chính trị cuối kì 1",
        subject: "Kinh tế chính trị",
        date: "2025-12-24",
        duration: 45,
        questions: 50,
        attempts: 65,
        liked: 0,
        author: "Bạc Thầy Trắc Nghiệm",
        organization: "ĐH Khoa học Xã hội và Nhân văn",
        level: "Đại học",
      },
      {
        id: 2,
        title: "Lịch sử đảng cuối kì 1",
        subject: "Lịch sử Đảng",
        date: "2025-12-24",
        duration: 60,
        questions: 60,
        attempts: 85,
        liked: 0,
        author: "Bạc Thầy Trắc Nghiệm",
        organization: "Khoa Luật (ĐHQG Hà Nội)",
        level: "Đại học",
      },
      {
        id: 3,
        title: "ĐỀ CƯƠNG GDKTPL ÔN TẬP CUỐI KÌ I KHỐI 12",
        subject: "GD Kinh tế & Pháp luật",
        date: "2025-12-24",
        duration: 50,
        questions: 45,
        attempts: 99,
        liked: 0,
        author: "nguyen hoang hai linh",
        organization: "Trường THPT Nhơn Trạch",
        level: "THPT",
      },
      {
        id: 4,
        title: "Kinh tế mác",
        subject: "Kinh tế",
        date: "2025-12-24",
        duration: 40,
        questions: 40,
        attempts: 130,
        liked: 0,
        author: "Đào tung lâm",
        organization: "Đại học Kinh doanh và Công nghệ",
        level: "Đại học",
      },
      {
        id: 5,
        title: "Mmb6736",
        subject: "Tiếng Anh",
        date: "2025-12-24",
        duration: 30,
        questions: 30,
        attempts: 63,
        liked: 0,
        author: "Nguyễn Anh Khoa",
        organization: "Trường THPT Thái Phiên",
        level: "THPT",
      },
      {
        id: 6,
        title: "Địa lý 12 - Ôn tập học kì",
        subject: "Địa lý",
        date: "2025-12-22",
        duration: 45,
        questions: 55,
        attempts: 72,
        liked: 14,
        author: "Nguyễn Thu Thảo",
        organization: "THPT Kim Liên",
        level: "THPT",
      },
      {
        id: 7,
        title: "Ngữ văn 12 - Ôn thi THPT QG",
        subject: "Ngữ văn",
        date: "2025-12-20",
        duration: 90,
        questions: 5,
        attempts: 112,
        liked: 24,
        author: "Trần Văn Tùng",
        organization: "THPT Lê Quý Đôn",
        level: "THPT",
      },
      {
        id: 8,
        title: "Toán 12 - Trắc nghiệm tổng hợp",
        subject: "Toán học",
        date: "2025-12-18",
        duration: 60,
        questions: 50,
        attempts: 205,
        liked: 36,
        author: "Phạm Đức Anh",
        organization: "THPT Chuyên Hà Nội",
        level: "THPT",
      },
      {
        id: 9,
        title: "Hóa học 12 - Ôn cuối kỳ",
        subject: "Hóa học",
        date: "2025-12-15",
        duration: 50,
        questions: 45,
        attempts: 98,
        liked: 11,
        author: "Bùi Hồng Nhung",
        organization: "THPT Yên Hòa",
        level: "THPT",
      },
      {
        id: 10,
        title: "Sinh học 12 - Tế bào & Di truyền",
        subject: "Sinh học",
        date: "2025-12-12",
        duration: 60,
        questions: 60,
        attempts: 76,
        liked: 9,
        author: "Đặng Hồng Quân",
        organization: "THPT Phan Đình Phùng",
        level: "THPT",
      },
      {
        id: 11,
        title: "Vật lý 12 - Điện xoay chiều",
        subject: "Vật lý",
        date: "2025-12-10",
        duration: 55,
        questions: 50,
        attempts: 88,
        liked: 17,
        author: "Lê Minh Tuấn",
        organization: "THPT Nguyễn Huệ",
        level: "THPT",
      },
      {
        id: 12,
        title: "Tiếng Anh 12 - Practice Test",
        subject: "Tiếng Anh",
        date: "2025-12-08",
        duration: 60,
        questions: 60,
        attempts: 140,
        liked: 32,
        author: "Hoàng Quỳnh Trang",
        organization: "THPT Cầu Giấy",
        level: "THPT",
      },
    ];

    setTimeout(() => {
      setExams(mockExams);
      setLoading(false);
    }, 300);
  }, []);

  const filteredExams = useMemo(() => {
    if (!searchTerm.trim()) return exams;
    const term = searchTerm.toLowerCase().trim();
    return exams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(term) ||
        exam.subject.toLowerCase().includes(term) ||
        exam.author.toLowerCase().includes(term)
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

  const renderCard = (exam) => {
    return (
      <div
        key={exam.id}
        className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
      >
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              <GraduationCap className="h-3.5 w-3.5" />
              {exam.level}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {exam.date}
            </span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">
            {exam.title}
          </h3>
          <p className="mt-2 text-sm font-medium text-indigo-600">{exam.subject}</p>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <Clock className="h-4 w-4 text-slate-400" />
              {exam.duration} phút
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <BookOpen className="h-4 w-4 text-slate-400" />
              {exam.questions} câu
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <Users className="h-4 w-4 text-slate-400" />
              {exam.attempts} lượt
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <Star className="h-4 w-4 text-amber-500" />
              {exam.liked}
            </span>
          </div>

          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{exam.author}</p>
            <p className="text-slate-500 line-clamp-1">{exam.organization}</p>
          </div>

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
