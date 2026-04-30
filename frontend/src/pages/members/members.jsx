import { useEffect, useState } from "react";
import api from "../../api/api";

const toColor = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},55%,45%)`;
};

const ROLE_STYLE = {
  Owner:  "bg-yellow-100 text-yellow-800",
  Editor: "bg-green-100 text-green-800",
  Viewer: "bg-indigo-100 text-indigo-800",
};

const Members = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/ws")
      .then((r) => { setWorkspaces(r.data); if (r.data[0]) setActiveId(r.data[0]._id); })
      .catch(() => setMsg("Failed to load workspaces"))
      .finally(() => setLoading(false));
  }, []);

  const ws = workspaces.find((w) => w._id === activeId);

  const invite = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/ws/invite", { workspaceId: activeId, email: email.trim(), role });
      setWorkspaces(workspaces.map((w) => w._id === activeId ? r.data.workspace : w));
      setEmail(""); setMsg("Member invited.");
    } catch (err) { setMsg(err.response?.data?.message || "Failed"); }
  };

  const remove = async (userId) => {
    try {
      await api.post("/ws/remove", { workspaceId: activeId, userId });
      setWorkspaces(workspaces.map((w) =>
        w._id === activeId ? { ...w, members: w.members.filter((m) => String(m.user?._id || m.user) !== userId) } : w
      ));
      setMsg("Member removed.");
    } catch (err) { setMsg(err.response?.data?.message || "Failed"); }
  };

  if (loading) return <main className="p-8 text-slate-500">Loading...</main>;

  const inputCls = "h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white w-full";

  return (
    <main className="p-6">
      <header className="max-w-4xl mx-auto mb-5">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">Members</h1>
        <p className="text-slate-500 text-sm mt-1">Manage workspace members and roles</p>
      </header>

      {msg && <div className="max-w-4xl mx-auto mb-5 px-4 py-2.5 rounded-lg bg-blue-50 text-slate-900 text-sm">{msg}</div>}

      <div className="max-w-4xl mx-auto mb-5 flex flex-wrap gap-2">
        {workspaces.map((w) => (
          <button key={w._id} onClick={() => setActiveId(w._id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors
              ${activeId === w._id ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-slate-900 border-blue-200 hover:bg-blue-100"}`}>
            {w.name}
          </button>
        ))}
      </div>

      {ws && (
        <div className="max-w-4xl mx-auto grid grid-cols-[1fr_360px] gap-4 items-start max-md:grid-cols-1">
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Current Members</h2>
            <ul className="flex flex-col gap-2.5">
              {ws.members?.map((m, i) => {
                const u = m.user || {};
                const id = String(u._id || u);
                const name = u.name || "User";
                return (
                  <li key={`${id}-${i}`} className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-lg">
                    <div className="w-9 h-9 rounded-full grid place-items-center text-white font-extrabold text-[15px] shrink-0"
                      style={{ background: toColor(id) }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 grid gap-0.5 min-w-0">
                      <span className="font-bold text-slate-900 truncate text-sm">{name}</span>
                      <span className="text-xs text-slate-500 truncate">{u.email}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${ROLE_STYLE[m.role] || ""}`}>{m.role}</span>
                    {m.role !== "Owner" && (
                      <button onClick={() => remove(id)}
                        className="min-h-0 px-2 py-1 bg-transparent text-red-500 border border-red-300 rounded-md text-xs shrink-0 hover:bg-red-50">✕</button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Invite Member</h2>
            <form onSubmit={invite} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-email" className="text-[13px] font-semibold text-slate-900">Email</label>
                <input id="inv-email" type="email" placeholder="colleague@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-role" className="text-[13px] font-semibold text-slate-900">Role</label>
                <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                  <option value="Viewer">Viewer — view only</option>
                  <option value="Editor">Editor — can edit cards</option>
                  <option value="Owner">Owner — full access</option>
                </select>
              </div>
              <button type="submit" className="h-10 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 border-none">Send Invite</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Members;
