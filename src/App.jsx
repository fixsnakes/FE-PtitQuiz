import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import EditExamPage from "./pages/dashboard/teacher/exams/EditExam";
import ExamResultsPage from "./pages/dashboard/teacher/exams/ExamResults";
import ExamMonitoringPage from "./pages/dashboard/teacher/exams/ExamMonitoring";
import NotificationsPage from "./pages/dashboard/teacher/Notifications";
import TeacherExamPurchases from "./pages/dashboard/teacher/ExamPurchases";
import StudentClasses from "./pages/dashboard/student/StudentClasses";
import StudentClassDetail from "./pages/dashboard/student/StudentClassDetail";
import StudentExams from "./pages/dashboard/student/StudentExams";
import ExamDetail from "./pages/dashboard/student/ExamDetail";
import TakeExam from "./pages/dashboard/student/TakeExam";
import ExamResult from "./pages/dashboard/student/ExamResult";
import RecentExams from "./pages/dashboard/student/RecentExams";
import FavoriteExams from "./pages/dashboard/student/FavoriteExams";
import StudentPayment from "./pages/dashboard/student/StudentPayment";
import StudentNotifications from "./pages/dashboard/student/Notifications";
import TransactionHistory from "./pages/dashboard/common/TransactionHistory";
import TeacherPayment from "./pages/dashboard/teacher/TeacherPayment";
// Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import UserManagement from "./pages/dashboard/admin/UserManagement";
import ExamManagement from "./pages/dashboard/admin/ExamManagement";
import ClassManagement from "./pages/dashboard/admin/ClassManagement";
import PurchaseManagement from "./pages/dashboard/admin/PurchaseManagement";
import Reports from "./pages/dashboard/admin/Reports";
import NotificationManagement from "./pages/dashboard/admin/NotificationManagement";
import ContentModeration from "./pages/dashboard/admin/ContentModeration";

import "react-toastify/dist/ReactToastify.css";

function WalletRedirect() {
  const stored = localStorage.getItem("currentUser");
  const user = stored ? JSON.parse(stored) : null;
  if (user?.role === "teacher") {
    return <Navigate to="/dashboard/teacher/payment" replace />;
  }
  if (user?.role === "student") {
    return <Navigate to="/dashboard/student/payment" replace />;
  }
  return <Navigate to="/auth/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
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
          path="/dashboard/teacher/exams/:examId/edit"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <EditExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/exams/:examId/results"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ExamResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/exams/:examId/monitoring"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ExamMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/notifications"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/exam-purchases"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherExamPurchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/transactions"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TransactionHistory role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teacher/payment"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherPayment />
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
          path="/dashboard/wallet"
          element={
            <ProtectedRoute allowedRoles={["teacher", "student"]}>
              <WalletRedirect />
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
        <Route
          path="/dashboard/student/classes/:classId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentClassDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/payment"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/transactions"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <TransactionHistory role="student" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/exams"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/exams/:examId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ExamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams/:examId/take"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <TakeExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams/:examId/result/:sessionId"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ExamResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/recent"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RecentExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/favorite"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <FavoriteExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student/notifications"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentNotifications />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="purchases" element={<PurchaseManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="moderation" element={<ContentModeration />} />
        </Route>

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
    </ThemeProvider>
  );
}

export default App;
