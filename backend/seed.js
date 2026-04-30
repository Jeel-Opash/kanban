require("dotenv").config({ path: "./src/.env" });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./src/models/usermodel");
const Workspace = require("./src/models/workspacemodel");
const Board = require("./src/models/boardmodel");
const Column = require("./src/models/columnmodel");
const Card = require("./src/models/cardmodel");
const Activity = require("./src/models/activitymodel");
const { rankForIndex } = require("./src/utils/rank");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  await Promise.all([
    Activity.deleteMany({}),
    Card.deleteMany({}),
    Column.deleteMany({}),
    Board.deleteMany({}),
    Workspace.deleteMany({}),
    User.deleteMany({})
  ]);

  const password = await bcrypt.hash("Password123!", 10);
  const users = await User.create([
    { name: "Ava Owner", email: "owner@example.com", password },
    { name: "Eli Editor", email: "editor@example.com", password },
    { name: "Vera Viewer", email: "viewer@example.com", password }
  ]);

  const workspace = await Workspace.create({
    name: "Demo Workspace",
    owner: users[0]._id,
    members: [
      { user: users[0]._id, role: "Owner" },
      { user: users[1]._id, role: "Editor" },
      { user: users[2]._id, role: "Viewer" }
    ]
  });

  await User.updateMany({ _id: { $in: users.map((user) => user._id) } }, { $push: { workspaces: workspace._id } });

  const board = await Board.create({
    title: "Launch Plan",
    workspace: workspace._id,
    members: users.map((user) => user._id)
  });

  const columns = [];
  for (const title of ["Backlog", "In Progress", "Review", "Done"]) {
    const column = await Column.create({ title, board: board._id, order: rankForIndex(columns, columns.length) });
    columns.push(column);
  }
  board.columns = columns.map((column) => column._id);
  await board.save();

  const samples = [
    ["Backlog", "Invite member flow", "Owners can invite by email and assign roles.", ["auth"], 0],
    ["Backlog", "Search filters", "Filter by label, assignee, and due date.", ["ux"], 2],
    ["In Progress", "Realtime card moves", "Socket.IO rooms broadcast move events under 500ms.", ["realtime"], 1],
    ["Review", "Conflict rejection", "Reject stale writes using the card version field.", ["api"], 4],
    ["Done", "JWT authentication", "Register, login, and protected routes.", ["auth"], -1]
  ];

  for (const [columnTitle, title, description, labels, dueOffset] of samples) {
    const column = columns.find((item) => item.title === columnTitle);
    const siblings = await Card.find({ column: column._id }).sort({ order: 1 }).lean();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueOffset);
    const card = await Card.create({
      title,
      description,
      labels,
      dueDate,
      assignees: [users[1]._id],
      checklist: [{ text: "Verify reviewer path", completed: columnTitle === "Done" }],
      column: column._id,
      order: rankForIndex(siblings, siblings.length)
    });
    column.cardIds.push(card._id);
    await column.save();
    await Activity.create({ card: card._id, user: users[0]._id, action: "CARD_CREATED", details: `${title} created` });
  }

  console.log("Seed complete");
  console.log("owner@example.com / Password123!");
  console.log("editor@example.com / Password123!");
  console.log("viewer@example.com / Password123!");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
