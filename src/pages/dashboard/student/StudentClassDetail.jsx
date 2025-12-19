import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
    FiArrowLeft,
    FiLoader,
    FiMessageSquare,
    FiPlus,
    FiUsers,
    FiLogOut,
} from "react-icons/fi";
import {
    getClassPosts,
    getPostComments,
    addPostComment,
} from "../../../services/postService";
import { getClassStudents } from "../../../services/classService";
import formatDateTime from "../../../utils/format_time";

export default function StudentClassDetail() {
    const { classId } = useParams();
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [comments, setComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});
    const [expandedPosts, setExpandedPosts] = useState(new Set());
    const [commentForms, setCommentForms] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadClassDetail();
        if (activeTab === "posts") {
            loadPosts();
        } else if (activeTab === "students") {
            loadStudents();
        }
    }, [classId, activeTab]);

    const loadClassDetail = async () => {
        setLoading(true);
        try {
            const response = await getClassStudents({ classId });
            const classData = response?.class || response?.classInfo || response?.data || response || {};
            setClassInfo({
                id: classData.id ?? classData.classId,
                className: classData.className ?? classData.name ?? "Chưa đặt tên",
                classCode: classData.classCode ?? classData.class_code ?? "—",
            });
        } catch (error) {
            toast.error(error?.body?.message || error?.message || "Không thể tải thông tin lớp học.");
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        if (!classId) return;
        try {
            const response = await getClassStudents({ classId });
            const studentsList = Array.isArray(response?.students)
                ? response.students
                : Array.isArray(response?.data?.students)
                    ? response.data.students
                    : [];
            setStudents(
                studentsList.map((student) => ({
                    id: student.id ?? student.student_id,
                    fullName: student.fullName ?? student.name ?? "Chưa cập nhật",
                    email: student.email ?? "—",
                    joinedAt: student.joinedAt ?? student.joined_at,
                }))
            );
        } catch (error) {
            toast.error(error?.body?.message || error?.message || "Không thể tải danh sách học sinh.");
        }
    };

    const loadPosts = async () => {
        if (!classId) return;
        setLoadingPosts(true);
        try {
            const response = await getClassPosts(classId);
            const postsList = Array.isArray(response) ? response : [];
            setPosts(postsList);
        } catch (error) {
            toast.error(error?.body?.message || error?.message || "Không thể tải bài đăng.");
        } finally {
            setLoadingPosts(false);
        }
    };

    const loadComments = async (postId) => {
        if (!postId) return;
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));
        try {
            const response = await getPostComments(postId);
            const commentsList = Array.isArray(response) ? response : [];
            setComments((prev) => ({ ...prev, [postId]: commentsList }));
        } catch (error) {
            toast.error(error?.body?.message || error?.message || "Không thể tải bình luận.");
        } finally {
            setLoadingComments((prev) => ({ ...prev, [postId]: false }));
        }
    };

    const toggleComments = (postId) => {
        setExpandedPosts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
                if (!comments[postId]) {
                    loadComments(postId);
                }
            }
            return newSet;
        });
    };

    const handleAddComment = async (e, postId) => {
        e.preventDefault();
        const commentText = commentForms[postId]?.trim();
        if (!commentText) {
            toast.error("Vui lòng nhập nội dung bình luận.");
            return;
        }

        try {
            const newComment = await addPostComment({
                postId,
                comment: commentText,
            });
            setComments((prev) => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newComment],
            }));
            setCommentForms((prev) => ({ ...prev, [postId]: "" }));
            toast.success("Đã thêm bình luận thành công.");
        } catch (error) {
            toast.error(error?.body?.message || error?.message || "Không thể thêm bình luận.");
        }
    };

    const handleLeaveClass = async () => {
        if (!window.confirm("Bạn chắc chắn muốn rời khỏi lớp học này?")) return;

        try {
            // TODO: Implement leave class API call
            toast.success("Đã rời khỏi lớp học thành công.");
            navigate("/dashboard/student/classes");
        } catch (error) {
            toast.error(error?.body?.message || error?.message || "Không thể rời khỏi lớp học.");
        }
    };

    const filteredStudents = students.filter(
        (student) =>
            student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderPostsTab = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Bài đăng trong lớp</h3>
            </div>

            {loadingPosts ? (
                <div className="flex items-center justify-center py-10 text-slate-500">
                    <FiLoader className="mr-2 animate-spin" />
                    Đang tải bài đăng...
                </div>
            ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
                    Chưa có bài đăng nào trong lớp này.
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-semibold text-slate-900">{post.title}</h4>
                                        {post.author && (
                                            <span className="text-xs text-slate-500">
                                                bởi {post.author.fullName || post.author.fullname}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                                        {post.text || post.post}
                                    </p>
                                    <p className="mt-3 text-xs text-slate-400">
                                        {formatDateTime(post.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="mt-4 border-t border-slate-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => toggleComments(post.id)}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
                                >
                                    <FiMessageSquare />
                                    {expandedPosts.has(post.id) ? "Ẩn bình luận" : "Xem bình luận"}
                                    {comments[post.id] && (
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                                            {comments[post.id].length}
                                        </span>
                                    )}
                                </button>

                                {expandedPosts.has(post.id) && (
                                    <div className="mt-4 space-y-4">
                                        {/* Comment Form */}
                                        <form
                                            onSubmit={(e) => handleAddComment(e, post.id)}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={commentForms[post.id] || ""}
                                                onChange={(e) =>
                                                    setCommentForms((prev) => ({
                                                        ...prev,
                                                        [post.id]: e.target.value,
                                                    }))
                                                }
                                                placeholder="Viết bình luận..."
                                                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                            <button
                                                type="submit"
                                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                            >
                                                <FiPlus />
                                                Gửi
                                            </button>
                                        </form>

                                        {/* Comments List */}
                                        {loadingComments[post.id] ? (
                                            <div className="flex items-center justify-center py-4 text-slate-500">
                                                <FiLoader className="mr-2 animate-spin" />
                                                Đang tải bình luận...
                                            </div>
                                        ) : !comments[post.id] || comments[post.id].length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-sm text-slate-500">
                                                Chưa có bình luận nào.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {comments[post.id].map((comment) => (
                                                    <div
                                                        key={comment.id}
                                                        className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-slate-900">
                                                                    {comment.author?.fullName || "Người dùng"}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    {formatDateTime(comment.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                                                                {comment.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStudentsTab = () => (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                    <FiUsers className="text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm học sinh theo tên hoặc email..."
                        className="w-full border-none text-sm outline-none focus:ring-0"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 text-left">STT</th>
                            <th className="px-4 py-3 text-left">Họ và tên</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Ngày tham gia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-6 text-center text-sm text-slate-500"
                                >
                                    Không tìm thấy học sinh phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <tr key={student.id}>
                                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-900">
                                        {student.fullName}
                                    </td>
                                    <td className="px-4 py-3">{student.email}</td>
                                    <td className="px-4 py-3">
                                        {student.joinedAt
                                            ? new Intl.DateTimeFormat("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            }).format(new Date(student.joinedAt))
                                            : "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center py-20">
                    <FiLoader className="animate-spin text-3xl text-indigo-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1">
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard/student/classes")}
                                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                <FiArrowLeft />
                                Quay lại
                            </button>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                                Chi tiết lớp học
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                                {classInfo?.className || "Lớp học"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Mã lớp: {classInfo?.classCode || "—"}
                            </p>
                        </div>
                        <button
                            onClick={handleLeaveClass}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                        >
                            <FiLogOut />
                            Rời khỏi lớp học
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex gap-2 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "posts"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-slate-600 hover:text-indigo-600"
                                }`}
                        >
                            Bài đăng
                        </button>
                        <button
                            onClick={() => setActiveTab("students")}
                            className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "students"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-slate-600 hover:text-indigo-600"
                                }`}
                        >
                            Danh sách sinh viên
                        </button>
                    </div>

                    {activeTab === "posts" ? renderPostsTab() : renderStudentsTab()}
                </div>
            </div>
        </DashboardLayout>
    );
}

