import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./dashboard.css";
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
  const activeWorkspace = workspaces.find((workspace) => workspace._id === activeId);
  const activeBoards = boards[activeId] || [];
  const errorMsg = (error, text) => setMessage(error.response?.data?.message || text);
  const loadBoards = async (workspaceId) => {
    try {
      const res = await api.get(`/board/${workspaceId}`);
      setBoards((oldBoards) => ({ ...oldBoards, [workspaceId]: res.data }));
    } catch (error) {
      errorMsg(error, "Boards not loaded");
    }
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/ws");
        setWorkspaces(res.data);
        if (res.data.length) {
          const id = res.data[0]._id;
          setActiveId(id);
          const boardRes = await api.get(`/board/${id}`);
          setBoards({ [id]: boardRes.data });
        }
      } catch (error) {
        errorMsg(error, "Dashboard not loaded");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const selectWorkspace = (id) => {
    setActiveId(id);
    if (!boards[id]) loadBoards(id);
  };
  const createWorkspace = async (event) => {
    event.preventDefault();
    if (!workspaceName.trim()) return;
    try {
      const res = await api.post("/ws", { name: workspaceName.trim() });
      const workspace = res.data.workspace;
      setWorkspaces([...workspaces, workspace]);
      setBoards({ ...boards, [workspace._id]: [] });
      setActiveId(workspace._id);
      setWorkspaceName("");
    } catch (error) {
      errorMsg(error, "Workspace not created");
    }
  };
  const createBoard = async (event) => {
    event.preventDefault();
    if (!boardTitle.trim() || !activeId) return;
    try {
      const res = await api.post("/board", { title: boardTitle.trim(), workspaceId: activeId });
      setBoards({ ...boards, [activeId]: [...activeBoards, res.data.board] });
      setBoardTitle("");
    } catch (error) {
      errorMsg(error, "Board not created");
    }
  };
  const inviteMember = async (event) => {
    event.preventDefault();
    if (!inviteEmail.trim() || !activeId) return;
    try {
      const res = await api.post("/ws/invite", { workspaceId: activeId, email: inviteEmail.trim(), role: inviteRole });
      setWorkspaces(workspaces.map((workspace) => workspace._id === res.data.workspace._id ? res.data.workspace : workspace));
      setInviteEmail("");
      setInviteRole("Viewer");
    } catch (error) {
      errorMsg(error, "Member not invited");
    }
  };
  if (loading) return <main className="dashboard-page"><p>Loading...</p></main>;
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>
      {message && <p className="message">{message}</p>}
      <div className="dashboard-layout">
        <aside className="sidebar">
          <h2>Workspaces</h2>
          {workspaces.map((workspace) => (
            <button className={activeId === workspace._id ? "active" : ""}
              key={workspace._id}
              onClick={() => selectWorkspace(workspace._id)}>
              {workspace.name}
            </button>
          ))}
          <form onSubmit={createWorkspace}>
            <input value={workspaceName} placeholder="Workspace name" onChange={(e) => setWorkspaceName(e.target.value)} />
            <button>Create</button>
          </form>
        </aside>
        <section className="main-panel">
          <h2>{activeWorkspace?.name || "No workspace"}</h2>
          <form className="row-form" onSubmit={inviteMember}>
            <input type="email" value={inviteEmail} placeholder="Invite email" onChange={(e) => setInviteEmail(e.target.value)} />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option>Viewer</option>
              <option>Editor</option>
              <option>Owner</option>
            </select>
            <button>Invite</button>
          </form>
          <form className="row-form" onSubmit={createBoard}>
            <input value={boardTitle} placeholder="Board title" onChange={(e) => setBoardTitle(e.target.value)} />
            <button>Create Board</button>
          </form>
          <h3>Boards</h3>
          <div className="board-list">
            {activeBoards.map((board) => (
              <button className="board-card" key={board._id} onClick={() => navigate(`/board/${board._id}`)}>
                {board.title}
              </button>
            ))}
          </div>
          <h3>Members</h3>
          <ul className="member-list">
            {activeWorkspace?.members?.map((member) => <li key={member.user?._id || member.user}>{member.user?.name || "User"} - {member.role}</li>)}
          </ul>
        </section>
      </div>
    </main>
  );
};
export default Dashboard;
