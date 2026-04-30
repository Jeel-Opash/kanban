import React from "react";
import { BoardIcon } from "../common/Icons";

const BoardItem = ({ board, onClick }) => {
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl cursor-pointer transition-colors hover:border-blue-500 hover:shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
        <BoardIcon />
      </div>
      <span className="font-semibold text-slate-900 flex-1 truncate text-sm">{board.title}</span>
    </div>
  );
};

export default BoardItem;
