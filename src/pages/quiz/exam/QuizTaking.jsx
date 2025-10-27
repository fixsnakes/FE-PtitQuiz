import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiVolume2, FiCheckSquare, 
  FiBookOpen, FiChevronsRight 
} from 'react-icons/fi';

// -----------------------------------------------------------------
// GIẢ LẬP DỮ LIỆU JSON (Giống cấu trúc từ bước trước)
// -----------------------------------------------------------------
// Tôi đã thêm trường "passage" (đoạn văn) vào "part" để khớp với hình ảnh
const MOCK_EXAM_DATABASE = {
  "acbdfda": {
    title: "acbdfđá",
    duration: 1747, // 29:07 (tính bằng giây)
    parts: [
      {
        title: "Phần 1",
        passage: "Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the correct answer to each of the questions. \n\n We get great pleasures from reading. The more advanced a man is, the greater delight he will find in reading. The ordinary man may think that subjects like philosophy or science are very difficult and that if philosophers and scientists read these subjects, it is not for pleasure. But this is not true. The mathematician finds the same pleasure in his mathematics as the school boy in an adventure story. For both, it is a play of the imagination, a mental recreation and exercise. \n\n The pleasure derived from this activity is common to all kinds of reading. But different types of books give us different types of pleasure. First in order of popularity is novel-reading. Novels contain pictures of imaginary people in imaginary situations, and give us an opportunity of escaping into a new world very much like our world and yet different from it. Here we seem to live a new life, and the experience of this new life gives us a thrill of pleasure. \n\n Next in order of popularity are travel books, biographies and memoirs. These tell us tales of places we have not seen and of great men in whom we are interested. Some of these books are as wonderful as novels, and they have an added value that they are true. Such books give us knowledge, and we also find immense pleasure in learning details of lands we have not seen and of great men we have only heard of. \n\n Reading is one of the greatest enjoyments of life. To book-lovers, nothing is more fascinating than a book. And, the ordinary educated man who is interested and absorbed in his daily occupation wants to occasionally escape from his drudgery into the wonderland of books for recreation and refreshment.",
        questions: [
          {
            type: 'MCQ',
            text: 'What does the passage mainly discuss?',
            options: [
              { text: 'Reading as an exercise for the brain', isCorrect: false },
              { text: 'Different kinds of reading', isCorrect: true },
              { text: 'Reading as a pleasurable activity', isCorrect: false },
              { text: 'Different types of books', isCorrect: false },
            ]
          },
          {
            type: 'MCQ',
            text: 'According to paragraph 1, which of the following is NOT true?',
            options: [
              { text: 'Ordinary men find philosophy difficult.', isCorrect: false },
              { text: 'Scientists read for pleasure.', isCorrect: false },
              { text: 'Reading is a mental recreation.', isCorrect: false },
              { text: 'Mathematicians read books for pleasure.', isCorrect: true },
            ]
          },
          // Thêm 6 câu nữa để đủ 8 câu như hình
          { type: 'MCQ', text: 'Question 1.3...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
          { type: 'MCQ', text: 'Question 1.4...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
          { type: 'MCQ', text: 'Question 1.5...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
        ]
      },
      {
        title: "Phần 2",
        passage: "Đây là đoạn văn cho Phần 2.",
        questions: [
          { type: 'MCQ', text: 'Question 2.1...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
          { type: 'MCQ', text: 'Question 2.2...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
          { type: 'MCQ', text: 'Question 2.3...', options: [{text: 'A', isCorrect: true},{text: 'B', isCorrect: false}] },
        ]
      }
    ]
  }
};
// -----------------------------------------------------------------

/**
 * Hàm trợ giúp: Đếm tổng số câu hỏi
 */
const getTotalQuestions = (parts) => {
  return parts.reduce((acc, part) => acc + part.questions.length, 0);
};

/**
 * Hàm trợ giúp: Định dạng giây thành MM:SS
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

/**
 * Component: Cột điều khiển bên trái
 */
const LeftSidebar = ({ quiz, timeLeft, progress, onBack, onSubmit, currentPartIndex }) => {
  const [soundOn, setSoundOn] = useState(true);
  
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
      
      <h3 className="font-semibold text-gray-800 mb-3">Danh sách phần thi ({quiz.parts.length})</h3>
      <div className="space-y-2 mb-4">
        {quiz.parts.map((part, index) => (
          <div 
            key={index}
            className={`flex items-center p-3 rounded-lg cursor-pointer ${index === currentPartIndex ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <FiBookOpen className="mr-3" />
            <span className="font-medium">{part.title}</span>
          </div>
        ))}
      </div>

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
 * Component: Nội dung bài thi ở giữa
 */
const MainContent = ({ parts, answers, onSelectAnswer }) => {
  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-y-auto h-screen" style={{ marginLeft: '256px', marginRight: '240px' }}>
      {parts.map((part, pIndex) => (
        <div key={pIndex} id={`part-${pIndex}`} className="mb-10">
          {/* Hiển thị đoạn văn nếu có */}
          {part.passage && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <FiChevronsRight className="mr-2 text-blue-500" />
                {part.title} - Đọc hiểu
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {part.passage}
              </p>
            </div>
          )}

          {/* Hiển thị câu hỏi */}
          {part.questions.map((q, qIndex) => {
            const questionId = `p${pIndex}_q${qIndex}`;
            const selectedOption = answers[questionId]; // Lấy index đáp án đã chọn

            return (
              <div key={questionId} id={`question-${pIndex}-${qIndex}`} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <p className="font-semibold text-gray-800 mb-4">
                  Câu {pIndex + 1}.{qIndex + 1}: {q.text}
                </p>
                
                <div className="space-y-3">
                  {q.options.map((opt, oIndex) => (
                    <div
                      key={oIndex}
                      onClick={() => onSelectAnswer(pIndex, qIndex, oIndex)}
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
          })}
        </div>
      ))}
    </div>
  );
};

/**
 * Component: Mục lục câu hỏi bên phải
 */
const RightSidebar = ({ parts, answers }) => {
  return (
    <div className="w-60 bg-white p-4 shadow-lg h-screen fixed top-0 right-0 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Mục lục câu hỏi</h3>
      
      {parts.map((part, pIndex) => (
        <div key={pIndex} className="mb-4">
          <h4 className="font-semibold text-sm text-gray-600 mb-2">{part.title}</h4>
          <div className="grid grid-cols-5 gap-2">
            {part.questions.map((q, qIndex) => {
              const questionId = `p${pIndex}_q${qIndex}`;
              const isAnswered = answers[questionId] !== undefined;

              return (
                <a 
                  key={questionId}
                  href={`#question-${pIndex}-${qIndex}`}
                  className={`w-10 h-10 flex items-center justify-center rounded border
                    font-medium text-sm transition-all
                    ${isAnswered 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {pIndex + 1}.{qIndex + 1}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Component: Màn hình hiển thị kết quả
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
 * Component Trang chính
 */
export default function QuizTakingPage() {
  const { id } = useParams(); // Lấy id từ URL, ví dụ: /quizz/acbdfda
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({}); // { 'p0_q0': 0, 'p0_q1': 2 } (index đáp án)
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState({ score: 0, correctCount: 0, totalQuestions: 0 });
  
  // Memoize giá trị tính toán
  const totalQuestions = useMemo(() => quiz ? getTotalQuestions(quiz.parts) : 0, [quiz]);
  const progress = useMemo(() => ({
    answered: Object.keys(answers).length,
    total: totalQuestions
  }), [answers, totalQuestions]);

  // 1. Lấy dữ liệu bài thi khi component mount
  useEffect(() => {
    // --- BẮT ĐẦU GIẢ LẬP FETCH ---
    const fetchedQuiz = MOCK_EXAM_DATABASE[id];
    // --- KẾT THÚC GIẢ LẬP FETCH ---

    if (fetchedQuiz) {
      setQuiz(fetchedQuiz);
      setTimeLeft(fetchedQuiz.duration); // Bắt đầu đếm ngược
    } else {
      // Xử lý không tìm thấy bài thi
      alert("Không tìm thấy bài thi!");
      navigate('/');
    }
  }, [id, navigate]);

  // 2. Xử lý bộ đếm ngược
  useEffect(() => {
    // Không chạy timer nếu đã nộp bài hoặc chưa tải xong quiz
    if (isFinished || !quiz) return;

    if (timeLeft <= 0) {
      // Hết giờ -> Tự động nộp bài
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Dọn dẹp interval khi component unmount hoặc khi nộp bài
    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, quiz]);

  // 3. Hàm tính toán kết quả
  const calculateResults = () => {
    let correctCount = 0;
    
    quiz.parts.forEach((part, pIndex) => {
      part.questions.forEach((q, qIndex) => {
        if (q.type === 'MCQ') {
          const questionId = `p${pIndex}_q${qIndex}`;
          const userAnswerIndex = answers[questionId];
          
          if (userAnswerIndex !== undefined) {
            const correctAnswer = q.options[userAnswerIndex].isCorrect;
            if (correctAnswer) {
              correctCount++;
            }
          }
        }
        // Thêm logic chấm điểm cho các loại câu hỏi khác (ví dụ [FILL]) ở đây
      });
    });

    const score = (correctCount / totalQuestions) * 10;
    setResults({ score, correctCount, totalQuestions });
  };

  // 4. Hàm xử lý nộp bài (tự động hoặc thủ công)
  const handleSubmit = () => {
    if (isFinished) return; // Tránh nộp nhiều lần

    // Xác nhận nộp bài sớm
    if (timeLeft > 0) {
      const confirmSubmit = window.confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?");
      if (!confirmSubmit) {
        return; // Hủy nộp bài
      }
    }

    setIsFinished(true);
    // Dừng timer (sẽ tự động dừng vì isFinished=true)
    
    // Tính toán kết quả
    calculateResults();
    
    // Ở đây bạn có thể gửi `answers` và `results` lên backend
    console.log("BÀI THI ĐÃ NỘP");
    console.log("Đáp án của người dùng:", answers);
  };

  // 5. Hàm chọn đáp án
  const handleSelectAnswer = (partIndex, questionIndex, optionIndex) => {
    if (isFinished) return; // Không cho thay đổi khi đã nộp
    
    const questionId = `p${partIndex}_q${questionIndex}`;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: optionIndex
    }));
  };

  // 6. Hàm quay về
  const handleGoBack = () => {
    // Có thể thêm cảnh báo nếu đang làm bài
    navigate('/'); // Quay về trang chủ (hoặc trang danh sách)
  };
  
  // --- Render ---
  
  // Đang tải...
  if (!quiz) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải bài thi...</div>;
  }
  
  // Hiển thị kết quả nếu đã nộp
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
        currentPartIndex={0} // Có thể thêm logic để theo dõi phần đang xem
      />
      
      <MainContent 
        parts={quiz.parts}
        answers={answers}
        onSelectAnswer={handleSelectAnswer}
      />
      
      <RightSidebar 
        parts={quiz.parts}
        answers={answers}
      />
    </div>
  );
}