const Board = require("../models/boardmodel");
const Column = require("../models/columnmodel");
const Card = require("../models/cardmodel");
const Workspace = require("../models/workspacemodel");

const roleWeight = { Viewer: 1, Editor: 2, Owner: 3 };

const getWorkspaceRole = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return { status: 404, message: "Workspace not found" };
  const member = workspace.members.find((entry) => entry.user.toString() === userId.toString());
  if (!member) return { status: 403, message: "Workspace access denied" };
  return { workspace, role: member.role };
};

const requireWorkspaceRole = async (workspaceId, userId, minimumRole = "Viewer") => {
  const result = await getWorkspaceRole(workspaceId, userId);
  if (!result.role) return result;
  if (roleWeight[result.role] < roleWeight[minimumRole]) {
    return { status: 403, message: `${minimumRole} role required` };
  }
  return result;
};

const requireBoardRole = async (boardId, userId, minimumRole = "Viewer") => {
  const board = await Board.findById(boardId);
  if (!board) return { status: 404, message: "Board not found" };
  const result = await requireWorkspaceRole(board.workspace, userId, minimumRole);
  if (result.status) return result;
  return { ...result, board };
};

const requireColumnRole = async (columnId, userId, minimumRole = "Viewer") => {
  const column = await Column.findById(columnId);
  if (!column) return { status: 404, message: "Column not found" };
  const result = await requireBoardRole(column.board, userId, minimumRole);
  if (result.status) return result;
  return { ...result, column };
};

const requireCardRole = async (cardId, userId, minimumRole = "Viewer") => {
  const card = await Card.findById(cardId);
  if (!card) return { status: 404, message: "Card not found" };
  const result = await requireColumnRole(card.column, userId, minimumRole);
  if (result.status) return result;
  return { ...result, card };
};

const deny = (res, result) => res.status(result.status).json({ message: result.message });

module.exports = {
  deny,
  requireWorkspaceRole,
  requireBoardRole,
  requireColumnRole,
  requireCardRole
};
