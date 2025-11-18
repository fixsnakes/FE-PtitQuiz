import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
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
      
        </Route>
        
        
        {/* 404 page */}
        <Route
          path="*"
          element={<h1 className="text-center mt-10 text-red-500">404 - Not Found</h1>}
        />

        <Route path="/" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
