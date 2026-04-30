import { useState, useEffect } from "react";
import api from "../../api/api";
import { stringToColor } from "./utils";

export default function CardModal({ card, onClose, onSave, boardMembers = [] }) {
  const [draft, setDraft] = useState(card);
  const [activities, setActivities] = useState([]);
  const [assigneeSelect, setAssigneeSelect] = useState("");

  useEffect(() => {
    api.get(`/activity/card/${card._id}`).then((res) => setActivities(res.data)).catch(() => setActivities([]));
  }, [card._id]);

  const checklist = draft.checklist || [];
  const assignees = draft.assignees || [];

  const updateChecklist = (index, changes) => {
    setDraft({ ...draft, checklist: checklist.map((item, i) => i === index ? { ...item, ...changes } : item) });
  };

  const addAssignee = () => {
    if (!assigneeSelect) return;
    const member = boardMembers.find((m) => (m.user?._id || m.user || m._id) === assigneeSelect);
    if (!member) return;
    const memberId = member.user?._id || member.user || member._id;
    if (assignees.some((a) => (a._id || a) === memberId)) return;
    setDraft({ ...draft, assignees: [...assignees, { _id: memberId, name: member.user?.name || member.name }] });
    setAssigneeSelect("");
  };

  const removeAssignee = (id) => {
    setDraft({ ...draft, assignees: assignees.filter((a) => (a._id || a) !== id) });
  };

  const unassigned = boardMembers.filter((m) => {
    const mid = m.user?._id || m.user || m._id;
    return !assignees.some((a) => (a._id || a) === mid);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm grid place-items-center z-[2000] p-4 md:p-10" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-[860px] max-h-[100vh] md:max-h-[90vh] rounded-none md:rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-[modalSlideUp_0.3s_cubic-bezier(0.4,0,0.2,1)]" onMouseDown={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <input 
            className="border-none bg-transparent text-[22px] font-extrabold text-slate-900 px-2 py-1 -ml-2 w-full rounded-md transition-colors duration-150 focus:bg-white focus:shadow-[inset_0_0_0_2px_#2563eb] focus:outline-none" 
            value={draft.title || ""} 
            onChange={(e) => setDraft({ ...draft, title: e.target.value })} 
            placeholder="Card Title"
          />
          <button type="button" className="text-slate-400 hover:text-slate-700 bg-transparent border-none text-xl p-2 cursor-pointer" onClick={onClose}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr] gap-8 md:gap-10">
            <div>
              <div className="mb-8">
                <h4 className="flex items-center gap-2.5 text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                  <svg className="text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>
                  </svg>
                  Description
                </h4>
                <textarea
                  placeholder="Add a more detailed description..."
                  value={draft.description || ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full min-h-[120px] border-none bg-slate-50 p-4 rounded-xl text-sm text-slate-700 focus:bg-slate-100 focus:outline-none resize-y"
                />
              </div>
              
              <div className="mb-8">
                <h4 className="flex items-center gap-2.5 text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                  <svg className="text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Checklist
                </h4>
                <div>
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mb-2.5">
                      <input type="checkbox" className="w-4.5 h-4.5 cursor-pointer accent-blue-600 rounded" checked={Boolean(item.completed)} onChange={(e) => updateChecklist(index, { completed: e.target.checked })} />
                      <input 
                        className="flex-1 border-none bg-transparent px-2.5 py-1.5 rounded-md transition-all duration-200 focus:bg-slate-100 focus:outline-none text-sm text-slate-700"
                        value={item.text || ""} 
                        onChange={(e) => updateChecklist(index, { text: e.target.value })} 
                        placeholder="Task item..."
                      />
                    </div>
                  ))}
                  <button type="button" className="text-sm font-bold text-slate-500 bg-transparent border-none hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded mt-2 cursor-pointer transition-colors" onClick={() => setDraft({ ...draft, checklist: [...checklist, { text: "", completed: false }] })}>
                    + Add an item
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="flex items-center gap-2.5 text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                  <svg className="text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Activity
                </h4>
                <div>
                  {activities.map((a, i) => (
                    <div key={a._id} className="flex gap-3 mb-4 relative">
                      {i !== activities.length - 1 && <div className="absolute left-[15px] top-[32px] bottom-[-16px] w-[2px] bg-slate-100" />}
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-xs font-bold shrink-0 z-10">
                        {(a.user?.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="text-slate-700">
                          <strong className="text-slate-900">{a.user?.name || "Someone"}</strong> {a.details}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-slate-400 text-[13px]">No activity yet.</p>}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 md:p-8 md:border-l border-t md:border-t-0 border-slate-100 -mx-6 md:mx-0">
              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Assignees</span>
                <div>
                  {assignees.map((u) => (
                    <div key={u._id || u} className="flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded-md mb-1.5 shadow-sm">
                      <div className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0 z-10" style={{ background: stringToColor(u._id || u) }}>
                        {(u.name || "U")[0].toUpperCase()}
                      </div>
                      <span className="text-xs flex-1 text-slate-700 font-medium">{u.name || "User"}</span>
                      <button className="bg-transparent border-none p-0 text-slate-400 cursor-pointer min-h-auto hover:text-red-600 text-sm font-bold" onClick={() => removeAssignee(u._id || u)}>✕</button>
                    </div>
                  ))}
                </div>
                {unassigned.length > 0 && (
                  <div className="flex gap-2 mt-2.5">
                    <select className="flex-1 h-8 text-xs border border-slate-200 rounded px-2 bg-white outline-none focus:border-blue-500" value={assigneeSelect} onChange={(e) => setAssigneeSelect(e.target.value)}>
                      <option value="">Add member...</option>
                      {unassigned.map((m) => (
                        <option key={m.user?._id || m.user || m._id} value={m.user?._id || m.user || m._id}>
                          {m.user?.name || m.name}
                        </option>
                      ))}
                    </select>
                    <button className="h-8 px-3 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 border-none cursor-pointer" onClick={addAssignee}>Add</button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Labels</span>
                <input
                  className="w-full h-9 text-[13px] border border-slate-200 rounded px-3 bg-white outline-none focus:border-blue-500"
                  placeholder="e.g. Feature, Bug"
                  value={(draft.labels || []).join(", ")}
                  onChange={(e) => setDraft({ ...draft, labels: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
                />
              </div>

              <div className="mb-6">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Due Date</span>
                <input
                  className="w-full h-9 text-[13px] border border-slate-200 rounded px-3 bg-white outline-none focus:border-blue-500"
                  type="date"
                  value={draft.dueDate ? draft.dueDate.slice(0, 10) : ""}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded hover:bg-slate-200 border-none cursor-pointer" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded hover:bg-blue-700 border-none cursor-pointer shadow-sm" onClick={() => onSave(card._id, draft)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
