// src/CreateExamPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

/* -----------------------------------------------------------------
   DỮ LIỆU GIẢ LẬP
-------------------------------------------------------------------*/
const MOCK_USER_CLASSES = [
  { id: 'c1', name: 'Lớp 10A1 - Toán' },
  { id: 'c2', name: 'Lớp 11B2 - Lý' },
  { id: 'c3', name: 'Lớp 12C1 - Anh Văn' },
];

/* -----------------------------------------------------------------
   HELPER: Lấy chuỗi 'YYYY-MM-DDTHH:MM' theo giờ local
-------------------------------------------------------------------*/
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

/* -----------------------------------------------------------------
   PARSER đề (giữ nguyên logic)
-------------------------------------------------------------------*/
const parseExamText = (text) => {
  const lines = text.split('\n');
  const questions = [];
  const errors = [];
  let currentQuestion = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      if (currentQuestion) {
        questions.push(currentQuestion);
        currentQuestion = null;
      }
    } else if (trimmedLine.startsWith('*') || /^[A-Z]\./.test(trimmedLine)) {
      if (!currentQuestion) {
        errors.push({ line: index + 1, content: line, message: 'Đáp án không thuộc câu hỏi nào.' });
        return;
      }
      if (currentQuestion.type !== 'MCQ') {
        errors.push({ line: index + 1, content: line, message: 'Câu hỏi điền từ [FILL] không có đáp án A, B, C...' });
        return;
      }
      const isCorrect = trimmedLine.startsWith('*');
      const optionText = line.replace(/^\*?[A-Z]\.\s*/, '').replace(/<br \/>/g, '\n');
      currentQuestion.options.push({
        text: optionText,
        isCorrect: isCorrect,
      });
    } else if (trimmedLine.length > 0) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        type: 'MCQ',
        text: line.replace(/<br \/>/g, '\n'),
        options: [],
      };
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return { questions, errors };
};

/* -----------------------------------------------------------------
   COMPONENT: Hướng dẫn
-------------------------------------------------------------------*/
const ExamInstructions = () => (
  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-700 space-y-2">
    <h4 className="font-semibold text-gray-800">Quy tắc soạn câu hỏi</h4>
    <ul className="list-disc list-inside space-y-1">
      <li>Mỗi câu hỏi cách nhau 1 dòng trống.</li>
      <li>
        Đáp án đúng có dấu [ <strong className="text-blue-600">*</strong> ] đằng trước (ví dụ:{' '}
        <code className="bg-gray-200 px-1 rounded">*B. Đáp án đúng</code>)
      </li>
      <li>
        Xuống dòng trong câu hỏi/đáp án, dùng{' '}
        <code className="bg-gray-200 px-1 rounded">&lt;br /&gt;</code>
      </li>
    </ul>
  </div>
);

