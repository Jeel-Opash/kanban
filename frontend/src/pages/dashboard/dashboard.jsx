import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { PlusIcon, UserPlusIcon } from "../../components/common/Icons";
import WorkspaceCard from "../../components/dashboard/WorkspaceCard";
import BoardItem from "../../components/dashboard/BoardItem";
import MemberItem from "../../components/dashboard/MemberItem";

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState({});
  const [activeId, setActiveId] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showCreateWs, setShowCreateWs] = useState(false);

  const activeWorkspace = workspaces.find((ws) => ws._id === activeId);
  const activeBoards = boards[activeId] || [];
  const errMsg = (e, t) => setMessage(e.response?.data?.message || t);

  const loadBoards = async (id) => {
    try {
      const r = await api.get(`/board/${id}`);
      setBoards((o) => ({ ...o, [id]: r.data }));
    } catch (e) {
      errMsg(e, "Boards not loaded");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/ws");
        setWorkspaces(r.data);
        if (r.data.length) {
          const id = r.data[0]._id;
          setActiveId(id);
          loadBoards(id);
        }
      } catch (e) {
        errMsg(e, "Dashboard not loaded");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectWorkspace = (id) => {
    setActiveId(id);
    if (!boards[id]) loadBoards(id);
  };

  const createWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    try {
      const r = await api.post("/ws", { name: workspaceName.trim() });
      const ws = r.data.workspace;
      setWorkspaces([...workspaces, ws]);
      setBoards({ ...boards, [ws._id]: [] });
      setActiveId(ws._id);
      setWorkspaceName("");
      setShowCreateWs(false);
    } catch (e) {
      errMsg(e, "Workspace not created");
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!boardTitle.trim() || !activeId) return;
    try {
      const r = await api.post("/board", { title: boardTitle.trim(), workspaceId: activeId });
      setBoards({ ...boards, [activeId]: [...activeBoards, r.data.board] });
      setBoardTitle("");
    } catch (e) {
      errMsg(e, "Board not created");
    }
  };

  const inviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeId) return;
    try {
      const r = await api.post("/ws/invite", { workspaceId: activeId, email: inviteEmail.trim(), role: inviteRole });
      setWorkspaces(workspaces.map((ws) => ws._id === r.data.workspace._id ? r.data.workspace : ws));
      setInviteEmail("");
      setInviteRole("Viewer");
      setMessage("Invite sent!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      errMsg(e, "Member not invited");
    }
  };

  if (loading) return <main className="p-8 text-slate-500">Loading your workspaces...</main>;

  return (
    <main className="max-w-6xl mx-auto p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Workspaces</h1>
        </div>
      </header>

      {message && (
        <div className="mb-6 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">{message}</div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mb-10">
        {workspaces.map((ws) => (
      <WorkspaceCard key={ws._id} ws={ws} isActive={activeId === ws._id}
    onSelect={selectWorkspace} boardCount={boards[ws._id]?.length || 0}/>
        ))}

        {!showCreateWs ? (
          <button onClick={() => setShowCreateWs(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl p-7 min-h-[200px] bg-slate-50 border-2 border-dashed border-slate-300 cursor-pointer transition-all hover:bg-white hover:border-blue-500 hover:shadow-md group">
            <div className="w-12 h-12 rounded-full bg-white text-slate-400 grid place-items-center shadow-sm transition-all group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:rotate-90">
              <PlusIcon />
            </div>
            <span className="text-[15px] font-bold text-slate-800">New Workspace</span>
            <p className="text-[13px] text-slate-500 text-center max-w-[180px] leading-relaxed">
              Start a fresh environment for your next project.
            </p>
          </button>
        ) : (
          <div className="flex flex-col gap-4 rounded-2xl p-6 bg-[#2d5bbf] shadow-[0_0_0_2px_white,0_8px_28px_rgba(59,111,212,.45)] min-h-[200px]">
            <form onSubmit={createWorkspace} className="flex flex-col gap-3">
              <h3 className="text-lg font-extrabold text-white">Create Workspace</h3>
              <input autoFocus value={workspaceName} placeholder="e.g. Design Team"
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3 h-9 rounded-lg border border-white/30 bg-white/10 text-white placeholder-white/50 outline-none focus:border-white text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 h-9 rounded-lg bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 border-none">Create</button>
                <button type="button" onClick={() => setShowCreateWs(false)}
                  className="px-4 h-9 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 border-none">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {activeWorkspace && (
        <div className="animate-[fadeIn_.3s_ease-out]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">{activeWorkspace.name} Boards</h2>
            <form onSubmit={createBoard} className="flex gap-2">
              <input value={boardTitle} placeholder="New board title..."
                onChange={(e) => setBoardTitle(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white" />
              <button type="submit" className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 border-none">
                <PlusIcon/> Create Board
              </button>
            </form>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mb-2">
            {activeBoards.map((board) => (
    <BoardItem key={board._id} board={board} onClick={() => navigate(`/board/${board._id}`)}/>
            ))}
            {activeBoards.length === 0 && (
              <p className="text-slate-400 text-sm py-5">No boards found in this workspace.</p>
            )}
          </div>

          <div className="mt-9">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Members</h2>
              <form onSubmit={inviteMember} className="flex gap-2">
                <input type="email" value={inviteEmail} placeholder="Collaborator email..."
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white" />
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="h-9 px-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 bg-white">
                  <option>Viewer</option><option>Editor</option><option>Owner</option>
                </select>
                <button type="submit" className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 border-none">
                  <UserPlusIcon/>Invite</button>
              </form>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
              {activeWorkspace.members?.map((m) => (
                <MemberItem key={m.user?._id || m.user} member={m} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
