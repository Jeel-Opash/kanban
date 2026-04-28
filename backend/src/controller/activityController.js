const Activity = require("../models/activitymodel");
const Card = require("../models/cardmodel");
const asyncHandler = require("../middleware/asyncHandler");

exports.createActivity = asyncHandler(async (req, res) => {
  const { cardId, action, details } = req.body;

  if (!cardId || !action) {
    return res.status(400).json({ message: "cardId and action are required" });
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }

  const activity = await Activity.create({
    card: cardId,
    user: req.user.id,
    action,
    details
  });

  res.status(201).json({
    message: "Activity created",
    activity
  });
});

exports.getCardActivities = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  const activities = await Activity.find({ card: cardId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(activities);
});

exports.deleteActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const activity = await Activity.findByIdAndDelete(activityId);

  if (!activity) {
    return res.status(404).json({ message: "Activity not found" });
  }

  res.json({ message: "Activity deleted" });
});
