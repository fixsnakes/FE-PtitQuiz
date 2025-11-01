import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiBookOpen, FiChevronsRight 
} from 'react-icons/fi';

// -----------------------------------------------------------------
// 1. CẤU TRÚC DỮ LIỆU ĐÃ THAY ĐỔI
// Bỏ "parts", thay bằng mảng "questions" duy nhất
// Thêm type: 'PASSAGE' để chứa đoạn văn
// -----------------------------------------------------------------
const MOCK_EXAM_DATABASE = {
  "1": {
    title: "acbdfđá",
    duration: 1747, // 29:07 (tính bằng giây)
    questions: [ // <-- THAY ĐỔI: Không còn 'parts'

      { // Câu 1
        type: 'MCQ',
        text: 'What does the passage mainly discuss?',
        options: [
          { text: 'Reading as an exercise for the brain', isCorrect: false },
          { text: 'Different kinds of reading', isCorrect: true },
          { text: 'Reading as a pleasurable activity', isCorrect: false },
          { text: 'Different types of books', isCorrect: false },
        ]
      },
      { // Câu 2
        type: 'MCQ',
        text: 'According to paragraph 1, which of the following is NOT true?',
        options: [
          { text: 'Ordinary men find philosophy difficult.', isCorrect: false },
          { text: 'Scientists read for pleasure.', isCorrect: false },
          { text: 'Reading is a mental recreation.', isCorrect: false },
          { text: 'Mathematicians read books for pleasure.', isCorrect: true },
        ]
      },
      { type: 'MCQ', text: 'Question 1.3...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
      { type: 'MCQ', text: 'Question 1.4...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
      { type: 'MCQ', text: 'Question 1.5...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
    
      { type: 'MCQ', text: 'Question 2.1...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
      { type: 'MCQ', text: 'Question 2.2...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
      { type: 'MCQ', text: 'Question 2.3...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
    ]
  }
};
// -----------------------------------------------------------------

/**
 * Hàm trợ giúp: Đếm tổng số câu hỏi (ĐÃ CẬP NHẬT)
 */
const getTotalQuestions = (questions) => {
  // Đếm tất cả các item có type LÀ 'MCQ' (hoặc 'FILL', v.v...)
  return questions.filter(q => q.type === 'MCQ').length;
};

/**
 * Hàm trợ giúp: Định dạng giây (Giữ nguyên)
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

/**
 * Component: Cột điều khiển bên trái (ĐÃ CẬP NHẬT)
 * - Xóa hoàn toàn danh sách phần thi
 */
const LeftSidebar = ({ quiz, timeLeft, progress, onBack, onSubmit }) => {
  return (
    <div className="w-64 bg-white p-4 shadow-lg flex flex-col h-screen fixed top-0 left-0">
      <h1 className="text-xl font-bold truncate mb-1">{quiz.title}</h1>
      <p className="text-sm text-gray-500 mb-4">Chủ đề: Thi thử</p>

      <div className="flex items-center text-lg font-semibold text-blue-600 mb-4">
        <span>Thời gian còn lại</span>
        <span className="ml-auto text-2xl font-mono">{formatTime(timeLeft)}</span>
      </div>

      <div className="flex space-x-2 mb-6">
        <button 
          onClick={onSubmit}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Nộp bài thi
        </button>
      </div>
      
      <hr className="my-2" />
      
      {/* Khối "Danh sách phần thi" đã bị xóa */}

      <div className="mt-auto">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
          <span>Tiến độ hoàn thành</span>
          <span>{progress.answered}/{progress.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{ width: `${(progress.answered / progress.total) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component: Nội dung bài thi ở giữa (ĐÃ CẬP NHẬT)
 * - Lặp qua 1 mảng 'questions' duy nhất
 * - Hiển thị 'PASSAGE' hoặc 'MCQ'
 */
const MainContent = ({ questions, answers, onSelectAnswer }) => {
  let questionCounter = 0; // Bộ đếm số thứ tự câu hỏi

  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-y-auto h-screen" style={{ marginLeft: '256px', marginRight: '240px' }}>
      
      {/* Lặp qua mảng questions duy nhất */}
      {questions.map((item, index) => {
        
        // ---- HIỂN THỊ ĐOẠN VĂN ----
        if (item.type === 'PASSAGE') {
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>
          );
        }

        // ---- HIỂN THỊ CÂU HỎI ----
        if (item.type === 'MCQ') {
          questionCounter++; // Tăng số thứ tự câu hỏi
          const questionId = `q_${index}`; // Dùng index làm ID duy nhất
          const selectedOption = answers[questionId]; 

          return (
            <div key={questionId} id={`question-${index}`} className="bg-white p-6 rounded-lg shadow-sm mb-4">
              <p className="font-semibold text-gray-800 mb-4">
                Câu {questionCounter}: {item.text}
              </p>
              
              <div className="space-y-3">
                {item.options.map((opt, oIndex) => (
                  <div
                    key={oIndex}
                    // THAY ĐỔI: Gửi questionId và oIndex
                    onClick={() => onSelectAnswer(questionId, oIndex)} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all
                      ${selectedOption === oIndex 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3
                      ${selectedOption === oIndex ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}
                    >
                      {selectedOption === oIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700">{String.fromCharCode(65 + oIndex)}.</span>
                    <span className="ml-2 text-gray-800">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        return null; // Cho các type không xác định
      })}
    </div>
  );
};

/**
 * Component: Mục lục câu hỏi bên phải (ĐÃ CẬP NHẬT)
 * - Lặp qua 1 mảng 'questions'
 * - Chỉ hiển thị các item là 'MCQ'
 */
const RightSidebar = ({ questions, answers }) => {
  let questionCounter = 0; // Bộ đếm số thứ tự

  return (
    <div className="w-60 bg-white p-4 shadow-lg h-screen fixed top-0 right-0 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Mục lục câu hỏi</h3>
      
      <div className="grid grid-cols-5 gap-2">
        {questions.map((item, index) => {
          // Bỏ qua nếu là đoạn văn
          if (item.type !== 'MCQ') return null; 
          
          questionCounter++;
          const questionId = `q_${index}`;
          const isAnswered = answers[questionId] !== undefined;

          return (
            <a 
              key={questionId}
              href={`#question-${index}`} // Link tới anchor
              className={`w-10 h-10 flex items-center justify-center rounded border
                font-medium text-sm transition-all
                ${isAnswered 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
            >
              {questionCounter} {/* Hiển thị 1, 2, 3... */}
            </a>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Component: Màn hình hiển thị kết quả (Giữ nguyên)
 */
const ResultsDisplay = ({ results, onBack }) => {
  const { score, correctCount, totalQuestions } = results;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Hoàn thành bài thi!</h1>
        <p className="text-lg text-gray-600 mb-6">Bạn đã hoàn thành bài thi. Dưới đây là kết quả của bạn.</p>
        <div className="mb-8">
          <p className="text-sm text-gray-500">Điểm số</p>
          <p className="text-6xl font-bold text-blue-600">{score.toFixed(2)}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-semibold text-gray-700">
            Số câu đúng: 
            <span className="text-green-600 ml-2">{correctCount} / {totalQuestions}</span>
          </p>
        </div>
        <button 
          onClick={onBack}
          className="mt-8 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium"
        >
          Trở về Trang chủ
        </button>
      </div>
    </div>
  );
};


/**
 * Component Trang chính (ĐÃ CẬP NHẬT)
 */
export default function QuizTakingPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({}); // { 'q_1': 0, 'q_2': 2 }
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState({ score: 0, correctCount: 0, totalQuestions: 0 });
  
  // Memoize giá trị tính toán (ĐÃ CẬP NHẬT)
  const totalQuestions = useMemo(() => quiz ? getTotalQuestions(quiz.questions) : 0, [quiz]);
  const progress = useMemo(() => ({
    answered: Object.keys(answers).length,
    total: totalQuestions
  }), [answers, totalQuestions]);

  // 1. Lấy dữ liệu (Giữ nguyên)
  useEffect(() => {
    const fetchedQuiz = MOCK_EXAM_DATABASE[id];
    if (fetchedQuiz) {
      setQuiz(fetchedQuiz);
      setTimeLeft(fetchedQuiz.duration); 
    } else {
      alert("Không tìm thấy bài thi!");
      navigate('/');
    }
  }, [id, navigate]);

  // 2. Xử lý đếm ngược (Giữ nguyên)
  useEffect(() => {
    if (isFinished || !quiz) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, quiz]);

  // 3. Hàm tính toán kết quả (ĐÃ CẬP NHẬT)
  const calculateResults = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((q, index) => {
      if (q.type === 'MCQ') {
        const questionId = `q_${index}`;
        const userAnswerIndex = answers[questionId];
        
        if (userAnswerIndex !== undefined) {
          const correctAnswer = q.options[userAnswerIndex].isCorrect;
          if (correctAnswer) {
            correctCount++;
          }
        }
      }
    });

    const score = (correctCount / totalQuestions) * 10;
    setResults({ score, correctCount, totalQuestions });
  };

  // 4. Hàm xử lý nộp bài (Giữ nguyên)
  const handleSubmit = () => {
    if (isFinished) return; 

    if (timeLeft > 0) {
      const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?");
      if (!confirmSubmit) {
        return; 
      }
    }
    setIsFinished(true);
    calculateResults();
    console.log("BÀI THI ĐÃ NỘP");
    console.log("Đáp án của người dùng:", answers);
  };

  // 5. Hàm chọn đáp án (ĐÃ CẬP NHẬT)
  const handleSelectAnswer = (questionId, optionIndex) => {
    if (isFinished) return; 
    
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: optionIndex
    }));
  };

  // 6. Hàm quay về (Giữ nguyên)
  const handleGoBack = () => {
    navigate('/auth/login'); 
  };
  
  // --- Render ---
  
  if (!quiz) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải bài thi...</div>;
  }
  
  if (isFinished) {
    return <ResultsDisplay results={results} onBack={handleGoBack} />;
  }

  // Hiển thị trang làm bài
  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      <LeftSidebar 
        quiz={quiz}
        timeLeft={timeLeft}
        progress={progress}
        onBack={handleGoBack}
        onSubmit={handleSubmit}
      />
      
      <MainContent 
        questions={quiz.questions} // <-- THAY ĐỔI
        answers={answers}
        onSelectAnswer={handleSelectAnswer}
      />
      
      <RightSidebar 
        questions={quiz.questions} // <-- THAY ĐỔI
        answers={answers}
      />
    </div>
  );
}