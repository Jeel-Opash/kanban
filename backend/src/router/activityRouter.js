const express = require("express");
const activityRouter = express.Router();

const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const {createActivity,getCardActivities,deleteActivity
} = require("../controller/activityController");

activityRouter.post("/", auth, asyncHandler(createActivity));
activityRouter.get("/card/:cardId", auth, asyncHandler(getCardActivities));
activityRouter.delete("/:activityId", auth, asyncHandler(deleteActivity));

module.exports = activityRouter;
