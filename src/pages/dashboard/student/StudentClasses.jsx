import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, X, ChevronLeft, ChevronRight, Loader2, BookOpen, Users, Eye } from 'lucide-react';

import DashboardLayout from '../../../layouts/DashboardLayout';
import { getClasses, joinClass } from '../../../services/classServiceTemp';
import { toast } from 'react-toastify';

const CARD_COLORS = [
  "bg-indigo-50",
  "bg-purple-50",
  "bg-blue-50",
];

const ClassCard = ({ classInfo, index = 0 }) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/dashboard/student/classes/${classInfo.id}`);
  };

  return (
    <article className="flex flex-col rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`relative h-32 w-full rounded-3xl ${CARD_COLORS[index % CARD_COLORS.length]} px-5 py-4`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-indigo-700">
              <BookOpen className="h-4 w-4" />
              {classInfo.code}
            </span>
            <p className="text-base font-semibold text-slate-800 line-clamp-2">
              {classInfo.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 text-sm text-slate-600">
        <p className="flex items-center gap-2 text-slate-500">
          <span className="text-indigo-400">GV:</span>
          {classInfo.teacherName}
        </p>

        <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <Users className="h-3 w-3" />
            Lớp học
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <div className="text-xs text-slate-500">
            Ngày tạo: <span className="font-semibold text-slate-700">{classInfo.date}</span>
          </div>
          <button
            onClick={handleViewDetail}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-indigo-700"
          >
            <Eye className="h-3.5 w-3.5" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
};

// --- Component Modal (Giữ nguyên) ---
const JoinClassModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [classCode, setClassCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setClassCode(''),
        setIsLoading(false)
    }
  }, [isOpen])



  const handleJoinClass = async () => {
    setIsLoading(true)

    if (!classCode || classCode.trim() === '') {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }


    const response = await joinClass(classCode.trim());
    console.log(response)
    if (!response.status) {
      toast.error(response.message)
      setIsLoading(false)
      onClose();
      return;
    }

    toast.success("Tham gia lớp học thành công", {
      autoClose: 2000,
      onClose: () => {
        setIsLoading(false)
        onClose();                 // đóng modal
        window.location.reload();  // reload trang
      }
    })

    return;

  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Tham gia lớp học mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">
              Nhập mã lớp
            </label>
            <div className="relative">
              <input
                type="text"
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Ví dụ: INT3306"
                className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Hãy hỏi giáo viên của bạn để biết mã lớp học.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button onClick={handleJoinClass}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-all shadow-md hover:shadow-lg flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 animate-spin'>Process</Loader2>
              </>
            ) : (
              <>
                <Plus className="mr-2" /> Tham gia ngay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component Chính ---
function StudentClasses() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [listClasses, setListClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const classesPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const offset = (currentPage - 1) * classesPerPage;


        const response = await getClasses(classesPerPage, offset);

        if (response.status) {

          const mappedData = response.data.map(item => ({
            id: item.id,
            name: item.className,
            code: item.classCode,
            teacherName: item.teacher?.fullName || "N/A",
            date: new Date(item.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            }),
            image: null
          }));



          setListClasses(mappedData);

          const totalRecords = response.total || 0;
          setTotalPages(Math.ceil(totalRecords / classesPerPage));
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentPage]);

  // Chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <DashboardLayout role='student'>
      <div className="space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Danh sách lớp học của tôi
              </h1>
            </div>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Tham gia lớp học
            </button>
          </div>

        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2">
              <Search className="text-slate-400" size={20} />
              <input
                type="text"
                className="w-full border-none bg-transparent text-sm text-slate-600 outline-none focus:ring-0"
                placeholder="Nhập từ khóa tìm kiếm lớp học..."
              />
            </div>

            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              <Filter size={20} />
              Bộ lọc
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              Đang tải danh sách lớp...
            </div>
          ) : listClasses.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
              <p className="text-lg font-semibold text-slate-800">
                Chưa có lớp học nào
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Hãy bắt đầu bằng cách tham gia lớp học mới.
              </p>
              <button
                onClick={openModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                <Plus />
                Tham gia lớp học
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {listClasses.map((classItem, index) => (
                  <ClassCard key={classItem.id} classInfo={classItem} index={index} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-slate-500">
                    Trang {currentPage}/{totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 transition hover:bg-white disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
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

        {/* --- Modal --- */}
        <JoinClassModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </DashboardLayout>
  );
}

export default StudentClasses;