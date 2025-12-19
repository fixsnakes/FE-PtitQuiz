import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
    Clock,
    AlertCircle,
    Play,
    Calendar,
    RotateCcw,
} from "lucide-react";

export default function RecentExams() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [recentExams, setRecentExams] = useState([]);

    useEffect(() => {
        loadRecentExams();
    }, []);

    const loadRecentExams = () => {
        setLoading(true);
        // Mock data - giả lập danh sách bài thi truy cập gần đây
        const mockRecentExams = [
            {
                id: 1,
                examId: 101,
                examCode: "EXAM001",
                examTitle: "Kiểm tra giữa kỳ môn Toán",
                minutes: 60,
                createdAt: "2024-01-10T10:00:00",
                attemptCount: 3,
            },
            {
                id: 2,
                examId: 102,
                examCode: "EXAM002",
                examTitle: "Bài kiểm tra Vật lý",
                minutes: 45,
                createdAt: "2024-01-12T14:30:00",
                attemptCount: 2,
            },
            {
                id: 3,
                examId: 103,
                examCode: "EXAM003",
                examTitle: "Thi cuối kỳ Hóa học",
                minutes: 90,
                createdAt: "2024-01-08T09:15:00",
                attemptCount: 1,
            },
            {
                id: 4,
                examId: 104,
                examCode: "EXAM004",
                examTitle: "Kiểm tra tiếng Anh",
                minutes: 50,
                createdAt: "2024-01-15T16:45:00",
                attemptCount: 5,
            },
            {
                id: 5,
                examId: 105,
                examCode: "EXAM005",
                examTitle: "Bài thi Lịch sử",
                minutes: 40,
                createdAt: "2024-01-11T11:20:00",
                attemptCount: 2,
            },
            {
                id: 6,
                examId: 106,
                examCode: "EXAM006",
                examTitle: "Kiểm tra Địa lý",
                minutes: 35,
                createdAt: "2024-01-13T13:10:00",
                attemptCount: 4,
            },
        ];

        setTimeout(() => {
            setRecentExams(mockRecentExams);
            setLoading(false);
        }, 500);
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

    const handleStartExam = (examId) => {
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
                                key={exam.id}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
                            >
                                <div className="mb-4">
                                    <div className="mb-3">
                                        <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                            {exam.examCode}
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

