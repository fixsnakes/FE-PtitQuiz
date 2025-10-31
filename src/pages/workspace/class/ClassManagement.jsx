import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthProvider';
import { 
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaEye,
  FaCopy,
  FaCheck
} from 'react-icons/fa';
import { 
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiX
} from 'react-icons/fi';
import { 
  BiChevronDown 
} from 'react-icons/bi';
import { 
  PiStudentBold 
} from 'react-icons/pi';

function ClassManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedClassId, setCopiedClassId] = useState(null);
  
  // Form state for creating new class
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    description: '',
    room: '',
    section: ''
  });

  // Function to get teacher name
  const getTeacherName = () => {
    return user?.name || user?.username || 'Giáo viên hiện tại';
  };
  
  // Mock data for classes
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: 'KTTK02',
      subject: 'Thiết kế kiến trúc',
      studentCount: 35,
      teacherName: getTeacherName(),
      status: 'active',
      createdDate: '2024-09-01',
      classCode: 'TOAN12A1',
      description: 'Lớp học Thiết kế kiến trúc',
      room: 'Phòng 301',
      section: 'A1'
    },
    {
      id: 2,
      name: 'C++05',
      subject: 'Lập trình C++',
      studentCount: 32,
      teacherName: getTeacherName(),
      status: 'active',
      createdDate: '2024-09-05',
      classCode: 'DFEGFVC',
      description: 'Lớp học Lập trình C++',
      room: 'Phòng 205',
      section: 'B2'
    },
    {
      id: 3,
      name: 'LTW 01',
      subject: 'Lập trình web',
      studentCount: 28,
      teacherName: getTeacherName(),
      status: 'inactive',
      createdDate: '2024-08-20',
      classCode: 'DCHYHFSD',
      description: 'Lớp học lập trình web cơ bản',
      room: 'Phòng Lab1',
      section: 'C1'
    }
  ]);

  // Generate a random 6-character class code
  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleCreateClass = (e) => {
    e.preventDefault();
    
    const classCode = generateClassCode();
    const newClassData = {
      id: classes.length + 1,
      ...newClass,
      classCode,
      studentCount: 0,
      teacherName: getTeacherName(),
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setClasses(prev => [...prev, newClassData]);
    
    // Reset form
    setNewClass({
      name: '',
      subject: '',
      description: '',
      room: '',
      section: ''
    });
    
    setShowCreateModal(false);
  };

  // Filter classes based on search term and status
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle deleting a class
  const handleDeleteClass = (classId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      setClasses(prev => prev.filter(cls => cls.id !== classId));
    }
  };

  // Copy join URL to clipboard
  const copyJoinUrl = (classCode) => {
    const joinUrl = `${window.location.origin}/join/${classCode}`;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedClassId(classCode);
      setTimeout(() => setCopiedClassId(null), 2000);
    });
  };

  return (
    <div className="flex-1">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
            <p className="text-gray-600 mt-1">Quản lý danh sách lớp học và học sinh</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Tạo lớp mới
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
            <BiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Create Class Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus className="w-4 h-4" />
            Tạo lớp mới
          </button>
        </div>

        {/* Class Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Tổng lớp học</p>
                <p className="text-2xl font-bold text-blue-900">{classes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-900">
                  {classes.filter(cls => cls.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PiStudentBold className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Tổng học sinh</p>
                <p className="text-2xl font-bold text-orange-900">
                  {classes.reduce((total, cls) => total + cls.studentCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaEye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Lượt truy cập</p>
                <p className="text-2xl font-bold text-purple-900">1,234</p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-600">{cls.subject}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cls.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cls.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </span>
                      
                      <div className="relative">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <FiMoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUsers className="w-4 h-4" />
                      <span>{cls.studentCount} học sinh</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Mã lớp: {cls.classCode}</span>
                      <button
                        onClick={() => copyJoinUrl(cls.classCode)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        {copiedClassId === cls.classCode ? (
                          <>
                            <FaCheck className="w-3 h-3" />
                            <span className="text-xs">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <FaCopy className="w-3 h-3" />
                            <span className="text-xs">Sao chép link</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                        <FaEye className="w-3 h-3" />
                        Xem chi tiết
                      </button>
                      <button className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaEdit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClass(cls.id)}
                        className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <PiStudentBold className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy lớp học
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Không có lớp học nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có lớp học nào được tạo.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Tạo lớp học mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên lớp học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newClass.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Lớp Toán 12A1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={newClass.subject}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Toán học"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng học
                </label>
                <input
                  type="text"
                  name="room"
                  value={newClass.room}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Phòng 201"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={newClass.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về lớp học..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassManagement;