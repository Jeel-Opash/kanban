const express = require("express");
const cardRouter = express.Router();

const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const {createCard,getCardsByColumn,getCardById,updateCard,
  moveCard,deleteCard} = require("../controller/cardController");

cardRouter.post("/",auth,asyncHandler(createCard));
cardRouter.get("/column/:columnId",auth,asyncHandler(getCardsByColumn));
cardRouter.get("/:cardId",auth,asyncHandler(getCardById));
cardRouter.patch("/:cardId",auth,asyncHandler(updateCard));
cardRouter.patch("/:cardId/move",auth,asyncHandler(moveCard));
cardRouter.delete("/:cardId",auth,asyncHandler(deleteCard));

module.exports = cardRouter;
