const Card = require("../models/cardmodel");
const Column = require("../models/columnmodel");
const Activity = require("../models/activitymodel");
const asyncHandler = require("../middleware/asyncHandler");
const { rankForIndex } = require("../utils/rank");
const { deny, requireColumnRole, requireCardRole } = require("../utils/permissions");
const { isValidId, normalizeIdArray, createActivity } = require("../utils/controllerHelper");

const populatedCard = (query) => query.populate("assignees", "name email avatar");

exports.createCard = asyncHandler(async (req, res) => {
  const { title, description, columnId, labels, assignees, dueDate, checklist, order } = req.body;
  if (!title || !columnId || !isValidId(columnId)) 
    return res.status(400).json({ message: "Invalid title or columnId" });

  const access = await requireColumnRole(columnId, req.user.id, "Editor");
  if (access.status) return deny(res, access);

  const normalizedAssignees = normalizeIdArray(assignees);
  if (!normalizedAssignees) return res.status(400).json({ message: "Invalid assignees" });

  const siblings = await Card.find({ column: columnId }).sort({ order: 1 }).lean();
  const card = await Card.create({
    title,
    description: description || "",
    column: columnId,
    labels: labels || [],
    assignees: normalizedAssignees,
    dueDate,
    checklist: checklist || [],
    order: order || rankForIndex(siblings, siblings.length)
  });

  await Column.findByIdAndUpdate(columnId, { $push: { cardIds: card._id } });
  await createActivity(card, req.user.id, "CARD_CREATED", `${card.title} created`);

  const nextCard = await populatedCard(Card.findById(card._id));
  req.app.get("io")?.to(`board:${access.board._id}`).emit("card:created", { card: nextCard });
  res.status(201).json({ message: "Card created", card: nextCard });
});

exports.getCardsByColumn = asyncHandler(async (req, res) => {
  const { columnId } = req.params;
  if (!isValidId(columnId)) return res.status(400).json({ message: "Invalid columnId" });
  const access = await requireColumnRole(columnId, req.user.id, "Viewer");
  if (access.status) return deny(res, access);

  const cards = await populatedCard(Card.find({ column: columnId })).sort({ order: 1 });
  res.json(cards);
});

exports.getCardById = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  if (!isValidId(cardId)) return res.status(400).json({ message: "Invalid cardId" });
  const access = await requireCardRole(cardId, req.user.id, "Viewer");
  if (access.status) return deny(res, access);
  res.json(await populatedCard(Card.findById(cardId)));
});

exports.updateCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  if (!isValidId(cardId)) return res.status(400).json({ message: "Invalid cardId" });
  const access = await requireCardRole(cardId, req.user.id, "Owner");
  if (access.status) return deny(res, access);

  const expectedVersion = Number(req.body.version);
  if (expectedVersion && expectedVersion !== access.card.version)
    return res.status(409).json({ message: "Stale card version", card: access.card });

  const allowedFields = ["title", "description", "labels", "assignees", "dueDate", "checklist", "order"];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (updates.assignees !== undefined) {
    const normalized = normalizeIdArray(updates.assignees);
    if (!normalized) return res.status(400).json({ message: "Invalid assignees" });
    updates.assignees = normalized;
  }

  updates.version = access.card.version + 1;
  const card = await populatedCard(Card.findByIdAndUpdate(cardId, updates, { new: true }));
  await createActivity(card, req.user.id, "CARD_UPDATED", `${card.title} updated`);
  req.app.get("io")?.to(`board:${access.board._id}`).emit("card:updated", { card });
  res.json({ message: "Card updated", card });
});

exports.moveCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { targetColumnId, targetIndex, version } = req.body;
  if (!targetColumnId || !isValidId(cardId) || !isValidId(targetColumnId)) 
    return res.status(400).json({ message: "Missing or invalid IDs" });

  const access = await requireCardRole(cardId, req.user.id, "Editor");
  if (access.status) return deny(res, access);
  if (Number(version) && Number(version) !== access.card.version)
    return res.status(409).json({ message: "Stale card version", card: access.card });

  const targetAccess = await requireColumnRole(targetColumnId, req.user.id, "Editor");
  if (targetAccess.status) return deny(res, targetAccess);

  const sourceColumnId = access.card.column.toString();
  
  // Update Column pointers
  if (sourceColumnId !== targetColumnId) {
    await Column.findByIdAndUpdate(sourceColumnId, { $pull: { cardIds: cardId } });
    await Column.findByIdAndUpdate(targetColumnId, { 
      $push: { cardIds: { $each: [cardId], $position: targetIndex || 0 } } 
    });
  } else {
    const col = await Column.findById(targetColumnId);
    col.cardIds = col.cardIds.filter(id => id.toString() !== cardId);
    col.cardIds.splice(targetIndex || 0, 0, cardId);
    await col.save();
  }

  // Update Card metadata
  const siblings = await Card.find({ column: targetColumnId, _id: { $ne: cardId } }).sort({ order: 1 }).lean();
  access.card.column = targetColumnId;
  access.card.order = rankForIndex(siblings, targetIndex || 0);
  access.card.version += 1;
  await access.card.save();

  await createActivity(access.card, req.user.id, "CARD_MOVED", `${access.card.title} moved`);
  const card = await populatedCard(Card.findById(cardId));
  
  req.app.get("io")?.to(`board:${access.board._id}`).emit("card:moved", {
    card, sourceColumnId, targetColumnId, targetIndex: targetIndex || 0
  });
  res.json({ message: "Card moved", card });
});

exports.deleteCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  if (!isValidId(cardId)) return res.status(400).json({ message: "Invalid cardId" });
  const access = await requireCardRole(cardId, req.user.id, "Editor");
  if (access.status) return deny(res, access);

  await Column.findByIdAndUpdate(access.card.column, { $pull: { cardIds: access.card._id } });
  await Activity.deleteMany({ card: access.card._id });
  await Card.findByIdAndDelete(access.card._id);
  req.app.get("io")?.to(`board:${access.board._id}`).emit("card:deleted", { cardId });
  res.json({ message: "Card deleted" });
});
