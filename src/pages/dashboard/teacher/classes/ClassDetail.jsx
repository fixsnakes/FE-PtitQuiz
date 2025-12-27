import React, { useEffect, useMemo, useState } from "react";
import { useEffectOnce } from "../../../../hooks/useEffectOnce";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCopy,
  FiLoader,
  FiRefreshCw,
  FiShieldOff,
  FiTrash2,
  FiUnlock,
  FiUsers,
  FiPlus,
  FiEdit2,
  FiMessageSquare,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";
import { toast } from "react-toastify";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import {
  deleteClass,
  getClassStudents,
  updateStudentBanStatus,
  updateClass,
} from "../../../../services/classService";
import {
  createPost,
  getClassPosts,
  updatePost,
  deletePost,
  getPostComments,
  addPostComment,
  deletePostComment,
} from "../../../../services/postService";
import { listExams } from "../../../../services/examService";
import formatDateTime from "../../../../utils/format_time";

const PAGE_SIZE = 10;

function normalizeClassDetail(payload) {
  const classInfo =
    payload?.class || payload?.classInfo || payload?.data || payload || {};
  const students = Array.isArray(payload?.students)
    ? payload.students
    : Array.isArray(payload?.data?.students)
    ? payload.data.students
    : Array.isArray(classInfo?.students)
    ? classInfo.students
    : [];

  return {
    classInfo: {
      id: classInfo.id ?? classInfo.classId ?? classInfo._id,
      className: classInfo.className ?? classInfo.name ?? "Chưa đặt tên",
      classCode: classInfo.classCode ?? classInfo.class_code ?? "—",
      createdAt: classInfo.createdAt ?? classInfo.created_at ?? null,
      totalStudents:
        classInfo.studentsCount ??
        classInfo.studentCount ??
        classInfo.totalStudents ??
        students.length,
    },
    students: students.map((student) => ({
      id: student.id ?? student.student_id ?? student._id,
      fullName: student.fullName ?? student.name ?? "Chưa cập nhật",
      email: student.email ?? "—",
      joinedAt: 
        student.Class_student?.joined_at ?? 
        student.ClassStudent?.joined_at ??
        student.joinedAt ?? 
        student.joined_at ?? 
        student.createdAt,
      isBanned:
        student.Class_student?.is_ban ??
        student.ClassStudent?.is_ban ??
        student.is_banned ?? 
        student.isBanned ?? 
        student.isBan ?? 
        false,
    })),
  };
}

