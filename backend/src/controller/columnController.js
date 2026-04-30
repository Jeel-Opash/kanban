const Column = require("../models/columnmodel");
const Board = require("../models/boardmodel");
const Card = require("../models/cardmodel");
const Activity = require("../models/activitymodel");
const asyncHandler = require("../middleware/asyncHandler");
const { deny, requireBoardRole, requireColumnRole } = require("../utils/permissions");
const { rankForIndex } = require("../utils/rank");
const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k)) acc[k] = obj[k];
    return acc;
  }, {});

exports.createColumn = asyncHandler(async (req, res) => {
  const { title, boardId, order } = req.body;
  if (!title || !boardId)
    return res.status(400).json({ message: "title and boardId are required" });

  const board = await Board.findById(boardId);
  if (!board) return res.status(404).json({ message: "Board not found" });
  const access = await requireBoardRole(boardId, req.user.id, "Editor");
  if (access.status) return deny(res, access);

  const siblings = await Column.find({ board: boardId }).sort({ order: 1, createdAt: 1 }).lean();
  const column = await Column.create({ title, board: boardId, order: order || rankForIndex(siblings, siblings.length) });
  board.columns.push(column._id);
  await board.save();
  res.status(201).json({ message: "Column created", column });
});

exports.getColumnsByBoard = asyncHandler(async (req, res) => {
  const access = await requireBoardRole(req.params.boardId, req.user.id, "Viewer");
  if (access.status) return deny(res, access);
  const columns = await Column.find({ board: req.params.boardId })
    .populate("cardIds")
    .sort({ order: 1, createdAt: 1 });
  res.json(columns);
});

exports.getColumnById = asyncHandler(async (req, res) => {
  const column = await Column.findById(req.params.columnId).populate("cardIds");
  if (!column) return res.status(404).json({ message: "Column not found" });
  const access = await requireColumnRole(req.params.columnId, req.user.id, "Viewer");
  if (access.status) return deny(res, access);
  res.json(column);
});

exports.updateColumn = asyncHandler(async (req, res) => {
  const updates = pick(req.body, ["title", "order"]);
  const access = await requireColumnRole(req.params.columnId, req.user.id, "Editor");
  if (access.status) return deny(res, access);
  const column = await Column.findByIdAndUpdate(req.params.columnId, updates, { new: true });
  if (!column) return res.status(404).json({ message: "Column not found" });

  res.json({ message: "Column updated", column });
});

exports.deleteColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  const column = await Column.findById(columnId);
  if (!column) return res.status(404).json({ message: "Column not found" });
  const access = await requireColumnRole(columnId, req.user.id, "Editor");
  if (access.status) return deny(res, access);

  await Board.findByIdAndUpdate(column.board, { $pull: { columns: column._id } });

  const cards = await Card.find({ column: column._id }).select("_id");
  const cardIds = cards.map((c) => c._id);

  await Activity.deleteMany({ card: { $in: cardIds } });
  await Card.deleteMany({ column: column._id });
  await Column.findByIdAndDelete(column._id);
  res.json({ message: "Column deleted" });
});
