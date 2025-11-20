import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import TeacherDashboard from "./pages/dashboard/teacher/TeacherDashboard";
import StudentDashboard from "./pages/dashboard/student/StudentDashboard";
import Profile from "./pages/dashboard/common/Profile";
import TeacherClasses from "./pages/dashboard/teacher/classes/TeacherClasses";
import CreateClass from "./pages/dashboard/teacher/classes/CreateClass";
import ClassDetail from "./pages/dashboard/teacher/classes/ClassDetail";
import ExamListPage from "./pages/dashboard/teacher/exams/ExamList";
import CreateExamPage from "./pages/dashboard/teacher/exams/CreateExam";
import QuestionMethodSelector from "./pages/dashboard/teacher/exams/QuestionMethodSelector";
import AddQuestionsByText from "./pages/dashboard/teacher/exams/AddQuestionsByText";
import ManageExamQuestions from "./pages/dashboard/teacher/exams/ManageExamQuestions";
import StudentClasses from "./pages/dashboard/student/StudentClasses";
import "react-toastify/dist/ReactToastify.css";
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
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute allowedRoles={["teacher", "student"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/student/classes"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentClasses />
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
