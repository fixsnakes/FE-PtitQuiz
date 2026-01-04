import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiSearch, FiTrash2, FiX, FiEye, FiUsers } from "react-icons/fi";
import adminService from "../../../services/adminService";
import formatDateTime from "../../../utils/format_time";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    loadClasses();
  }, [pagination.page]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
      };

      const response = await adminService.getAllClasses(params);
      if (response.success) {
        setClasses(response.data.classes);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadClasses();
  };

  const handleViewDetail = async (classItem) => {
    try {
      const response = await adminService.getClassById(classItem.id);
      if (response.success) {
        setSelectedClass(response.data);
        setClassStudents(response.data.students || []);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading class detail:", error);
      toast.error("Không thể tải thông tin chi tiết");
    }
  };

  const handleDeleteClass = async (classItem) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa lớp "${classItem.className}"?`
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deleteClass(classItem.id);
      if (response.success) {
        toast.success("Xóa lớp học thành công");
        loadClasses();
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error(error.body?.message || "Không thể xóa lớp học");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý lớp học</h1>
        <p className="text-slate-600 mt-1">
          Xem và quản lý tất cả lớp học trong hệ thống
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên lớp..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Không tìm thấy lớp học nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Tên lớp
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Mã lớp
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Giáo viên
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Số học sinh
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                      Ngày tạo
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classItem) => (
                    <tr
                      key={classItem.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600">
                        #{classItem.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">
                          {classItem.className}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                          {classItem.classCode}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">
                          {classItem.teacher?.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {classItem.teacher?.email}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                          <FiUsers className="h-4 w-4" />
                          {classItem.studentCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDateTime(classItem.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(classItem)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} lớp học
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Chi tiết lớp học
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Tên lớp</p>
                  <p className="font-semibold">{selectedClass.className}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Mã lớp</p>
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                    {selectedClass.classCode}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Giáo viên</p>
                  <p className="font-semibold">
                    {selectedClass.teacher?.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ngày tạo</p>
                  <p className="font-semibold">
                    {formatDateTime(selectedClass.created_at)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Danh sách học sinh ({classStudents.length})
                </h3>
                {classStudents.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    Chưa có học sinh nào
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">
                            Họ và tên
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">
                            Email
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">
                            Ngày tham gia
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="border-b border-slate-100"
                          >
                            <td className="py-2 px-3 text-sm">
                              {student.fullName}
                            </td>
                            <td className="py-2 px-3 text-sm text-slate-600">
                              {student.email}
                            </td>
                            <td className="py-2 px-3 text-sm text-slate-600">
                              {formatDateTime(
                                student.Class_student?.joined_at
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

