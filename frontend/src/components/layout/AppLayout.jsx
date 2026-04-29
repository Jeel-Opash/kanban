import { Link, NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <nav className="app-navbar">
        <Link className="app-logo" to="/">Kanban</Link>
        <button type="button" onClick={logout}>Logout</button>
      </nav>

      <div className="app-body">
        <aside className="app-sidebar">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/board/demo-board">Demo Board</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </aside>

        <div className="app-content">{children}</div>
      </div>

      <footer className="app-footer">
        <p>Kanban Board App</p>
      </footer>
    </div>
  );
};

export default AppLayout;
