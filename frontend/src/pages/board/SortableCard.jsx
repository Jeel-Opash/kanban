import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AssigneeAvatars from "./AssigneeAvatars";

export default function SortableCard({ card, onOpen, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const checklist = card.checklist || [];
  const completed = checklist.filter((i) => i.completed).length;
  const progress = checklist.length > 0 ? (completed / checklist.length) * 100 : 0;

  const tagColors = {
    feature: "bg-blue-100 text-blue-800",
    design: "bg-purple-100 text-purple-800",
    bug: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 cursor-grab transition-all duration-200 shadow-sm text-left hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 ${isDragging ? "opacity-50 cursor-grabbing" : ""}`}
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(card)}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-wrap gap-1.5">
        {(card.labels || []).slice(0, 2).map((label) => {
          const lLower = label.toLowerCase();
          const colorClass = tagColors[lLower] || "bg-slate-100 text-slate-800";
          return (
            <span key={label} className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${colorClass}`}>
              {label}
            </span>
          )
        })}
      </div>
      <span className="text-sm font-bold text-slate-900 leading-snug">{card.title}</span>
      {card.description && <p className="text-[13px] text-slate-500 line-clamp-2">{card.description}</p>}
      
      {checklist.length > 0 && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>{completed}/{checklist.length}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          {card.dueDate && (
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
        <AssigneeAvatars assignees={card.assignees || []} />
      </div>
    </div>
  );
}
