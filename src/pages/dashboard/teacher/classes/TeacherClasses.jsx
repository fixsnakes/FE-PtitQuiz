import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBarChart2,
  FiBookOpen,
  FiCopy,
  FiFilter,
  FiLoader,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiShare2,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import DashboardLayout from "../../../../layouts/DashboardLayout";
import {
  deleteClass,
  getTeacherClasses,
} from "../../../../services/classService";

const PAGE_SIZE = 6;
const CARD_GRADIENTS = [
  "from-[#fef2ff] via-[#f6e8ff] to-[#eef2ff]",
  "from-[#fff4ec] via-[#ffe6d8] to-[#fff0f5]",
  "from-[#e9f9ff] via-[#eaf3ff] to-[#f5f1ff]",
];

function normalizeClasses(payload) {
  // Xử lý các format response khác nhau
  let list = [];
  
  if (Array.isArray(payload)) {
    list = payload;
  } else if (Array.isArray(payload?.data)) {
    // Format: { status: true, data: [...] }
    list = payload.data;
  } else if (Array.isArray(payload?.classes)) {
    // Format: { classes: [...] }
    list = payload.classes;
  } else if (payload?.data && Array.isArray(payload.data)) {
    // Fallback cho các format khác
    list = payload.data;
  }

  return list.map((item) => ({
    id: item.id ?? item.classId ?? item._id,
    className: item.className ?? item.name ?? "Chưa đặt tên",
    classCode: item.classCode ?? item.class_code ?? "—",
    studentCount:
      item.studentsCount ??
      item.studentCount ??
      item.totalStudents ??
      item.students?.length ??
      0,
    createdAt: item.createdAt ?? item.created_at ?? item.createdOn ?? null,
  }));
}

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const filteredClasses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return classes;
    return classes.filter((classItem) =>
      classItem.className.toLowerCase().includes(keyword)
    );
  }, [classes, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const firstIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedClasses = filteredClasses.slice(
    firstIndex,
    firstIndex + PAGE_SIZE
  );

  const totalStudents = classes.reduce(
    (sum, classItem) => sum + (classItem.studentCount || 0),
    0
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await getTeacherClasses();
      setClasses(normalizeClasses(payload));
    } catch (apiError) {
      const message =
        apiError.body?.message || apiError.message || "Không thể tải lớp học.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleDelete = async (classId, className) => {
    const confirmDelete = window.confirm(
      `Bạn chắc chắn muốn xóa lớp "${className}"?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingClassId(classId);
      await deleteClass(classId);
      setClasses((prev) => prev.filter((item) => item.id !== classId));
    } catch (apiError) {
      const message =
        apiError.body?.message ||
        apiError.message ||
        "Xóa lớp thất bại. Vui lòng thử lại.";
      alert(message);
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleCopyCode = async (classId, classCode) => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopiedCodeId(classId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      alert("Không thể copy mã lớp. Vui lòng thử lại.");
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Quản lý lớp học
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Danh sách lớp và hoạt động
              </h1>
      
            </div>
            <Link
              to="/teacher/classes/create"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              <FiPlus />
              Tạo lớp mới
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
              <p className="text-sm font-medium text-violet-500">Tổng số lớp</p>
              <p className="mt-2 text-3xl font-bold text-violet-900">
                {classes.length}
              </p>
              <p className="text-xs text-violet-500">
                Các lớp do bạn tạo và quản lý
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5">
              <p className="text-sm font-medium text-sky-500">
                Học sinh đã tham gia
              </p>
              <p className="mt-2 text-3xl font-bold text-sky-900">
                {totalStudents}
              </p>
              <p className="text-xs text-sky-500">
                Bao gồm cả lớp đang ẩn hoặc khóa
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
              <p className="text-sm font-medium text-emerald-500">
                Lớp đang hiển thị
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">
                {filteredClasses.length}
              </p>
              <p className="text-xs text-emerald-500">
                Kết quả sau khi áp dụng bộ lọc hiện tại
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-indigo-600">
                {classes.length}
              </span>
              Lớp học
            </div> */}

            <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2">
              <FiSearch className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nhập từ khóa tìm kiếm lớp học..."
                className="w-full border-none bg-transparent text-sm text-slate-600 outline-none focus:ring-0"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FiFilter />
              Bộ lọc
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FiLoader className="mb-3 animate-spin text-2xl" />
              Đang tải danh sách lớp...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              {error}
              <button
                type="button"
                onClick={loadClasses}
                className="ml-4 text-indigo-600 underline"
              >
                Thử lại
              </button>
            </div>
          ) : paginatedClasses.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
              <p className="text-lg	font-semibold text-slate-800">
                Chưa có lớp học nào
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Hãy bắt đầu bằng cách tạo lớp mới để mời học sinh tham gia.
              </p>
              <Link
                to="/teacher/classes/create"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                <FiPlus />
                Tạo lớp mới
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedClasses.map((classItem, index) => (
                  <article
                    key={classItem.id}
                    className="flex flex-col rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      className={`relative h-32 w-full rounded-3xl bg-gradient-to-r ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} px-5 py-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-indigo-700">
                            <FiBookOpen />
                            {classItem.classCode}
                          </span>
                          <p className="text-base font-semibold text-slate-800">
                            {classItem.className}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-600">
                          {classItem.studentCount} học sinh
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-5 text-sm text-slate-600">
                      <p className="flex items-center gap-2 text-slate-500">
                        <FiBarChart2 className="text-indigo-400" />
                        {classItem.createdAt
                          ? new Intl.DateTimeFormat("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }).format(new Date(classItem.createdAt))
                          : "Chưa cập nhật ngày tạo"}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                          <FiUsers />
                          {classItem.studentCount} học sinh
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                          <FiBookOpen />
                          0 đề thi
                        </span>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCode(classItem.id, classItem.classCode)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          >
                            {copiedCodeId === classItem.id ? (
                              <span className="text-xs font-semibold text-indigo-600">
                                OK
                              </span>
                            ) : (
                              <FiCopy />
                            )}
                          </button>
                          <Link
                            to={`/teacher/classes/${encodeURIComponent(
                              classItem.classCode || classItem.id
                            )}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          >
                            <FiShare2 />
                          </Link>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          >
                            <FiMoreHorizontal />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/teacher/classes/${encodeURIComponent(
                              classItem.classCode || classItem.id
                            )}`}
                            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-indigo-500"
                          >
                            Vào quản lý
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(classItem.id, classItem.className)
                            }
                            disabled={deletingClassId === classItem.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingClassId === classItem.id ? (
                              <FiLoader className="animate-spin" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filteredClasses.length > PAGE_SIZE && (
                <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
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
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={safePage === totalPages}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-white disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}


