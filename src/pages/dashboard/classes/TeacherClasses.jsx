import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCopy,
  FiLoader,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import DashboardLayout from "../../../layouts/DashboardLayout";
import {
  deleteClass,
  getTeacherClasses,
} from "../../../services/classService";

const PAGE_SIZE = 6;

function normalizeClasses(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.classes)
    ? payload.classes
    : [];

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
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Quản Lý Lớp Học
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Danh sách lớp của bạn
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý lớp học, theo dõi số lượng học sinh và truy cập nhanh vào
              chi tiết từng lớp.
            </p>
          </div>

          <Link
            to="/teacher/classes/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
          >
            <FiPlus />
            Tạo lớp mới
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <FiSearch className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm lớp theo tên..."
                className="w-full border-none text-sm outline-none focus:ring-0"
              />
            </div>

            <p className="text-sm text-slate-500">
              Tổng số lớp:{" "}
              <span className="font-semibold text-slate-900">
                {filteredClasses.length}
              </span>
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FiLoader className="mb-3 animate-spin text-2xl" />
              Đang tải danh sách lớp...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
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
              <p className="text-lg font-semibold text-slate-800">
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
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paginatedClasses.map((classItem) => (
                  <article
                    key={classItem.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-indigo-50/30 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Tên lớp
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {classItem.className}
                        </h3>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {classItem.studentCount} HS
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Mã lớp
                          </p>
                          <p className="font-semibold text-slate-900">
                            {classItem.classCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCode(classItem.id, classItem.classCode)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                        >
                          <FiCopy />
                          {copiedCodeId === classItem.id ? "Đã copy" : "Copy"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Ngày tạo</span>
                        <span>
                          {classItem.createdAt
                            ? new Intl.DateTimeFormat("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }).format(new Date(classItem.createdAt))
                            : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        to={`/teacher/classes/${encodeURIComponent(
                          classItem.classCode || classItem.id
                        )}`}
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-500"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(classItem.id, classItem.className)
                        }
                        disabled={deletingClassId === classItem.id}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <FiTrash2 />
                        {deletingClassId === classItem.id
                          ? "Đang xóa..."
                          : "Xóa lớp"}
                      </button>
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


