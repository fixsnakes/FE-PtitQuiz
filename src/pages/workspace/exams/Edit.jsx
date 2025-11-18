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
  const { id } = useParams(); // Lấy ID đề thi từ URL
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dữ liệu đề thi
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

  // Danh sách câu hỏi mẫu
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

  // Tải dữ liệu đề thi khi component mount
  useEffect(() => {
    const loadExamData = () => {
      try {
        setIsLoading(true);
        // Thử tải từ localStorage trước (cho development)
        const savedExam = localStorage.getItem(`exam_${id}`);
        if (savedExam) {
          const examInfo = JSON.parse(savedExam);
          setExamData(examInfo);
          console.log('Đã tải dữ liệu đề thi từ localStorage:', examInfo);
        } else {
          // Nếu không có dữ liệu đã lưu, set giá trị mặc định
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
          console.log('Không tìm thấy dữ liệu đã lưu, sử dụng giá trị mặc định');
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu đề thi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadExamData();
    }
  }, [id]);

  // Danh sách các trình độ học vấn
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

  // Component SelectField để render select với icon
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

  // Cấu hình tabs - Tất cả được bật trong chế độ chỉnh sửa
  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản' },
    { id: 'questions', label: 'Soạn câu hỏi' },
    { id: 'settings', label: 'Cài đặt nâng cao' },
    { id: 'history', label: 'Lịch sử truy cập' },
    { id: 'stats', label: 'Thống kê' }
  ];

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Xử lý lưu đề thi
  const handleSave = () => {
    try {
      // Lưu vào localStorage (trong ứng dụng thực sẽ là API call)
      localStorage.setItem(`exam_${id}`, JSON.stringify(examData));
      console.log('Đang lưu dữ liệu đề thi:', examData);
      alert('Đã lưu thay đổi thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu đề thi:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu!');
    }
  };

  // Thêm câu hỏi mới
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

  // Cập nhật câu hỏi
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  // Xóa câu hỏi
  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navbar - Cố định ở trên cùng */}
      <Navbar />
      
      {/* Trạng thái loading */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center ml-72">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đề thi...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Nội dung chính */}
      <div className="flex-1 pt-20">
        {/* Tiêu đề trang */}
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

        {/* Navigation tabs */}
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

        {/* Khu vực nội dung */}
        <div className="p-6">
          {/* Tab thông tin cơ bản */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Cột trái - Upload ảnh */}
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
                <div className="bg-white rounded-lg shadow-sm border p-6">
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
                        value={examData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tên đề thi"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Trình độ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trình độ <span className="text-red-500">*</span>
                      </label>
                      <SelectField
                        name="subject"
                        value={examData.subject}
                        onChange={handleInputChange}
                        options={educationLevels.map(level => ({ value: level, label: level }))}
                        placeholder="Chọn trình độ"
                        required
                      />
                    </div>

                    {/* Các trường bổ sung khi đã chọn trình độ */}
                    {examData.subject && (
                      <>                   

                        {/* Chuyên ngành */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
                          <SelectField
                            name="major"
                            value={examData.major}
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
                            value={examData.subject_detail}
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
                            value={examData.skill}
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
                            value={examData.topic}
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

              {/* Cột phải - Cài đặt truy cập */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Cấu hình truy cập</h3>
                  
                  <div className="space-y-6">
                    {/* Thông tin cấp độ truy cập */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          Cấu hình này chỉ áp dụng khi truy cập đề thi.
                        </p>
                      </div>
                    </div>

                    {/* Cài đặt riêng tư */}
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

                    {/* Bảo vệ bằng mật khẩu */}
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

          {/* Tab câu hỏi */}
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
                    {/* Nội dung câu hỏi */}
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

                    {/* Các lựa chọn */}
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

                    {/* Giải thích đáp án */}
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

          {/* Các tab khác placeholder */}
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
