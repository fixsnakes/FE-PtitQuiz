import React, { useState } from "react";
import { useEffectOnce } from "../../../hooks/useEffectOnce";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import { getStudentSessions } from "../../../services/examSessionService";
import {
    Clock,
    AlertCircle,
    Play,
    Calendar,
    RotateCcw,
    BookOpen,
} from "lucide-react";

export default function RecentExams() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [recentExams, setRecentExams] = useState([]);

    useEffectOnce(() => {
        loadRecentExams();
    }, []);

    const loadRecentExams = async () => {
        setLoading(true);
        try {
            const sessions = await getStudentSessions();
            const sessionsData = Array.isArray(sessions) ? sessions : [];

            // Nhóm sessions theo exam_id và lấy exam mới nhất
            const examMap = new Map();
            
            sessionsData.forEach((session) => {
                if (!session.exam) return;
                
                const examId = session.exam.id;
                
                if (!examMap.has(examId)) {
                    examMap.set(examId, {
                        examId: examId,
                        examTitle: session.exam.title,
                        minutes: session.exam.minutes || 0,
                        createdAt: session.exam.created_at || session.start_time,
                        lastAccessTime: session.start_time,
                        attemptCount: 1,
                        sessionCode: session.code,
                        status: session.status,
                    });
                } else {
                    const existing = examMap.get(examId);
                    existing.attemptCount += 1;
                    // Cập nhật thời gian truy cập mới nhất
                    if (new Date(session.start_time) > new Date(existing.lastAccessTime)) {
                        existing.lastAccessTime = session.start_time;
                        existing.sessionCode = session.code;
                        existing.status = session.status;
                    }
                }
            });

            // Chuyển map thành array và sắp xếp theo thời gian truy cập mới nhất
            const recentExamsList = Array.from(examMap.values())
                .sort((a, b) => new Date(b.lastAccessTime) - new Date(a.lastAccessTime))
                .slice(0, 12); // Giới hạn 12 bài thi gần đây nhất

            setRecentExams(recentExamsList);
        } catch (error) {
            console.error("Error loading recent exams:", error);
            toast.error("Không thể tải danh sách bài thi truy cập gần đây");
            setRecentExams([]);
        } finally {
            setLoading(false);
        }
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

    const handleExamClick = (examId) => {
        navigate(`/dashboard/student/exams/${examId}`);
    };

    const handleStartExam = (examId, e) => {
        e.stopPropagation();
        navigate(`/student/exams/${examId}/take`);
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                            Truy cập gần đây
                        </p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">
                            Bài thi truy cập gần đây
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Danh sách các bài thi bạn đã xem hoặc làm gần đây
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                            Đang tải dữ liệu...
                        </div>
                    </div>
                ) : recentExams.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                        <p className="text-slate-600">Chưa có bài thi nào được truy cập gần đây</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recentExams.map((exam) => (
                            <div
                                key={exam.examId}
                                onClick={() => handleExamClick(exam.examId)}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
                            >
                                <div className="mb-4">
                                    <div className="mb-3">
                                        <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                            {exam.sessionCode || `EXAM${exam.examId}`}
                                        </span>
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
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span>Truy cập: {formatDate(exam.lastAccessTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RotateCcw className="h-4 w-4 text-slate-400" />
                                        <span>Đã làm: {exam.attemptCount} lần</span>
                                    </div>
                                    {exam.status && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-slate-400" />
                                            <span className={`${
                                                exam.status === 'submitted' ? 'text-green-600' :
                                                exam.status === 'in_progress' ? 'text-blue-600' :
                                                'text-slate-600'
                                            }`}>
                                                {exam.status === 'submitted' ? 'Đã nộp' :
                                                 exam.status === 'in_progress' ? 'Đang làm' :
                                                 exam.status}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => handleStartExam(exam.examId, e)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
                                    >
                                        <Play className="h-4 w-4" />
                                        Làm bài
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExamClick(exam.examId);
                                        }}
                                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

