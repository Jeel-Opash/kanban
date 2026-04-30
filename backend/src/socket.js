const jwt = require("jsonwebtoken");
const User = require("./models/usermodel");
const { requireBoardRole } = require("./utils/permissions");

const usersByBoard = new Map();

const serializePresence = (boardId) =>
  [...(usersByBoard.get(boardId) || new Map()).values()];

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name email avatar");
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("board:join", async ({ boardId }, ack) => {
      const access = await requireBoardRole(boardId, socket.user._id, "Viewer");
      if (access.status) {
        ack?.({ ok: false, message: access.message });
        return;
      }
      socket.join(`board:${boardId}`);
      socket.boardId = boardId;
      if (!usersByBoard.has(boardId)) usersByBoard.set(boardId, new Map());
      usersByBoard.get(boardId).set(socket.id, {
        id: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar
      });
      io.to(`board:${boardId}`).emit("presence:update", { users: serializePresence(boardId) });
      ack?.({ ok: true, role: access.role });
    });

    socket.on("cursor:move", ({ boardId, x, y }) => {
      socket.to(`board:${boardId}`).emit("cursor:move", {
        user: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        x,
        y
      });
    });

    socket.on("disconnect", () => {
      const { boardId } = socket;
      if (!boardId || !usersByBoard.has(boardId)) return;
      usersByBoard.get(boardId).delete(socket.id);
      io.to(`board:${boardId}`).emit("presence:update", { users: serializePresence(boardId) });
    });
  });
};

module.exports = setupSocket;
