const mongoose = require("mongoose");
const Activity = require("../models/activitymodel");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeIdArray = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return [];
  return raw.split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
};

const createActivity = async (card, userId, action, details) =>
  Activity.create({ card: card._id, user: userId, action, details });

module.exports = {
  isValidId,
  normalizeIdArray,
  createActivity
};
