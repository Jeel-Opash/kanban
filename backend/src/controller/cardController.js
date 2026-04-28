const Card = require("../models/cardmodel");
const Column = require("../models/columnmodel");
const Activity = require("../models/activitymodel");
const asyncHandler = require("../middleware/asyncHandler");
const mongoose = require("mongoose");
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const normalizeIdArray = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
  }
  return [raw.replace(/^['"]|['"]$/g, "")];
};
 
exports.createCard = asyncHandler(async (req, res) => {
    const{title,description,columnId,labels,assignees,
      dueDate,checklist,order} = req.body;

    if (!title || !columnId) {
      return res.status(400).json({
        message: "title and columnId are required"
      });
    }
    if (!isValidId(columnId)) {
      return res.status(400).json({ message: "Invalid columnId" });
    }
    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }
    const normalizedAssignees = normalizeIdArray(assignees);
    if (!normalizedAssignees || normalizedAssignees.some((id) => !isValidId(id))) {
      return res.status(400).json({ message: "Invalid assignees: use Mongo ObjectId values" });
    }

    const card = await Card.create({
      title,description: description || "",
      column: columnId,
      labels: labels || [],
      assignees: normalizedAssignees,dueDate,
      checklist: checklist || [],order
    });

    column.cardIds.push(card._id);
    await column.save();

    await Activity.create({
      card: card._id,user: req.user?.id,
      action: "CARD_CREATED",details: `${card.title} created`});

    res.status(201).json({
      message: "Card created",
      card
    });
});

exports.getCardsByColumn = asyncHandler(async (req, res) => {
    const { columnId } = req.params;
    if (!isValidId(columnId)) {
      return res.status(400).json({ message: "Invalid columnId" });
    }

    const cards = await Card.find({ column: columnId })
      .populate("assignees", "name email")
      .sort({ createdAt: 1 });

    res.json(cards);
});

exports.getCardById = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.cardId)) {
      return res.status(400).json({ message: "Invalid cardId" });
    }
    const card = await Card.findById(req.params.cardId).populate(
      "assignees",
      "name email"
    );

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.json(card);
});

exports.updateCard = asyncHandler(async (req, res) => {
    if (!isValidId(req.params.cardId)) {
      return res.status(400).json({ message: "Invalid cardId" });
    }
    const allowedFields = [
      "title","description","labels","assignees","dueDate",
      "checklist","order"];

    const updates = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });
    if (Object.prototype.hasOwnProperty.call(updates, "assignees")) {
      const normalizedAssignees = normalizeIdArray(updates.assignees);
      if (!normalizedAssignees || normalizedAssignees.some((id) => !isValidId(id))) {
        return res.status(400).json({ message: "Invalid assignees: use Mongo ObjectId values" });
      }
      updates.assignees = normalizedAssignees;
    }

    const card = await Card.findByIdAndUpdate(req.params.cardId, updates, {
      new: true
    }).populate("assignees", "name email");

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    await Activity.create({
      card: card._id,
      user: req.user?.id,
      action: "CARD_UPDATED",
      details: `${card.title} updated`
    });

    res.json({
      message: "Card updated",card});
});

exports.moveCard = asyncHandler(async (req, res) => {
    const { cardId } = req.params;
    const { targetColumnId, targetIndex } = req.body;

    if (!targetColumnId) {
      return res.status(400).json({ message: "targetColumnId is required" });
    }
    if (!isValidId(cardId)) {
      return res.status(400).json({ message: "Invalid cardId" });
    }
    if (!isValidId(targetColumnId)) {
      return res.status(400).json({ message: "Invalid targetColumnId" });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    const sourceColumn = await Column.findById(card.column);
    const targetColumn = await Column.findById(targetColumnId);
    if (!targetColumn) {
      return res.status(404).json({ message: "Target column not found" });
    }

    if (sourceColumn) {
      sourceColumn.cardIds = sourceColumn.cardIds.filter(
        (id) => id.toString() !== cardId
      );
      await sourceColumn.save();
    }

    const insertIndex =
      typeof targetIndex === "number" && targetIndex >= 0
        ? targetIndex
        : targetColumn.cardIds.length;

    targetColumn.cardIds.splice(insertIndex, 0, card._id);
    await targetColumn.save();

    card.column = targetColumnId;
    await card.save();

    await Activity.create({
      card: card._id,
      user: req.user?.id,
      action: "CARD_MOVED",
      details: `${card.title} moved`
    });

    res.json({
      message: "Card moved",
      card
    });
});

exports.deleteCard = asyncHandler(async (req, res) => {
    const { cardId } = req.params;
    if (!isValidId(cardId)) {
      return res.status(400).json({ message: "Invalid cardId" });
    }
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    await Column.findByIdAndUpdate(card.column, {
      $pull: { cardIds: card._id }
    });
    await Activity.deleteMany({ card: card._id });
    await Card.findByIdAndDelete(card._id);

    res.json({
      message: "Card deleted"
    });
});
