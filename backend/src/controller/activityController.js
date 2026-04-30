const mongoose = require("mongoose");
const Activity = require("../models/activitymodel.js");
const Card = require("../models/cardmodel.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const { deny, requireCardRole } = require("../utils/permissions.js");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateActivity = (query) =>
  query.populate("card", "title").populate("user", "name email");

exports.createActivity = asyncHandler(async (req, res) => {
  const { cardId, action, details } = req.body;

  if (!cardId || !action) {
    return res.status(400).json({ message: "cardId and action are required" });
  }
  if (!isValidId(cardId)) {
    return res.status(400).json({ message: "Invalid cardId" });
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }
  const access = await requireCardRole(cardId, req.user.id, "Editor");
  if (access.status) return deny(res, access);

  const activity = await Activity.create({
    card: cardId,
    user: req.user.id,
    action,
    details: details || ""
  });

  const populatedActivity = await populateActivity(
    Activity.findById(activity._id)
  );

  res.status(201).json({
    message: "Activity created",
    activity: populatedActivity
  });
});


exports.getActivities = asyncHandler(async (req, res) => {
  const activities = await populateActivity(Activity.find()).sort({
    createdAt: -1
  });

  res.json(activities);
});

exports.getActivitiesByCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  if (!isValidId(cardId)) return res.status(400).json({ message: "Invalid cardId" });
  const access = await requireCardRole(cardId, req.user.id, "Viewer");
  if (access.status) return deny(res, access);
  const activities = await populateActivity(Activity.find({ card: cardId })).sort({ createdAt: -1 });
  res.json(activities);
});



exports.getActivityById = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  if (!isValidId(activityId)) {
    return res.status(400).json({ message: "Invalid activityId" });
  }

  const activity = await populateActivity(Activity.findById(activityId));
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }
  const access = await requireCardRole(activity.card._id, req.user.id, "Viewer");
  if (access.status) return deny(res, access);

  res.json(activity);
});

exports.deleteActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  if (!isValidId(activityId)) {
    return res.status(400).json({ message: "Invalid activityId" });
  }

  const activity = await Activity.findByIdAndDelete(activityId);
  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }

  res.json({ message: "Activity deleted" });
});
