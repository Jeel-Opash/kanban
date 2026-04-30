import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/login-register/login";
import Register from "../pages/login-register/register";
import Dashboard from "../pages/dashboard/dashboard";
import BoardsPage from "../pages/dashboard/BoardsPage";
import Board from "../pages/board/board";
import Profile from "../pages/profile/profile";
import Members from "../pages/members/members";
import Settings from "../pages/settings/settings";
import AppLayout from "../components/layout/AppLayout";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
};

const PRIVATE = [
  { path: "/",              Page: Dashboard  },
  { path: "/boards",        Page: BoardsPage },
  { path: "/board/:boardId",Page: Board      },
  { path: "/profile",       Page: Profile    },
  { path: "/members",       Page: Members    },
  { path: "/settings",      Page: Settings   },
];

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        {PRIVATE.map(({ path, Page }) => (
          <Route key={path} path={path} element={<PrivateRoute><Page /></PrivateRoute>} />
        ))}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
