const express = require("express");
const columnRouter = express.Router();

const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const {
  createColumn,
  getColumnsByBoard,
  getColumnById,
  updateColumn,
  deleteColumn
} = require("../controller/columnController");

columnRouter.post("/", auth, asyncHandler(createColumn));
columnRouter.get("/board/:boardId", auth, asyncHandler(getColumnsByBoard));
columnRouter.get("/:columnId", auth, asyncHandler(getColumnById));
columnRouter.patch("/:columnId", auth, asyncHandler(updateColumn));
columnRouter.delete("/:columnId", auth, asyncHandler(deleteColumn));

module.exports = columnRouter;
