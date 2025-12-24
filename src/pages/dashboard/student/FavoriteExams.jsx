import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
    Clock,
    AlertCircle,
    Play,
    Heart,
    Search,
    Calendar,
    RotateCcw,
    BookOpen,
} from "lucide-react";
import { getFavoriteExams, removeFavorite } from "../../../services/examFavoriteService";
import { toast } from "react-toastify";
import { useEffectOnce } from "../../../hooks/useEffectOnce";

export default function FavoriteExams() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [favoriteExams, setFavoriteExams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffectOnce(() => {
        loadFavoriteExams();
    }, []);

    const loadFavoriteExams = async () => {
        setLoading(true);
        try {
            const response = await getFavoriteExams();
            console.log("Favorite Exams API Response:", response); // Debug log
            
            // apiClient trả về data trực tiếp, không phải response.data
            const favorites = Array.isArray(response) ? response : (response?.data || []);
            
            if (Array.isArray(favorites) && favorites.length > 0) {
                // Map data từ API response
                const mappedExams = favorites.map((favorite) => {
                    const exam = favorite.exam || {};
                    return {
                        id: favorite.id,
                        examId: exam.id,
                        examCode: `EXAM${exam.id}`,
                        examTitle: exam.title || "Không có tiêu đề",
                        minutes: exam.minutes || 0,
                        createdAt: exam.created_at,
                        attemptCount: exam.count || 0,
                        questionCount: exam.question_count || 0,
                        class: exam.class,
                    };
                });
                console.log("Mapped favorite exams:", mappedExams); // Debug log
                setFavoriteExams(mappedExams);
            } else {
                console.log("No favorite exams found");
                setFavoriteExams([]);
            }
        } catch (error) {
            console.error("Error loading favorite exams:", error);
            toast.error("Không thể tải danh sách bài thi yêu thích");
            setFavoriteExams([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (examId) => {
        try {
            await removeFavorite(examId);
            setFavoriteExams((prev) =>
                prev.filter((exam) => exam.examId !== examId)
            );
            toast.success("Đã xóa khỏi danh sách yêu thích");
        } catch (error) {
            console.error("Error removing favorite:", error);
            toast.error("Không thể xóa khỏi danh sách yêu thích");
        }
    };

    const handleStartExam = (examId) => {
        navigate(`/student/exams/${examId}/take`);
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

    const filteredExams = favoriteExams.filter(
        (exam) =>
            exam.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.examCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                placeholder="Tìm kiếm bài thi yêu thích..."
                                className="w-full border-none bg-transparent text-sm text-slate-600 outline-none focus:ring-0"
                            />
                        </div>
                        <div className="text-sm text-slate-600">
                            Tổng cộng: <span className="font-semibold">{filteredExams.length}</span> bài thi
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                            Đang tải dữ liệu...
                        </div>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <Heart className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                        <p className="text-slate-600">
                            {searchTerm
                                ? "Không tìm thấy bài thi yêu thích nào phù hợp"
                                : "Chưa có bài thi nào được đánh dấu yêu thích"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredExams.map((exam) => (
                            <div
                                key={exam.id}
                                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
                            >
                                {/* Favorite Button */}
                                <button
                                    onClick={() => handleToggleFavorite(exam.examId)}
                                    className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-md transition hover:scale-110"
                                >
                                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                </button>

                                <div className="mb-4 pr-10">
                                    <div className="mb-3">
                                        <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                            {exam.examCode}
                                        </span>
                                        {exam.class && (
                                            <span className="ml-2 inline-block rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                                                {exam.class.className}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                                        {exam.examTitle}
                                    </h3>
                                </div>

                                <div className="mb-4 space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span>Thời lượng: {exam.minutes} phút</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-slate-400" />
                                        <span>Số câu hỏi: {exam.questionCount || 0} câu</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span>Ngày tạo: {formatDate(exam.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RotateCcw className="h-4 w-4 text-slate-400" />
                                        <span>Tổng số lượt thi: {exam.attemptCount} lần</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleStartExam(exam.examId)}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
                                >
                                    <Play className="h-4 w-4" />
                                    Bắt đầu làm bài
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

