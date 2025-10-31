import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  FaGraduationCap,
  FaPlus,
  FaTrash
} from 'react-icons/fa';
import { 
  FiUpload, 
  FiImage, 
  FiInfo, 
  FiUsers, 
  FiMail,
  FiEdit3,
  FiSave
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

function EditExamPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get exam ID from URL
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState({
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

  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Tính đạo hàm của hàm số f(x) = x² + 3x + 1',
      options: ['2x + 3', 'x² + 3', '2x + 1', 'x + 3'],
      correctAnswer: 0,
      explanation: 'Đạo hàm của x² là 2x, đạo hàm của 3x là 3, đạo hàm của hằng số là 0'
    }
  ]);
  // Load exam data when component mounts
  useEffect(() => {
    const loadExamData = () => {
      try {
        setIsLoading(true);
        // Try to load from localStorage first (for development)
        const savedExam = localStorage.getItem(`exam_${id}`);
        if (savedExam) {
          const examInfo = JSON.parse(savedExam);
          setExamData(examInfo);
          console.log('Loaded exam data from localStorage:', examInfo);
        } else {
          // If no saved data, set some defaults
          setExamData(prev => ({
            ...prev,
            title: `Đề thi #${id}`,
            subject: 'Đại học',
            school: 'ptit',
            major: 'cntt',
            subject_detail: 'toan',
            skill: 'logic',
            topic: 'basic'
          }));
          console.log('No saved data found, using defaults');
        }
      } catch (error) {
        console.error('Error loading exam data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadExamData();
    }
  }, [id]);

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

  // Tabs configuration - All enabled in edit mode
  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'questions', label: 'Soạn câu hỏi' },
    { id: 'settings', label: 'Cài đặt nâng cao' },
    { id: 'history', label: 'Lịch sử truy cập' },
    { id: 'stats', label: 'Thống kê' }
  ];

  const sidebarMenu = [
    { path: '/workspace/exams/list', label: 'Quản lý đề thi', icon: BiTask, active: false },
    { path: '/workspace/class', label: 'Quản Lý Lớp', icon: PiStudentBold, active: false },
    { path: '/settings', label: 'Cài đặt', icon: CiSettings, active: false }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    try {
      // Save to localStorage (in real app, this would be API call)
      localStorage.setItem(`exam_${id}`, JSON.stringify(examData));
      console.log('Saving exam data:', examData);
      alert('Đã lưu thay đổi thành công!');
    } catch (error) {
      console.error('Error saving exam data:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu!');
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar />
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center ml-72">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đề thi...</p>
          </div>
        </div>
      ) : (
        <>
      
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
          <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa đề thi</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/workspace/exams/list')}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
            >
              Quay lại
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <FiSave />
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 cursor-pointer'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Basic Information Tab */}
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
                        value={examData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tên đề thi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trình độ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="subject"
                          value={examData.subject}
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

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        value={examData.description}
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
                          Cấu hình này chỉ áp dụng khi truy cập đề thi.
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
                            checked={examData.accessLevel === 'private'}
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
                          checked={examData.isPasswordProtected}
                          onChange={handleInputChange}
                          className="text-blue-600"
                        />
                        <span className="font-medium text-gray-700">Sử dụng mật khẩu</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Soạn câu hỏi</h3>
                <button
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  Thêm câu hỏi
                </button>
              </div>

              {questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-semibold text-gray-800">Câu hỏi {index + 1}</h4>
                    <button
                      onClick={() => deleteQuestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung câu hỏi
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        placeholder="Nhập nội dung câu hỏi"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Các lựa chọn
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                              className="text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(index, 'options', newOptions);
                              }}
                              placeholder={`Lựa chọn ${String.fromCharCode(65 + optionIndex)}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giải thích đáp án
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                        placeholder="Giải thích tại sao đáp án này đúng"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other tabs placeholder */}
          {!['basic', 'questions'].includes(activeTab) && (
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
      </>
      )}
    </div>
  );
}

export default EditExamPage;
