const express = require('express');
const cors = require("cors");
const userRouter = require('./router/userRouter.js');
const workSpace = require('./router/workspaceRouter.js');
const Board = require('./router/boardRouter.js');
const cardRouter = require('./router/cardRouter.js');
const columnRouter = require('./router/columnRouter.js');
const activityRouter = require('./router/activityRouter.js');

const app = express();
app.use(express.json());
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175")
  .split(",")
  .map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/users", userRouter);
app.use("/api/ws", workSpace);
app.use("/api/board", Board);
app.use("/api/card", cardRouter);
app.use("/api/column", columnRouter);
app.use("/api/activity", activityRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

module.exports = app;
