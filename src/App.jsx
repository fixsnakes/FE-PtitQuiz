import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import TeacherClasses from "./pages/dashboard/classes/TeacherClasses";
import CreateClass from "./pages/dashboard/classes/CreateClass";
import ClassDetail from "./pages/dashboard/classes/ClassDetail";
import ExamListPage from "./pages/dashboard/exams/ExamList";
import CreateExamPage from "./pages/dashboard/exams/CreateExam";
import QuestionMethodSelector from "./pages/dashboard/exams/QuestionMethodSelector";
import AddQuestionsByText from "./pages/dashboard/exams/AddQuestionsByText";
import ManageExamQuestions from "./pages/dashboard/exams/ManageExamQuestions";

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<SignUp />} />

      {/* Dashboard routes */}
      <Route
        path="/dashboard/teacher"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/classes"
        element={<Navigate to="/teacher/classes" replace />}
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/classes/create"
        element={<Navigate to="/teacher/classes/create" replace />}
      />
      <Route
        path="/teacher/classes/create"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <CreateClass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/classes/:classId"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ClassDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes/:classId"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ClassDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/exams"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ExamListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/exams/create"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <CreateExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/exams/:examId/questions"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <QuestionMethodSelector />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/exams/:examId/questions/text"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <AddQuestionsByText />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher/exams/:examId/questions/editor"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <ManageExamQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root redirect based on role */}
      <Route path="/" element={<RoleRedirect />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <h1 className="mt-10 text-center text-red-500">404 - Not Found</h1>
        }
      />
    </Routes>
  );
}

export default App;