/* -----------------------------------------------------------------
   COMPONENT: Xem trước đề
-------------------------------------------------------------------*/
const ExamPreview = ({ questions, errors, hasContent }) => (
  <div className="space-y-4">
    {errors.length > 0 && (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm">
        <h4 className="font-semibold text-red-700">Lỗi cú pháp</h4>
        <ul className="mt-2 space-y-1 text-red-700">
          {errors.map((e, i) => (
            <li key={i}>
              Dòng {e.line}: {e.message}
            </li>
          ))}
        </ul>
      </div>
    )}
    {hasContent ? (
      questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-white p-4 border rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800 whitespace-pre-wrap">
            Câu {qIndex + 1}: {q.text}
          </p>
          {q.type === 'MCQ' && (
            <div className="mt-3 space-y-2">
              {q.options.map((opt, optIndex) => (
                <div
                  key={optIndex}
                  className={`flex items-center p-2 rounded-md ${
                    opt.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {opt.isCorrect ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span
                    className={`whitespace-pre-wrap ${
                      opt.isCorrect ? 'font-semibold text-green-800' : 'text-red-800'
                    }`}
                  >
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        Vui lòng soạn câu hỏi theo hướng dẫn!
      </div>
    )}
  </div>
);

/* -----------------------------------------------------------------
   UI Helpers
-------------------------------------------------------------------*/
const FormSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    {children}
  </div>
);

const ToggleSwitch = ({ label, checked, onChange, description, badge }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className="flex items-center text-sm font-medium text-gray-700">
        {label}
        {badge && (
          <span className="ml-2 text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

const RadioGroup = ({ label, name, options, selectedValue, onChange, description }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <div className="mt-2 space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={selectedValue === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-3 text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
    {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
  </div>
);

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  description,
  type = 'text',
  isRequired = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

/* -----------------------------------------------------------------
   COMPONENT: Multi-select lớp (đẹp + chip)
-------------------------------------------------------------------*/
const ClassMultiSelect = ({ options, selectedValues, onChange }) => {
  const handleSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    onChange(selected);
  };

  const removeOne = (id) => {
    onChange(selectedValues.filter((x) => x !== id));
  };

  return (
    <div className="space-y-3">
      <select
        multiple
        value={selectedValues}
        onChange={handleSelectChange}
        className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2 bg-white text-sm min-h-12"
        size={Math.min(8, Math.max(3, options.length))}
      >
        {options.map((cls) => (
          <option key={cls.id} value={cls.id} className="py-1">
            {cls.name}
          </option>
        ))}
      </select>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((id) => {
            const found = options.find((o) => o.id === id);
            const label = found ? found.name : id;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-full border border-indigo-200"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeOne(id)}
                  className="hover:bg-indigo-100 rounded-full p-0.5"
                  aria-label={`Bỏ ${label}`}
                  title={`Bỏ ${label}`}
                >
                  <FiXCircle className="w-4 h-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <p className="text-xs text-gray-500">Giữ Ctrl/Cmd để chọn nhiều lớp.</p>
    </div>
  );
};

/* -----------------------------------------------------------------
   TAB CẤU HÌNH (đã cập nhật thời gian + select lớp)
-------------------------------------------------------------------*/
const ExamConfiguration = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* --- Cấu hình chung --- */}
      <FormSection title="Cấu hình chung">
        <TextInput
          label="Tên đề thi"
          isRequired
          value={config.title}
          onChange={(val) => handleChange('title', val)}
          placeholder="Nhập tên đề thi"
        />
        <TextInput
          label="Thời gian làm bài (phút)"
          type="number"
          value={config.duration}
          onChange={(val) => handleChange('duration', val)}
          description="Nhập 0 để không giới hạn thời gian."
        />

        {/* Thời gian bắt đầu / kết thúc (ĐÃ SỬA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={config.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                step="60"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>
            <p className="text-xs text-gray-500 mt-1">
              Có thể để trống nếu muốn mở đề ngay khi xuất bản hoặc không giới hạn.
            </p>
          </div>

          {/* Kết thúc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={config.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                min={config.startTime || undefined} // Chỉ ràng buộc khi đã có startTime
                step="60"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Nếu đặt, phải sau thời gian bắt đầu.</p>
          </div>
        </div>
      

        <RadioGroup
          label="Ai được phép làm"
          name="allowedUsers"
          selectedValue={config.allowedUsers}
          onChange={(val) => handleChange('allowedUsers', val)}
          options={[
            { value: 'everyone', label: 'Tất cả mọi người' },
            { value: 'class', label: 'Giao theo lớp' },
          ]}
        />

        {config.allowedUsers === 'class' && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn lớp</label>
            <ClassMultiSelect
              options={MOCK_USER_CLASSES}
              selectedValues={config.selectedClasses}
              onChange={(values) => handleChange('selectedClasses', values)}
            />
          </div>
        )}
      </FormSection>

      {/* --- Điểm & đáp án --- */}
      <FormSection title="Điểm và đáp án khi làm xong">
        <RadioGroup
          label="Cho xem đề thi và đáp án"
          name="showAnswer"
          selectedValue={config.showAnswer}
          onChange={(val) => handleChange('showAnswer', val)}
          options={[
            { value: 'no', label: 'Không' },
            { value: 'yes', label: 'Có' },
          ]}
        />
      </FormSection>

      {/* --- Bảo mật --- */}
      <FormSection title="Bảo mật">
        <TextInput
          label="Số lượt làm"
          type="number"
          value={config.attempts}
          onChange={(val) => handleChange('attempts', val)}
          description="*Nhập 0 hoặc để trống để không giới hạn số lượt làm đề thi"
        />
        <RadioGroup
          label="Giám sát tự động"
          name="monitoring"
          selectedValue={config.monitoring}
          onChange={(val) => handleChange('monitoring', val)}
          options={[
            { value: 'on', label: 'Tắt' },
            { value: 'off', label: 'Giám sát thoát màn hình' },
          ]}
        />
      </FormSection>

      {/* --- Đảo câu hỏi --- */}
      <FormSection title="Đảo câu hỏi và đáp án">
        <ToggleSwitch
          label="Đảo câu hỏi và đáp án"
          checked={config.shuffleQuestions}
          onChange={(val) => handleChange('shuffleQuestions', val)}
          description="Hệ thống sẽ tự động đảo các câu hỏi và thứ tự đáp án trong mỗi câu hỏi..."
        />
      </FormSection>
    </div>
  );
};

/* -----------------------------------------------------------------
   TRANG CHÍNH
-------------------------------------------------------------------*/
export default function CreateExamPage() {
  const [activeTab, setActiveTab] = useState('tao-de-thi');

  const [rawText, setRawText] = useState('');
  const [parsedExam, setParsedExam] = useState({ questions: [], errors: [] });
  const [showInstructions, setShowInstructions] = useState(false);

  const [config, setConfig] = useState({
    title: 'SOA.docx',
    duration: 40,
    startTime: '', // cho phép trống
    endTime: '', // cho phép trống
    allowedUsers: 'everyone',
    selectedClasses: [],
    showScore: 'on_finish',
    showAnswer: 'yes',
    pricing: 'free',
    attempts: 0,
    password: '',
    monitoring: 'on',
    requireStudentInfo: false,
    azotaOnly: false,
    shuffleQuestions: false,
    hideQuestionTitles: false,
    hideRanking: false,
    addHeaderInfo: false,
    showPreExamNotice: false,
  });

  useEffect(() => {
    const result = parseExamText(rawText);
    setParsedExam(result);
  }, [rawText]);

  const handleSubmit = (isPublished) => {
    if (parsedExam.errors.length > 0) {
      alert("Vui lòng sửa các lỗi cú pháp trong tab '1. Tạo đề thi'!");
      setActiveTab('tao-de-thi');
      return;
    }

    if (config.title === '') {
      alert("Vui lòng nhập Tên đề thi trong tab '2. Cấu hình'!");
      setActiveTab('cau-hinh');
      return;
    }

    // Validate thời gian hợp lệ khi cả 2 đều có
    if (config.startTime && config.endTime && config.startTime >= config.endTime) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
      setActiveTab('cau-hinh');
      return;
    }

    const examData = {
      isPublished: isPublished,
      config: config,
      content: parsedExam.questions,
    };

    console.log('GỬI DỮ LIỆU JSON LÊN BACKEND:', JSON.stringify(examData, null, 2));

    if (isPublished) {
      alert('Đã xuất bản đề thi thành công!');
    } else {
      alert('Đã lưu nháp đề thi thành công!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 mt-15">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-800">
          Tên đề thi: {config.title || 'Chưa đặt tên'}
        </h1>
        <div className="flex space-x-3">
          <Link
            to="/workspace/exams/list"
            className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium"
          >
            Trở về
          </Link>
          <button
            onClick={() => handleSubmit(false)}
            className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          >
            Lưu
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"
          >
            Xuất bản
          </button>
        </div>
      </header>


      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('tao-de-thi')}
          className={`px-6 py-3 text-lg font-semibold ${
            activeTab === 'tao-de-thi'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          1. Tạo đề thi
        </button>
        <button
          onClick={() => setActiveTab('cau-hinh')}
          className={`px-6 py-3 text-lg font-semibold ${
            activeTab === 'cau-hinh'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          2. Cấu hình đề thi
        </button>
      </div>

      {/* Nội dung tab 1 */}
      {activeTab === 'tao-de-thi' && (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soạn thảo */}
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
            <div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-pink-100 text-pink-700 text-sm font-medium hover:bg-pink-200"
              >
                <FiInfo className="w-4 h-4" />
                <span>Xem hướng dẫn</span>
              </button>
              {showInstructions && (
                <div className="mt-3">
                  <ExamInstructions />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soạn câu hỏi</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Vui lòng soạn câu hỏi theo đúng cấu trúc..."
                className="w-full h-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={35}
              />
            </div>
          </div>

          {/* Xem trước */}
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8" style={{ alignSelf: 'start' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Xem trước</h2>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
              <ExamPreview
                questions={parsedExam.questions}
                errors={parsedExam.errors}
                hasContent={rawText.trim().length > 0}
              />
            </div>
          </div>
        </main>
      )}

      {/* Nội dung tab 2 */}
      {activeTab === 'cau-hinh' && (
        <main className="max-w-4xl mx-auto">
          <ExamConfiguration config={config} setConfig={setConfig} />
        </main>
      )}
    </div>
  );
}
