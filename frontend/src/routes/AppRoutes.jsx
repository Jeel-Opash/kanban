import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/login-register/login";
import Register from "../pages/login-register/register";
import Dashboard from "../pages/dashboard/dashboard";
import Board from "../pages/board/board";
import Profile from "../pages/profile/profile";
import AppLayout from "../components/layout/AppLayout";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/board/:boardId"
          element={
            <PrivateRoute>
              <Board />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
