import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";

const ICONS = {
  dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  boards: "M3 3h18v18H3zM9 3v18M15 3v18",
  members: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};

const Icon = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name].split("M").filter(Boolean).map((d, i) => <path key={i} d={`M${d}`} />)}
  </svg>
);

const NAV = [
  { to: "/",         label: "Dashboard", icon: "dashboard", end: true },
  { to: "/boards",   label: "Boards",    icon: "boards" },
  { to: "/members",  label: "Members",   icon: "members" },
  { to: "/settings", label: "Settings",  icon: "settings" },
];

function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => { api.get("/users/me").then((r) => setUser(r.data)).catch(() => {}); }, []);

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 overflow-hidden">

        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-9 h-9 grid place-items-center rounded-xl shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-500/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3"  y="3"  width="8" height="8" rx="2" fill="white" fillOpacity="0.9"/>
              <rect x="13" y="3"  width="8" height="8" rx="2" fill="white" fillOpacity="0.6"/>
              <rect x="3"  y="13" width="8" height="8" rx="2" fill="white" fillOpacity="0.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>
          <span className="text-[17px] font-extrabold text-slate-900 tracking-tight">Project</span>
        </div>

        <nav className="px-3 pt-5 pb-2 flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-2">Main Menu</p>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative transition-colors
                ${isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r bg-blue-600" />}
                  <Icon name={icon} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-slate-100 mx-1 mb-1">
          <div className="w-9 h-9 rounded-full grid place-items-center text-white text-[13px] font-extrabold shrink-0 shadow"
            style={{ background: stringToColor(user?._id || "u") }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-slate-900 truncate">{user?.name || "User"}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow shadow-green-400/40" />
              Connected
            </span>
          </div>
          <button onClick={logout} title="Log out"
            className="w-7 h-7 grid place-items-center rounded-lg bg-transparent text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors p-0 min-h-0 shadow-none">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
