const Board = require("../models/boardmodel");
const Workspace = require("../models/workspacemodel");
const asyncHandler = require("../middleware/asyncHandler");


exports.createBoard = asyncHandler(async (req,res)=>{
    const {title,workspaceId} = req.body;
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
    const boards = await Board.find({
        workspace:workspaceId
    })
    .populate("members","name email");
    res.json(boards);
});



exports.getBoardById = asyncHandler(async (req,res)=>{
    const board = await Board.findById(req.params.boardId)
    .populate("columns")
    .populate("members","name email");
   if(!board){
        return res.status(404).json({message:"Board not found"});
    }
    res.json(board);
});



exports.deleteBoard = asyncHandler(async (req,res)=>{
    const {boardId} = req.params;
    await Board.findByIdAndDelete(boardId);
    res.json({
        message:"Board deleted"
    });
});
