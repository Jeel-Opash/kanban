require("dotenv").config({ path: "./src/.env" });
const http = require("http");
const { Server } = require("socket.io");
const connectToDB = require("./src/config/db.js");
const app = require('./src/app.js');
const setupSocket = require("./src/socket.js");

connectToDB();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175")
            .split(",")
            .map((origin) => origin.trim()),
        credentials: true
    },
    pingTimeout: 20000
});

app.set("io", io);
setupSocket(io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
