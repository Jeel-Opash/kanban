const Column = require("../models/columnmodel");
const Board = require("../models/boardmodel");
const Card = require("../models/cardmodel");
const Activity = require("../models/activitymodel");
const asyncHandler = require("../middleware/asyncHandler");
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

  const column = await Column.create({ title, board: boardId, order });
  board.columns.push(column._id);
  await board.save();
  res.status(201).json({ message: "Column created", column });
});

exports.getColumnsByBoard = asyncHandler(async (req, res) => {
  const columns = await Column.find({ board: req.params.boardId })
    .populate("cardIds")
    .sort({ createdAt: 1 });
  res.json(columns);
});

exports.getColumnById = asyncHandler(async (req, res) => {
  const column = await Column.findById(req.params.columnId).populate("cardIds");
  if (!column) return res.status(404).json({ message: "Column not found" });
  res.json(column);
});

exports.updateColumn = asyncHandler(async (req, res) => {
  const updates = pick(req.body, ["title", "order"]);
  const column = await Column.findByIdAndUpdate(req.params.columnId, updates, { new: true });
  if (!column) return res.status(404).json({ message: "Column not found" });

  res.json({ message: "Column updated", column });
});

exports.deleteColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  const column = await Column.findById(columnId);
  if (!column) return res.status(404).json({ message: "Column not found" });

  await Board.findByIdAndUpdate(column.board, { $pull: { columns: column._id } });

  const cards = await Card.find({ column: column._id }).select("_id");
  const cardIds = cards.map((c) => c._id);

  await Activity.deleteMany({ card: { $in: cardIds } });
  await Card.deleteMany({ column: column._id });
  await Column.findByIdAndDelete(column._id);
  res.json({ message: "Column deleted" });
});
