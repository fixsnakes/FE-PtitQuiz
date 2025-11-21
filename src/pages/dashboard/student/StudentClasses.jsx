import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, X, ChevronLeft, ChevronRight,Loader2 } from 'lucide-react';

import DashboardLayout from '../../../layouts/DashboardLayout';
import { getClasses,joinClass } from '../../../services/classServiceTemp';
import { toast } from 'react-toastify';

const ClassCard = ({ classInfo }) => {

  const getRandomImage = (id) => {
    const images = [
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    ];
    return images[id % images.length];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden border border-gray-100 flex flex-col h-full transition-transform duration-200 ease-in-out hover:scale-105 hover:cursor-pointer ">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={classInfo.image || getRandomImage(classInfo.id)} 
          alt={classInfo.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
      </div>
      
      <div className="p-5 flex flex-col grow justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 line-clamp-2">
            {classInfo.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
             GV: {classInfo.teacherName}
          </p>
          <p className="text-sm text-blue-600 font-medium mb-4">
            Mã lớp: {classInfo.code}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
           <span>Ngày tạo:</span>
           <span className="font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
             {classInfo.date}
           </span>
        </div>
      </div>
    </div>
  );
};

// --- Component Modal (Giữ nguyên) ---
const JoinClassModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [classCode,setClassCode] = useState('')
    const [isLoading,setIsLoading] = useState(false)

    useEffect(() => {
      if(isOpen){
        setClassCode(''),
        setIsLoading(false)
      }
    },[isOpen])

  

    const handleJoinClass = async () => {
        setIsLoading(true)

        if(!classCode || classCode.trim() === ''){
          toast.error("Vui lòng điền đầy đủ thông tin")
          return
        }

 
        const response = await joinClass(classCode.trim());
        console.log(response)
        if(!response.status){
          toast.error(response.message)
          setIsLoading(false)
          onClose();
          return;
        }
        
        toast.success("Tham gia lớp học thành công",{
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
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 animate-spin'>Process</Loader2>
                </>
              ): (
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
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto flex flex-col h-full">
                
                <h2 className='font-bold text-3xl mb-6 text-gray-800'>Danh sách lớp học</h2>
                
                {/* --- Header --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  {/* Filter & Search */}
                  <div className="flex items-center gap-3 grow max-w-2xl">
                      <div className="relative grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl leading-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                            placeholder="Tìm kiếm lớp học của bạn..."
                          />
                      </div>
                      <button className="p-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm flex-shrink-0">
                        <Filter size={20} />
                      </button>
                  </div>

                  {/* Join class Button */}
                  <div className="shrink-0">
                      <button 
                        onClick={openModal}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                      <Plus className="mr-2 h-5 w-5" />
                      Tham gia lớp học
                      </button>
                  </div>
                </header>

                {/* --- List Class (Grid) --- */}
                <main className="grow">
                  {isLoading ? (
                      // Loading State
                      <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                  ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                            {/* Render trực tiếp listClasses vì API đã phân trang rồi */}
                            {listClasses.map((classItem) => (
                              <ClassCard key={classItem.id} classInfo={classItem} />
                            ))}
                        </div>
                        
                        {listClasses.length === 0 && (
                          <div className="text-center py-20 text-gray-500">
                            Chưa có lớp học nào. Hãy tham gia lớp học mới!
                          </div>
                        )}
                      </>
                  )}
                </main>

                {/* --- Pagination Controls --- */}
                {!isLoading && totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center space-x-2">
                    {/* Nút Previous */}
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      } transition-all`}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Render số trang */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                          currentPage === number
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    {/* Nút Next */}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg border ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      } transition-all`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* --- Modal --- */}
                <JoinClassModal isOpen={isModalOpen} onClose={closeModal} />
                
            </div>
        </div>
    </DashboardLayout>
  );
}

export default StudentClasses;