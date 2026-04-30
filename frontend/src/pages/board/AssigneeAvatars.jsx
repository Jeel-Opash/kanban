import { stringToColor } from "./utils";

export default function AssigneeAvatars({ assignees = [] }) {
  if (!assignees.length) return null;
  return (
    <div className="flex items-center">
      {assignees.slice(0, 3).map((user) => (
        <span
          key={user._id || user}
          className="w-6 h-6 rounded-full border-2 border-white -ml-2 grid place-items-center text-white text-[10px] font-extrabold shadow-sm first:ml-0"
          title={user.name || "User"}
          style={{ background: stringToColor(user._id || user) }}
        >
          {(user.name || "U")[0].toUpperCase()}
        </span>
      ))}
      {assignees.length > 3 && (
        <span className="w-6 h-6 rounded-full border-2 border-white -ml-2 grid place-items-center text-white text-[10px] font-extrabold shadow-sm bg-slate-400">
          +{assignees.length - 3}
        </span>
      )}
    </div>
  );
}
