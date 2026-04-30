const Board = require("../models/boardmodel");
const Workspace = require("../models/workspacemodel");
const Column = require("../models/columnmodel");
const Card = require("../models/cardmodel");
const asyncHandler = require("../middleware/asyncHandler");
const { deny, requireWorkspaceRole, requireBoardRole } = require("../utils/permissions");


exports.createBoard = asyncHandler(async (req,res)=>{
    const {title,workspaceId} = req.body;
    const access = await requireWorkspaceRole(workspaceId, req.user.id, "Editor");
    if (access.status) return deny(res, access);
    const board = await Board.create({
        title,
        workspace:workspaceId,
        members:[req.user.id]
    });

    res.status(201).json({
        message:"Board created",
        board
    });
});



exports.getBoards = asyncHandler(async (req,res)=>{
    const {workspaceId} = req.params;
    const access = await requireWorkspaceRole(workspaceId, req.user.id, "Viewer");
    if (access.status) return deny(res, access);
    const boards = await Board.find({
        workspace:workspaceId
    })
    .populate("members","name email");
    res.json(boards);
});



exports.getBoardById = asyncHandler(async (req,res)=>{
    const access = await requireBoardRole(req.params.boardId, req.user.id, "Viewer");
    if (access.status) return deny(res, access);
    const board = await Board.findById(req.params.boardId)
    .populate("members","name email");
   if(!board){
        return res.status(404).json({message:"Board not found"});
    }
    const workspace = await Workspace.findById(board.workspace)
      .populate("members.user", "name email avatar");
    const workspaceMembers = (workspace?.members || []).map((m) => ({
      _id: m.user._id,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      role: m.role
    }));
    const columns = await Column.find({ board: board._id }).sort({ order: 1, createdAt: 1 }).lean();
    const cards = await Card.find({ column: { $in: columns.map((column) => column._id) } })
      .populate("assignees", "name email avatar")
      .sort({ order: 1, createdAt: 1 })
      .lean();
    const cardsByColumn = cards.reduce((acc, card) => {
      const key = card.column.toString();
      acc[key] = acc[key] || [];
      acc[key].push(card);
      return acc;
    }, {});
    res.json({
      ...board.toObject(),
      role: access.role,
      workspaceMembers,
      columns: columns.map((column) => ({ ...column, cards: cardsByColumn[column._id.toString()] || [] }))
    });
});



exports.deleteBoard = asyncHandler(async (req,res)=>{
    const {boardId} = req.params;
    const access = await requireBoardRole(boardId, req.user.id, "Owner");
    if (access.status) return deny(res, access);
    await Board.findByIdAndDelete(boardId);
    res.json({
        message:"Board deleted"
    });
});
