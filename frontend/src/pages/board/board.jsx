import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, KeyboardSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { io } from "socket.io-client";
import { Link, useParams } from "react-router-dom";
import api from "../../api/api";
import useBoardStore from "../../stores/boardStore";

// Components
import { stringToColor } from "./utils";
import Column from "./Column";
import CardModal from "./CardModal";

const socketUrl = import.meta.env.DEV ? window.location.origin : (import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");


const Board = () => {
  const { boardId } = useParams();
  const [columnTitle, setColumnTitle] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    board,
    role,
    loading,
    error,
    presence,
    socketStatus,
    loadBoard,
    addColumn,
    addCard,
    moveCard,
    updateCard,
    applyCard,
    removeCard,
    setPresence,
    setSocketStatus,
    setCursor,
  } = useBoardStore();

  const canEdit = ["Owner", "Editor"].includes(role);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadBoard(boardId);
  }, [boardId, loadBoard]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const socket = io(socketUrl, { auth: { token } });
    socket.on("connect", () => {
      setSocketStatus("connected");
      socket.emit("board:join", { boardId });
    });
    socket.on("presence:update", ({ users }) => setPresence(users || []));
    socket.on("cursor:move", setCursor);
    socket.on("card:created", ({ card }) => applyCard(card));
    socket.on("card:updated", ({ card }) => applyCard(card));
    socket.on("card:moved", ({ card }) => applyCard(card));
    socket.on("card:deleted", ({ cardId }) => removeCard(cardId));
    
    const move = (e) => socket.emit("cursor:move", { boardId, x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      socket.disconnect();
    };
  }, [boardId, loadBoard, setSocketStatus, setPresence, setCursor, applyCard, removeCard]);

  const filteredColumns = useMemo(() => {
    if (!board) return [];
    const query = searchQuery.toLowerCase();
    return board.columns.map((col) => ({
      ...col,
      cards: col.cards.filter((c) => 
        c.title.toLowerCase().includes(query) || 
        (c.description || "").toLowerCase().includes(query) ||
        (c.labels || []).some(l => l.toLowerCase().includes(query))
      )
    }));
  }, [board, searchQuery]);

  const onDragEnd = ({ active, over }) => {
    if (!over || !canEdit) return;
    const overCol = board.columns.find((col) => col._id === over.id || col.cards.some((c) => c._id === over.id));
    if (!overCol) return;
    const overIdx = overCol.cards.findIndex((c) => c._id === over.id);
    moveCard(active.id, overCol._id, overIdx >= 0 ? overIdx : overCol.cards.length);
  };

  if (loading) return <main className="flex flex-col h-screen p-0 bg-slate-100"><div className="grid place-items-center h-full text-slate-500">Opening board...</div></main>;
  if (!board) return <main className="flex flex-col h-screen p-0 bg-slate-100"><div className="grid place-items-center h-full text-red-500">{error || "Board not found"}</div></main>;

  return (
    <main className="flex flex-col h-screen p-0 bg-slate-100">
      <div className="px-8 pt-6 pb-4 bg-white border-b-[1.5px] border-slate-200 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Link className="text-blue-600 text-[13px] font-bold no-underline flex items-center gap-1.5 mb-1 hover:underline" to="/dashboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{board.title}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>{role} Access</span>
              <span>•</span>
              <span>{socketStatus}</span>
            </div>
          </div>
          <div className="flex items-center">
            {presence.slice(0, 5).map((u) => (
              <span key={u.id} className="w-8 h-8 rounded-full border-2 border-white -ml-2 grid place-items-center text-white text-[11px] font-extrabold shadow-sm first:ml-0" style={{ background: stringToColor(u.id) }} title={u.name}>
                {(u.name || "U")[0].toUpperCase()}
              </span>
            ))}
            {presence.length > 5 && <span className="w-8 h-8 rounded-full border-2 border-white -ml-2 grid place-items-center text-white text-[11px] font-extrabold shadow-sm bg-slate-400">+{presence.length - 5}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[320px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input 
              className="w-full h-9 pl-9 pr-3 rounded border border-slate-200 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Filter cards by title, tag, or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-5 px-8 py-6 overflow-x-auto items-start">
          {filteredColumns.map((col) => (
            <Column key={col._id} column={col} cards={col.cards} onAddCard={addCard} onOpenCard={setSelectedCard} canEdit={canEdit} />
          ))}
          {canEdit && (
            <div className="w-[300px] shrink-0 bg-white p-4 rounded-2xl border-[1.5px] border-dashed border-slate-200 flex flex-col gap-2.5">
              <input 
                className="w-full h-9 px-3 border border-slate-200 rounded text-sm focus:border-blue-500 focus:outline-none"
                placeholder="New column title..." 
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
              />
              <button 
                className="h-9 w-full bg-slate-100 text-slate-700 font-bold rounded hover:bg-slate-200 border-none cursor-pointer"
                onClick={() => { if(columnTitle.trim()){ addColumn(columnTitle.trim()); setColumnTitle(""); } }}>
                Add Column
              </button>
            </div>
          )}
        </div>
      </DndContext>

      {selectedCard && (
        <CardModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
          onSave={(id, draft) => { updateCard(id, draft); setSelectedCard(null); }} 
          boardMembers={board.members || []} 
        />
      )}
    </main>
  );
};

export default Board;

