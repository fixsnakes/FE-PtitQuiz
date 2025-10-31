import React, { useState, useEffect } from 'react';
import { 
  FiChevronDown, 
  FiInfo, 
  FiCheckCircle, 
  FiXCircle 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

/**
 * HÀM PARSE ĐÃ CẬP NHẬT:
 * Loại bỏ khái niệm "Phần" (Part).
 * Trả về một mảng câu hỏi (questions) phẳng.
 */
const parseExamText = (text) => {
  const lines = text.split('\n');
  const questions = []; // <-- THAY ĐỔI: Không còn 'parts'
  const errors = [];
  let currentQuestion = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // BỎ logic ' (bắt đầu phần mới)

    if (trimmedLine === '') {
      // Dòng trống, phân tách câu hỏi
      if (currentQuestion) {
        questions.push(currentQuestion); // <-- THAY ĐỔI: Thêm trực tiếp vào 'questions'
        currentQuestion = null;
      }
    } else if (trimmedLine.startsWith('*') || /^[A-Z]\./.test(trimmedLine)) {
      // Đây là một đáp án
      if (!currentQuestion) {
        errors.push({ line: index + 1, content: line, message: "Đáp án không thuộc câu hỏi nào." });
        return;
      }
      if (currentQuestion.type !== 'MCQ') {
         errors.push({ line: index + 1, content: line, message: "Câu hỏi điền từ [FILL] không có đáp án A, B, C..." });
         return;
      }

      const isCorrect = trimmedLine.startsWith('*');
      const optionText = line.replace(/^\*?[A-Z]\.\s*/, '').replace(/<br \/>/g, '\n');
      
      currentQuestion.options.push({
        text: optionText,
        isCorrect: isCorrect,
      });

    } else if (trimmedLine.length > 0) {
      // Đây là một câu hỏi trắc nghiệm mới
      // BỎ check !currentPart
      
      if (currentQuestion) {
        questions.push(currentQuestion); // <-- THAY ĐỔI: Thêm trực tiếp vào 'questions'
      }
      currentQuestion = {
        type: 'MCQ',
        text: line.replace(/<br \/>/g, '\n'),
        options: [],
      };
    }
  });

  // Đẩy câu hỏi cuối cùng vào
  if (currentQuestion) {
    questions.push(currentQuestion); // <-- THAY ĐỔI: Thêm trực tiếp vào 'questions'
  }
  // BỎ logic 'parts'

  return { questions, errors }; // <-- THAY ĐỔI: Trả về 'questions'
};


/**
 * Component hiển thị hướng dẫn ĐÃ CẬP NHẬT
 */
const ExamInstructions = () => (
  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-700 space-y-2">
    <h4 className="font-semibold text-gray-800">Quy tắc soạn câu hỏi</h4>
    <ul className="list-disc list-inside space-y-1">
      <li>Mỗi câu hỏi cách nhau 1 dòng trống.</li>
      <li>Đáp án đúng có dấu [ <strong className="text-blue-600">*</strong> ] đằng trước (ví dụ: <code className="bg-gray-200 px-1 rounded">*B. Đáp án đúng</code>)</li>
      <li>Xuống dòng trong câu hỏi/đáp án, dùng <code className="bg-gray-200 px-1 rounded">&lt;br /&gt;</code></li>
    </ul>
  
  </div>
);


/**
 * Component hiển thị bản xem trước (cột phải) ĐÃ CẬP NHẬT
 */
