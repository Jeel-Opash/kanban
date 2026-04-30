import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableCard from "./SortableCard";

export default function Column({ column, cards, onAddCard, onOpenCard, canEdit }) {
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { setNodeRef } = useDroppable({ id: column._id, disabled: !canEdit });

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddCard(column._id, title.trim());
    setTitle("");
    setIsAdding(false);
  };

  return (
    <div className="w-[300px] shrink-0 bg-slate-100 rounded-2xl flex flex-col max-h-full">
      <div className="p-4 pb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">{column.title}</h2>
        <span className="text-[11px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-xl">{cards.length}</span>
      </div>
      <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
        <div className={`px-3 pb-3 flex flex-col gap-3 overflow-y-auto ${cards.length === 0 ? "min-h-[100px] border-2 border-dashed border-slate-300 mx-3 mb-3 rounded-xl grid place-items-center text-slate-400 text-[13px]" : ""}`} ref={setNodeRef}>
          {cards.map((card) => (
            <SortableCard key={card._id} card={card} onOpen={onOpenCard} disabled={!canEdit} />
          ))}
          {cards.length === 0 && <p>No cards yet</p>}
        </div>
      </SortableContext>
      {canEdit && (
        <div className="p-3 border-t border-slate-200">
          {!isAdding ? (
            <button className="w-full bg-transparent text-slate-500 border-none font-semibold flex justify-start items-center gap-1.5 px-3 py-2 hover:bg-slate-200 hover:text-slate-900 rounded" onClick={() => setIsAdding(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add a card
            </button>
          ) : (
            <form onSubmit={submit}>
              <input
                autoFocus
                value={title}
                placeholder="Enter card title..."
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => !title && setIsAdding(false)}
                className="w-full h-9 px-3 border border-slate-200 rounded bg-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2" style={{ marginTop: '8px' }}>
                <button type="submit" className="h-8 px-3 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 border-none">Add Card</button>
                <button type="button" className="h-8 px-3 bg-transparent text-slate-500 text-xs font-bold rounded hover:bg-slate-200 border-none" onClick={() => setIsAdding(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
