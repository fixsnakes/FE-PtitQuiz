import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';
import { FiUpload, FiImage, FiInfo } from 'react-icons/fi';
import { BiTask, BiChevronDown } from 'react-icons/bi';
import { PiStudentBold } from 'react-icons/pi';
import { CiSettings } from 'react-icons/ci';
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
    school: '',
    major: '',
    subject_detail: '',
    skill: '',
    topic: ''
  });

  // Danh sách trình độ học vấn
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

  // Cấu hình các tab
  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'questions', label: 'Soạn câu hỏi' },
    { id: 'settings', label: 'Cài đặt nâng cao' },
    { id: 'history', label: 'Lịch sử truy cập' },
    { id: 'stats', label: 'Thống kê' }
  ];

  // Menu sidebar
 

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Kiểm tra thông tin cơ bản đã đủ chưa
  const isBasicInfoComplete = () => {
    if (!formData.title?.trim()) return false;
    if (!formData.subject?.trim()) return false;
    if (!formData.accessLevel?.trim()) return false;
    if (formData.subject && !formData.school?.trim()) return false;
    
    return true;
  };

  // Xử lý click tab - chỉ cho phép tab cơ bản
  const handleTabClick = (tabId) => {
    if (tabId !== 'basic') {
      alert('Vui lòng tạo đề thi trước khi chuyển sang các phần khác. Các chức năng này sẽ có sẵn trong trang chỉnh sửa.');
      return;
    }
    setActiveTab(tabId);
  };

  // Xử lý lưu đề thi
  const handleSave = () => {
    if (!isBasicInfoComplete()) {
      alert('Vui lòng hoàn thành tất cả thông tin cơ bản bắt buộc trước khi lưu');
      return;
    }

    // Tạo ID cho đề thi mới
    const examId = Date.now();
    
    // Lưu vào localStorage
    try {
      localStorage.setItem(`exam_${examId}`, JSON.stringify(formData));
      console.log('Đã lưu đề thi với ID:', examId);
    } catch (error) {
      console.error('Lỗi khi lưu đề thi:', error);
      alert('Có lỗi xảy ra khi lưu đề thi');
      return;
    }
    
    // Hỏi người dùng muốn làm gì tiếp theo
    const userChoice = confirm(
      'Đã tạo đề thi thành công!'
    );
    
    if (userChoice) {
      navigate(`/workspace/exams/edit/${examId}`);
    } else {
      navigate('/workspace/exams/list');
    }
  };

  // Component render select option với icon
  const SelectField = ({ name, value, onChange, options, placeholder, required = false, errorMessage }) => (
    <div>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {required && !value && (
        <p className="text-red-500 text-sm mt-1">{errorMessage || 'Trường này là bắt buộc.'}</p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
     
      
   

      {/* Nội dung chính */}
      <div className="flex-1 pt-20 relative z-10">
        {/* Tiêu đề trang */}
        <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Tạo đề thi mới</h1>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Tạo đề thi
          </button>
        </div>

        {/* Điều hướng tab */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
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
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Khu vực nội dung */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
              {/* Cột trái - Tải ảnh */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Ảnh đề thi</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Tải lên</p>
                    <p className="text-sm text-gray-500 mb-4">Tải ảnh lên hoặc chọn ảnh để thi</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Chọn ảnh đại diện
                    </button>
                  </div>

                  {/* Ảnh mẫu */}
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

              {/* Cột giữa - Thông tin cơ bản */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 relative z-10 pointer-events-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3>
                  
                  <div className="space-y-4">
                    {/* Tên đề thi */}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pointer-events-auto"
                      />
                      {!formData.title && (
                        <p className="text-red-500 text-sm mt-1">Trường này là bắt buộc.</p>
                      )}
                    </div>

                    {/* Trình độ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trình độ <span className="text-red-500">*</span>
                      </label>
                      <SelectField
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        options={educationLevels.map(level => ({ value: level, label: level }))}
                        placeholder="Chọn trình độ"
                        required
                      />
                    </div>

                    {/* Các trường bổ sung khi đã chọn trình độ */}
                    {formData.subject && (
                      <>
                        {/* Trường học */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trường học <span className="text-red-500">*</span>
                          </label>
                          <SelectField
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            options={[
                              { value: 'ptit', label: 'Học viện Công nghệ Bưu chính Viễn thông' },
                              { value: 'hust', label: 'Đại học Bách khoa Hà Nội' },
                              { value: 'other', label: 'Khác' }
                            ]}
                            placeholder="Chọn trường học"
                            required
                          />
                        </div>

                        {/* Chuyên ngành */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
                          <SelectField
                            name="major"
                            value={formData.major}
                            onChange={handleInputChange}
                            options={[
                              { value: 'cntt', label: 'Công nghệ thông tin' },
                              { value: 'dtvt', label: 'Điện tử viễn thông' },
                              { value: 'other', label: 'Khác' }
                            ]}
                            placeholder="Chọn chuyên ngành"
                          />
                        </div>

                        {/* Môn học */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                          <SelectField
                            name="subject_detail"
                            value={formData.subject_detail}
                            onChange={handleInputChange}
                            options={[
                              { value: 'toan', label: 'Toán học' },
                              { value: 'ly', label: 'Vật lý' },
                              { value: 'hoa', label: 'Hóa học' },
                              { value: 'other', label: 'Khác' }
                            ]}
                            placeholder="Chọn môn học"
                          />
                        </div>

                        {/* Kỹ năng */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng</label>
                          <SelectField
                            name="skill"
                            value={formData.skill}
                            onChange={handleInputChange}
                            options={[
                              { value: 'logic', label: 'Tư duy logic' },
                              { value: 'memory', label: 'Ghi nhớ' },
                              { value: 'analysis', label: 'Phân tích' },
                              { value: 'other', label: 'Khác' }
                            ]}
                            placeholder="Chọn kỹ năng"
                          />
                        </div>

                        {/* Chủ đề */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                          <SelectField
                            name="topic"
                            value={formData.topic}
                            onChange={handleInputChange}
                            options={[
                              { value: 'basic', label: 'Cơ bản' },
                              { value: 'advanced', label: 'Nâng cao' },
                              { value: 'practice', label: 'Thực hành' },
                              { value: 'other', label: 'Khác' }
                            ]}
                            placeholder="Chọn chủ đề"
                          />
                        </div>
                      </>
                    )}

                    {/* Mô tả */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
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

              {/* Cột phải - Cài đặt truy cập */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Cấu hình truy cập</h3>
                  
                  <div className="space-y-6">
                    {/* Thông tin cài đặt */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          Cấu hình này chỉ áp dụng khi truy cập đề thi.
                        </p>
                      </div>
                    </div>

                    {/* Cài đặt quyền riêng tư */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Phạm vi chia sẻ <span className="text-red-500">*</span>
                      </label>
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

                    {/* Bảo vệ bằng mật khẩu */}
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

                    {/* Chia sẻ với học sinh */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chia sẻ cho học tập
                      </label>
                      <div className="relative">
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                          <option>Chọn lớp học tập</option>
                        </select>
                        <BiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Những thành viên trong lớp học có thể truy cập đề thi
                      </p>
                    </div>

                    {/* Chia sẻ qua email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chia sẻ qua email
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
          
          {/* Nội dung các tab khác - placeholder */}
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