const ExamPreview = ({ questions, errors, hasContent }) => { // <-- THAY ĐỔI: Nhận 'questions'
  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Vui lòng soạn câu hỏi theo hướng dẫn!
      </div>
    );
  }

  return (
    <div className="space-y-4"> {/* <-- THAY ĐỔI: Đổi từ space-y-6 */}
      {/* Hiển thị lỗi phân tích cú pháp */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm">
          <h4 className="font-semibold text-red-700">Lỗi cú pháp</h4>
          <ul className="list-disc list-inside mt-2">
            {errors.map((err, i) => (
              <li key={i} className="text-red-600">
                <strong>Dòng {err.line}:</strong> {err.message} (Nội dung: <code className="bg-red-200 text-red-800 rounded px-1">{err.content}</code>)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hiển thị các câu hỏi đã phân tích */}
      {/* <-- THAY ĐỔI: Bỏ vòng lặp 'parts.map' --> */}
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-white p-4 border rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800 whitespace-pre-wrap">
            {/* <-- THAY ĐỔI: Chỉ còn qIndex --> */}
            Câu {qIndex + 1}: {q.text}
          </p>
          
          {/* Hiển thị cho câu Trắc nghiệm */}
          {q.type === 'MCQ' && (
            <div className="mt-3 space-y-2">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className={`flex items-center p-2 rounded-md ${opt.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  {opt.isCorrect ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`whitespace-pre-wrap ${opt.isCorrect ? 'font-semibold text-green-800' : 'text-red-800'}`}>
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          )}
          
        
        </div>
      ))}
    </div>
  );
};


/**
 * Component trang chính ĐÃ CẬP NHẬT
 */
export default function CreateExamPage() {
  const [title, setTitle] = useState('');
  const [shareMode, setShareMode] = useState('private');
  const [level, setLevel] = useState('');
  const [rawText, setRawText] = useState('');
  // <-- THAY ĐỔI: State mặc định là 'questions'
  const [parsedExam, setParsedExam] = useState({ questions: [], errors: [] }); 
  const [showInstructions, setShowInstructions] = useState(false);


  useEffect(() => {
    const result = parseExamText(rawText);
    setParsedExam(result);
  }, [rawText]);

  // Hàm xử lý khi nhấn nút "Tạo đề"
  const handleSubmit = () => {
    if (parsedExam.errors.length > 0) {
      alert("Vui lòng sửa các lỗi cú pháp trước khi tạo đề!");
      return;
    }
    
    // Gói dữ liệu thành JSON
    const examData = {
      title,
      shareMode,
      level,
      content: parsedExam.questions, // <-- THAY ĐỔI: Gửi 'questions'
    };
    
    // Gửi dữ liệu này về backend
    console.log("GỬI DỮ LIỆU JSON LÊN BACKEND:", JSON.stringify(examData, null, 2));
    alert("Đã tạo đề thành công! (Kiểm tra dữ liệu JSON trong Console F12)");

  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 mt-15">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold text-gray-800">Tạo đề thi nhanh</h1>
        <div className="flex space-x-3">
          <Link to='/workspace/exams/list' className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium">
            Trở về
          </Link>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium"
          >
            Tạo đề
          </button>
        </div>
      </header>

      {/* Main Content (2 cột) */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CỘT TRÁI: Form nhập liệu */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
          {/* Tên đề thi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đề thi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên đề thi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Hiển thị lỗi validation (ví dụ) */}
            {title === '' && <p className="text-xs text-red-500 mt-1">Trường này là bắt buộc.</p>}
          </div>

          {/* Chế độ chia sẻ */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chế độ chia sẻ <span className="text-red-500">*</span>
            </label>
            <select
              value={shareMode}
              onChange={(e) => setShareMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Riêng tư</option>
              <option value="public">Công khai</option>
              <option value="unlisted">Không công khai</option>
            </select>
            <FiChevronDown className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none" />
            <p className="text-xs text-gray-500 mt-1">
              {shareMode === 'private' && "Chỉ mình bạn và thành viên được chia sẻ có thể truy cập đề thi"}
              {shareMode === 'public' && "Mọi người đều có thể tìm thấy và truy cập đề thi"}
              {shareMode === 'unlisted' && "Chỉ những người có link mới truy cập được"}
            </p>
          </div>

          {/* Trình độ */}
         

          {/* Hướng dẫn */}
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

          {/* Soạn câu hỏi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soạn câu hỏi
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Vui lòng soạn câu hỏi theo đúng cấu trúc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={20}
            />
          </div>
        </div>

        {/* CỘT PHẢI: Xem trước */}
        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8" style={{ alignSelf: 'start' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Xem trước</h2>
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <ExamPreview 
              questions={parsedExam.questions} // <-- THAY ĐỔI: Truyền 'questions'
              errors={parsedExam.errors} 
              hasContent={rawText.trim().length > 0} 
            />
          </div>
        </div>
      </main>
    </div>
  );
} 