import { FolderIcon } from "../common/Icons";

const WorkspaceCard = ({ ws, isActive, onSelect, boardCount }) => {
  return (
    <button onClick={() => onSelect(ws._id)}
      className={`flex flex-col gap-4 rounded-2xl p-6 text-left min-h-[200px] cursor-pointer transition-all duration-200 border-none
        ${isActive
          ? "bg-[#c9d7f9] ]"
          : "bg-[#3b6fea] "
        }`}>
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl bg-white/20 text-black grid place-items-center">
          <FolderIcon />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-green-500 text-white">
          Active
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-extrabold text-black mb-1.5">{ws.name}</h3>

      </div>
      <div className="flex gap-6 pt-4 border-t border-white/20">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-extrabold text-black">{boardCount}</span>
          <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Boards</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-extrabold text-black">{ws.members?.length || 1}</span>
          <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Members</span>
        </div>
      </div>
    </button>
  );
};

export default WorkspaceCard;
