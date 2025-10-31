import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ExamListPage from "./pages/workspace/exams/List";
import CreateExamPage from "./pages/workspace/exams/CreateWithText";
import NewExamPage from "./pages/workspace/exams/New";
import QuizTakingPage from "./pages/quiz/exam/QuizTaking";
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/workspace/exams/list" element={<ExamListPage />} />
          <Route path="/workspace/exams/create-with-text" element={<CreateExamPage />} />
          
        </Route>

        <Route path="/quizz/:id" element={<QuizTakingPage />} />
        
        {/* New Exam Creation Page - has its own layout */}
        <Route 
          path="/workspace/exams/new" 
          element={
            <ProtectedRoute>
              <NewExamPage />
            </ProtectedRoute>
          } 
        />

   

        {/* 404 page */}
        <Route
          path="*"
          element={<h1 className="text-center mt-10 text-red-500">404 - Not Found</h1>}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
