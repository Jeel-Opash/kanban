import React from "react";

const MemberItem = ({ member }) => {
  const name = member.user?.name || "User";
  const initials = name[0].toUpperCase();

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-xs font-bold shrink-0">
        {initials}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold text-slate-900 truncate">{name}</span>
        <span className="text-[11px] text-slate-500">{member.role}</span>
      </div>
    </div>
  );
};

export default MemberItem;
