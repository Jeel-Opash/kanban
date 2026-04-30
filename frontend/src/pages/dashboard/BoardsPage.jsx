import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const BoardsPage = () => {
  const navigate = useNavigate();
  const [allBoards, setAllBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get("/ws");
        const workspaces = res.data;
        const boardPromises = workspaces.map(ws => api.get(`/board/${ws._id}`));
        const boardResults = await Promise.all(boardPromises);
        const combined = boardResults.flatMap(r => r.data);
        setAllBoards(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <main className="max-w-6xl mx-auto p-8 text-slate-500">Loading your boards...</main>;

  return (
    <main className="max-w-6xl mx-auto p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Boards</h1>
          <p className="text-slate-500 text-sm mt-1">A complete list of boards across all your workspaces.</p>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mb-2">
        {allBoards.map((board) => (
          <div key={board._id} onClick={() => navigate(`/board/${board._id}`)}
            className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl cursor-pointer transition-colors hover:border-blue-500 hover:shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-900 flex-1 truncate text-sm">{board.title}</span>
          </div>
        ))}
        {allBoards.length === 0 && (
          <p className="text-slate-400 text-sm py-5">No boards found. Create one from the Dashboard!</p>
        )}
      </div>
    </main>
  );
};

export default BoardsPage;
