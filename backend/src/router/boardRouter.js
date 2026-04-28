const express = require("express");
const Board = express.Router();

const {createBoard,getBoards,getBoardById,deleteBoard} = require("../controller/boardController.js");

const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

Board.post("/",auth,asyncHandler(createBoard));
Board.get("/:workspaceId",auth,asyncHandler(getBoards));
Board.get("/single/:boardId",auth,asyncHandler(getBoardById));
Board.delete("/:boardId",auth,asyncHandler(deleteBoard));

module.exports = Board;
