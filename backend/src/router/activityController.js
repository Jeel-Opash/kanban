const express = require("express");
const activityRouter = express.Router();

const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler.js");
const { createActivity, getActivities,getActivityById,
deleteActivity } = require("../controller/activityController.js");

activityRouter.get("/", auth, asyncHandler(getActivities));

activityRouter.post("/",auth,asyncHandler(createActivity));
activityRouter.get("/:activityId",auth,asyncHandler(getActivityById));
activityRouter.delete("/:activityId",auth,asyncHandler(deleteActivity));

module.exports = activityRouter;
