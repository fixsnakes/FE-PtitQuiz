import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap
} from 'react-icons/fa';
import { 
  FiUpload, 
  FiImage, 
  FiInfo, 
  FiUsers, 
  FiMail 
} from 'react-icons/fi';
import { 
  BiTask, 
  BiChevronDown 
} from 'react-icons/bi';
import { 
  PiStudentBold 
} from 'react-icons/pi';
import { 
  CiSettings 
} from 'react-icons/ci';
import Navbar from '../../../components/Navbar';

function NewExamPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    isPasswordProtected: false,
    accessLevel: 'private',
    emails: '',
    // New fields that appear when subject is selected
    school: '',
    major: '',
    subject_detail: '',
    skill: '',
    topic: ''
  });

  // Education levels options
  const educationLevels = [
    'Đại học',
    'Cao học', 
    'Cao đẳng',
    'Trung học phổ thông',
    'Trung học cơ sở',
    'Tiểu học',
    'Trung tâm đào tạo',
    'Doanh nghiệp'
  ];

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản', active: true },
    { id: 'questions', label: 'Soạn câu hỏi', active: false },
    { id: 'settings', label: 'Cài đặt nâng cao', active: false },
    { id: 'history', label: 'Lịch sử truy cập', active: false },
    { id: 'stats', label: 'Thống kê', active: false }
  ];

  const sidebarMenu = [
    { path: '/workspace/exams/list', label: 'Quản lý đề thi', icon: BiTask, active: false },
    { path: '/workspace/class', label: 'Quản Lý Lớp', icon: PiStudentBold, active: false },
    { path: '/settings', label: 'Cài đặt', icon: CiSettings, active: false }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Check if basic information is complete - simplified for New page
  const isBasicInfoComplete = () => {
    // Required fields for creating exam
    if (!formData.title?.trim()) return false;
    if (!formData.subject?.trim()) return false;
    if (!formData.accessLevel?.trim()) return false;
    
    // If subject is selected, school is also required
    if (formData.subject && !formData.school?.trim()) return false;
    
    return true;
  };

  const handleTabClick = (tabId) => {
    // In New page, only basic tab is allowed
    if (tabId !== 'basic') {
      alert('Vui lòng tạo đề thi trước khi chuyển sang các phần khác. Các chức năng này sẽ có sẵn trong trang chỉnh sửa.');
      return;
    }
    setActiveTab(tabId);
  };

  const handleSave = () => {
    // Use the same validation logic as tab unlock
    if (!isBasicInfoComplete()) {
      alert('Vui lòng hoàn thành tất cả thông tin cơ bản bắt buộc trước khi lưu');
      return;
    }

    // Save the exam configuration
    console.log('Saving exam configuration:', formData);
    
    // Simulate exam creation and get exam ID
    const examId = Date.now(); // In real app, this would come from API response
    
    // Save to localStorage so Edit page can load it
    try {
      localStorage.setItem(`exam_${examId}`, JSON.stringify(formData));
      console.log('Saved exam data to localStorage with ID:', examId);
    } catch (error) {
      console.error('Error saving exam data:', error);
    }
    
    alert('Đã tạo đề thi thành công!');
    
    // Navigate to edit page with the new exam ID
    navigate(`/workspace/exams/edit/${examId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar />
      
      {/* Sidebar */}
      <div className="w-72 min-h-screen bg-white shadow-md flex-col p-3 justify-center items-center border-r border-gray-100 fixed top-0 z-11 pt-20">
        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-20 mt-1">
          <FaGraduationCap className="text-blue-600 text-5xl" />
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            PTIT Quiz
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {sidebarMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-100`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 pt-20">
        {/* Page Title */}
        <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Tạo đề thi mới</h1>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            Tạo đề thi
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                // In New page, only basic tab is enabled
                const isDisabled = tab.id !== 'basic';
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    disabled={isDisabled}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : isDisabled
                        ? 'border-transparent text-gray-300 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Image Upload */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ảnh đề thi</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Tải lên</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Tải ảnh lên hoặc chọn ảnh để thi
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Chọn ảnh đại diện
                  </button>
                </div>

                {/* Sample Images */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-3">Chọn ảnh có sẵn:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded border hover:border-blue-500 cursor-pointer">
                        <FiImage className="w-full h-full text-gray-400 p-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Basic Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đề thi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đề thi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {!formData.title && (
                      <p className="text-red-500 text-sm mt-1">Trường này là bắt buộc.</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trình độ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">Chọn trình độ</option>
                        {educationLevels.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Additional fields that appear when subject is selected */}
                  {formData.subject && (
                    <>
                      {/* School */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trường học <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="">Chọn trường học</option>
                            <option value="ptit">Học viện Công nghệ Bưu chính Viễn thông</option>
                            <option value="hust">Đại học Bách khoa Hà Nội</option>
                            <option value="other">Khác</option>
                          </select>
                          <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        {!formData.school && (
                          <p className="text-red-500 text-sm mt-1">Trường này là bắt buộc.</p>
                        )}
                      </div>

                      {/* Major */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chuyên ngành
                        </label>
                        <div className="relative">
                          <select
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="">Chọn Chuyên ngành</option>
                            <option value="cntt">Công nghệ thông tin</option>
                            <option value="dtvt">Điện tử viễn thông</option>
                            <option value="other">Khác</option>
                          </select>
                          <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {/* Subject Detail */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Môn học
                        </label>
                        <div className="relative">
                          <select
                            name="subject_detail"
                            value={formData.subject_detail}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="">Chọn Môn học</option>
                            <option value="toan">Toán học</option>
                            <option value="ly">Vật lý</option>
                            <option value="hoa">Hóa học</option>
                            <option value="other">Khác</option>
                          </select>
                          <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {/* Skill */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kỹ năng
                        </label>
                        <div className="relative">
                          <select
                            name="skill"
                            value={formData.skill}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="">Chọn Kỹ năng</option>
                            <option value="logic">Tư duy logic</option>
                            <option value="memory">Ghi nhớ</option>
                            <option value="analysis">Phân tích</option>
                            <option value="other">Khác</option>
                          </select>
                          <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {/* Topic */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chủ đề
                        </label>
                        <div className="relative">
                          <select
                            name="topic"
                            value={formData.topic}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="">Chọn Chủ đề</option>
                            <option value="basic">Cơ bản</option>
                            <option value="advanced">Nâng cao</option>
                            <option value="practice">Thực hành</option>
                            <option value="other">Khác</option>
                          </select>
                          <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả bổ sung"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Access Settings */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cấu hình truy cập</h3>
                
                <div className="space-y-6">
                  {/* Access Level Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        Câu hình này chỉ áp dụng khi truy cập đề thi.
                      </p>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Phạm vi chia sẻ <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="accessLevel"
                          value="private"
                          checked={formData.accessLevel === 'private'}
                          onChange={handleInputChange}
                          className="mt-1 text-blue-600"
                        />
                        <div>
                          <span className="font-medium text-gray-700">Riêng tư</span>
                          <p className="text-sm text-gray-500">
                            Chỉ mình bạn và thành viên được chia sẻ có thể truy cập đề thi
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPasswordProtected"
                        checked={formData.isPasswordProtected}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <span className="font-medium text-gray-700">Sử dụng mật khẩu</span>
                    </label>
                  </div>

                  {/* Share with Students */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chia sẻ cho học tập
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option>Chọn lớp học tập</option>
                      </select>
                      <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Những thành viên trong lớp học có thể truy cập đề thi
                    </p>
                  </div>

                  {/* Email Sharing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chia sẻ qua mail
                    </label>
                    <input
                      type="text"
                      name="emails"
                      value={formData.emails}
                      onChange={handleInputChange}
                      placeholder="Nhập email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Những thành viên được chia sẻ qua email có thể truy cập đề thi
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
          
          {/* Other tabs content - placeholder for future implementation */}
          {activeTab !== 'basic' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-gray-500">
                  Nội dung của tab này sẽ được phát triển trong tương lai.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewExamPage;
