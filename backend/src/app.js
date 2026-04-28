const express = require('express');
const cors = require("cors");
const userRouter = require('./router/userRouter.js');
const workSpace = require('./router/workspaceRouter.js');
const Board = require('./router/boardRouter.js');
const cardRouter = require('./router/cardRouter.js');
const columnRouter = require('./router/columnRouter.js');

const app = express();
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/ws", workSpace);
app.use("/api/board", Board);
app.use("/api/card", cardRouter);
app.use("/api/column", columnRouter);


module.exports = app;