export default function ClassDetail() {
  const { classId: classParam } = useParams();
  const navigate = useNavigate();

  const isNumericId = /^\d+$/.test(classParam);
  const classId = isNumericId ? classParam : undefined;
  const classCode = !isNumericId ? classParam : undefined;

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [processingStudentId, setProcessingStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState("students");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", post: "" });
  const [comments, setComments] = useState({}); // { postId: [comments] }
  const [loadingComments, setLoadingComments] = useState({}); // { postId: boolean }
  const [expandedPosts, setExpandedPosts] = useState(new Set()); // Track which posts show comments
  const [commentForms, setCommentForms] = useState({}); // { postId: commentText }
  const [userRole, setUserRole] = useState(""); // User role from localStorage
  const [currentUserId, setCurrentUserId] = useState(null); // Current user ID from localStorage
  const [exams, setExams] = useState([]); // List of exams in the class
  const [loadingExams, setLoadingExams] = useState(false); // Loading state for exams
  const [isEditingClassName, setIsEditingClassName] = useState(false); // Edit class name mode
  const [classNameInput, setClassNameInput] = useState(""); // Input for class name
  const [updatingClassName, setUpdatingClassName] = useState(false); // Loading state for update

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return students;
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(keyword) ||
        student.email.toLowerCase().includes(keyword)
    );
  }, [students, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const firstIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedStudents = filteredStudents.slice(
    firstIndex,
    firstIndex + PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadClassDetail = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await getClassStudents({ classId, classCode });
      const normalized = normalizeClassDetail(payload);
      setClassInfo(normalized.classInfo);
      setStudents(normalized.students);
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Không thể tải dữ liệu lớp học.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffectOnce(() => {
    // Get user role and id from localStorage
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserRole(user.role || "");
        setCurrentUserId(user.id || null);
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    loadClassDetail();
  }, [classId, classCode]);

  useEffect(() => {
    if (activeTab === "posts" && classInfo?.id) {
      loadPosts();
    }
    if (activeTab === "exams" && classInfo?.id) {
      loadExams();
    }
  }, [activeTab, classInfo?.id]);

  const handleBanToggle = async (studentId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "khóa" : "mở khóa";
    
    // Get the actual class ID (from URL param or classInfo)
    const actualClassId = classId || classInfo?.id;
    
    if (!actualClassId) {
      toast.error("Không tìm thấy thông tin lớp học. Vui lòng làm mới trang.");
      return;
    }

    if (!studentId) {
      toast.error("Không tìm thấy thông tin học sinh.");
      return;
    }

    // Convert to number if needed
    const classIdNum = typeof actualClassId === 'string' ? parseInt(actualClassId, 10) : actualClassId;
    const studentIdNum = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    
    if (isNaN(classIdNum) || isNaN(studentIdNum)) {
      toast.error("Dữ liệu không hợp lệ. Vui lòng thử lại.");
      return;
    }
    
    if (!window.confirm(
      `Bạn chắc chắn muốn ${action} học sinh này?`
    )) {
      return;
    }

    try {
      setProcessingStudentId(studentId);
      await updateStudentBanStatus({
        classId: classIdNum,
        studentId: studentIdNum,
        isBanned: newStatus,
      });
      
      // Update local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, isBanned: newStatus }
            : student
        )
      );
      
      // Show success message
      toast.success(
        newStatus 
          ? "Đã khóa học sinh thành công" 
          : "Đã mở khóa học sinh thành công"
      );
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        `Không thể ${action} học sinh. Vui lòng thử lại.`;
      toast.error(message);
    } finally {
      setProcessingStudentId(null);
    }
  };

  const handleDeleteClass = async () => {
    if (!classInfo) return;
    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xóa lớp "${classInfo.className}"?`
    );
    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      await deleteClass(classInfo.id);
      navigate("/teacher/classes", { replace: true });
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Không thể xóa lớp. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStartEditClassName = () => {
    if (!classInfo) return;
    setClassNameInput(classInfo.className);
    setIsEditingClassName(true);
  };

  const handleCancelEditClassName = () => {
    setIsEditingClassName(false);
    setClassNameInput("");
  };

  const handleUpdateClassName = async (e) => {
    e.preventDefault();
    if (!classInfo?.id) return;

    const trimmedName = classNameInput.trim();
    if (!trimmedName) {
      toast.error("Tên lớp không được để trống.");
      return;
    }

    if (trimmedName === classInfo.className) {
      setIsEditingClassName(false);
      return;
    }

    try {
      setUpdatingClassName(true);
      const response = await updateClass(classInfo.id, { className: trimmedName });
      
      // Update local state
      setClassInfo((prev) => ({
        ...prev,
        className: trimmedName,
      }));
      
      setIsEditingClassName(false);
      toast.success("Đã cập nhật tên lớp thành công.");
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Không thể cập nhật tên lớp. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setUpdatingClassName(false);
    }
  };

  const renderStudentsTab = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <FiUsers className="text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm kiếm học sinh theo tên hoặc email..."
            className="w-full border-none text-sm outline-none focus:ring-0"
          />
        </div>
        <button
          type="button"
          onClick={loadClassDetail}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <FiRefreshCw />
          Làm mới
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">STT</th>
              <th className="px-4 py-3 text-left">Họ và tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Ngày tham gia</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  Không tìm thấy học sinh phù hợp.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, index) => (
                <tr key={student.id}>
                  <td className="px-4 py-3 text-slate-500">
                    {firstIndex + index + 1}
                  </td>
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
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        student.isBanned
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {student.isBanned ? "Bị khóa" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        handleBanToggle(student.id, student.isBanned)
                      }
                      disabled={processingStudentId === student.id}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        student.isBanned
                          ? "border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          : "border border-red-200 text-red-600 hover:bg-red-50"
                      } disabled:opacity-50`}
                    >
                      {processingStudentId === student.id ? (
                        <FiLoader className="animate-spin" />
                      ) : student.isBanned ? (
                        <FiUnlock />
                      ) : (
                        <FiShieldOff />
                      )}
                      {student.isBanned ? "Mở khóa" : "Khóa học sinh"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredStudents.length > PAGE_SIZE && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="text-slate-500">
            Trang {safePage}/{totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-white disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-white disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const loadPosts = async () => {
    if (!classInfo?.id) return;
    setLoadingPosts(true);
    try {
      const response = await getClassPosts(classInfo.id);
      const postsList = Array.isArray(response) ? response : [];
      setPosts(postsList);
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể tải bài đăng.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.post.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      await createPost({
        classId: classInfo.id,
        title: postForm.title,
        post: postForm.post,
      });
      toast.success("Đã tạo bài đăng thành công.");
      setPostForm({ title: "", post: "" });
      setShowPostForm(false);
      loadPosts();
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể tạo bài đăng.");
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!postForm.title.trim() || !postForm.post.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      await updatePost(editingPost.id, {
        title: postForm.title,
        post: postForm.post,
      });
      toast.success("Đã cập nhật bài đăng thành công.");
      setPostForm({ title: "", post: "" });
      setEditingPost(null);
      loadPosts();
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể cập nhật bài đăng.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài đăng này?")) return;

    try {
      await deletePost(postId);
      toast.success("Đã xóa bài đăng thành công.");
      loadPosts();
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể xóa bài đăng.");
    }
  };

  const startEditPost = (post) => {
    setEditingPost(post);
    setPostForm({ title: post.title || "", post: post.text || post.post || "" });
    setShowPostForm(true);
  };

  const cancelPostForm = () => {
    setShowPostForm(false);
    setEditingPost(null);
    setPostForm({ title: "", post: "" });
  };

  // Comments functions
  const loadComments = async (postId) => {
    if (!postId) return;
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await getPostComments(postId);
      const commentsList = Array.isArray(response) ? response : [];
      setComments((prev) => ({ ...prev, [postId]: commentsList }));
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể tải bình luận.");
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
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể thêm bình luận.");
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bình luận này?")) return;

    try {
      await deletePostComment(commentId);
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
      toast.success("Đã xóa bình luận thành công.");
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể xóa bình luận.");
    }
  };

  // Exams functions
  const loadExams = async () => {
    if (!classInfo?.id) return;
    setLoadingExams(true);
    try {
      const response = await listExams({ class_id: classInfo.id });

      // API /api/exams trả về dạng { data: [...], pagination: {...} }
      const examsList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.exams)
        ? response.exams
        : [];

      setExams(examsList);
    } catch (err) {
      toast.error(err?.body?.message || err?.message || "Không thể tải danh sách đề thi.");
    } finally {
      setLoadingExams(false);
    }
  };

  const renderExamsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Đề thi trong lớp</h3>
        <button
          type="button"
          onClick={loadExams}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <FiRefreshCw />
          Làm mới
        </button>
      </div>

      {loadingExams ? (
        <div className="flex items-center justify-center py-10 text-slate-500">
          <FiLoader className="mr-2 animate-spin" />
          Đang tải danh sách đề thi...
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
          Chưa có đề thi nào trong lớp này.
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FiFileText className="text-indigo-600 text-xl" />
                    <h4 className="text-lg font-semibold text-slate-900">{exam.title}</h4>
                  </div>
                  {exam.description && (
                    <p className="mt-2 text-sm text-slate-600">{exam.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    {exam.minutes && (
                      <span>Thời gian: {exam.minutes} phút</span>
                    )}
                    {exam.total_questions && (
                      <span>Số câu hỏi: {exam.total_questions}</span>
                    )}
                    {exam.created_at && (
                      <span>Tạo lúc: {formatDateTime(exam.created_at)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}/edit`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    <FiEdit2 />
                    Xem chi tiết
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/teacher/exams/${exam.id}/results`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <FiExternalLink />
                    Kết quả
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPostsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Bài đăng trong lớp</h3>
        {userRole === "teacher" && !showPostForm && (
          <button
            type="button"
            onClick={() => setShowPostForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <FiPlus />
            Tạo bài đăng mới
          </button>
        )}
      </div>

      {showPostForm && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6">
          <h4 className="mb-4 text-lg font-semibold text-indigo-900">
            {editingPost ? "Chỉnh sửa bài đăng" : "Tạo bài đăng mới"}
          </h4>
          <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Tiêu đề</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                placeholder="Nhập tiêu đề bài đăng"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nội dung</label>
              <textarea
                value={postForm.post}
                onChange={(e) => setPostForm({ ...postForm, post: e.target.value })}
                placeholder="Nhập nội dung bài đăng"
                rows={6}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                {editingPost ? "Cập nhật" : "Đăng"}
              </button>
              <button
                type="button"
                onClick={cancelPostForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {loadingPosts ? (
        <div className="flex items-center justify-center py-10 text-slate-500">
          <FiLoader className="mr-2 animate-spin" />
          Đang tải bài đăng...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
          Chưa có bài đăng nào. Hãy tạo bài đăng đầu tiên.
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
                {userRole === "teacher" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditPost(post)}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      <FiEdit2 />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 />
                      Xóa
                    </button>
                  </div>
                )}
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
                            {userRole === "teacher" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="ml-2 inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 />
                              </button>
                            )}
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

  const renderPlaceholderTab = (title) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
      Nội dung {title} sẽ được tích hợp sau khi hoàn thiện phần API tương ứng.
    </div>
  );

  const tabContent = {
    students: renderStudentsTab(),
    posts: renderPostsTab(),
    exams: renderExamsTab(),
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FiArrowLeft />
                Quay lại
              </button>
              {isEditingClassName ? (
                <form onSubmit={handleUpdateClassName} className="mt-3 flex items-center gap-3">
                  <input
                    type="text"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    disabled={updatingClassName}
                    className="rounded-lg border border-indigo-300 px-4 py-2 text-2xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
                    placeholder="Nhập tên lớp"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={updatingClassName}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {updatingClassName ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditClassName}
                    disabled={updatingClassName}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Hủy
                  </button>
                </form>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {classInfo?.className || "Chi tiết lớp học"}
                  </h1>
                  {userRole === "teacher" && classInfo && (
                    <button
                      type="button"
                      onClick={handleStartEditClassName}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      title="Chỉnh sửa tên lớp"
                    >
                      <FiEdit2 />
                      Sửa tên
                    </button>
                  )}
                </div>
              )}
              
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200 px-4 py-2 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Mã lớp
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {classInfo?.classCode}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!classInfo?.classCode) return;
                    try {
                      await navigator.clipboard.writeText(classInfo.classCode);
                      alert("Đã copy mã lớp.");
                    } catch {
                      alert("Không thể copy mã lớp.");
                    }
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
                >
                  <FiCopy />
                  Copy
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 px-4 py-2 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Số học sinh
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {classInfo?.totalStudents ?? students.length}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteClass}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <FiTrash2 />
                {deleteLoading ? "Đang xóa..." : "Xóa lớp"}
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-slate-500">
            <FiLoader className="mb-3 animate-spin text-3xl" />
            Đang tải dữ liệu lớp...
          </div>
        ) : error ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
            <div className="flex items-center gap-3">
              <FiAlertTriangle />
              <p className="font-semibold">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadClassDetail}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-white"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {[
                { key: "students", label: "Danh sách học sinh" },
                { key: "posts", label: "Bài đăng" },
                { key: "exams", label: "Đề thi" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {tabContent[activeTab]}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}


