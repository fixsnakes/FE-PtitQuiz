import React, { useEffect, useMemo, useState } from "react";
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
} from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  deleteClass,
  getClassStudents,
  updateStudentBanStatus,
} from "../../../services/classService";

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
      joinedAt: student.joinedAt ?? student.joined_at ?? student.createdAt,
      isBanned:
        student.is_banned ?? student.isBanned ?? student.isBan ?? false,
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

  useEffect(() => {
    loadClassDetail();
  }, [classId, classCode]);

  const handleBanToggle = async (studentId, currentStatus) => {
    try {
      setProcessingStudentId(studentId);
      await updateStudentBanStatus({
        classId,
        studentId,
        isBanned: !currentStatus,
      });
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, isBanned: !currentStatus }
            : student
        )
      );
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Không thể cập nhật trạng thái học sinh.";
      alert(message);
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
      alert(message);
    } finally {
      setDeleteLoading(false);
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

  const renderPlaceholderTab = (title) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
      Nội dung {title} sẽ được tích hợp sau khi hoàn thiện phần API tương ứng.
    </div>
  );

  const tabContent = {
    students: renderStudentsTab(),
    posts: renderPlaceholderTab("bài đăng"),
    exams: renderPlaceholderTab("đề thi"),
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
              <h1 className="mt-3 text-3xl font-bold text-slate-900">
                {classInfo?.className || "Chi tiết lớp học"}
              </h1>
              
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


