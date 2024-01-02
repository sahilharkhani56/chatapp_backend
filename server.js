import express from "express";
import cors from "cors";
import http, { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import connect from "./Database/conn.js";
import router from "./Router/Route.js";
import dotenv from 'dotenv'
dotenv.config()
const app = express();
const PORT = process.env.PORT||8080;
// const io = new Server(server);
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");

connect();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["PUT", "POST", "DELETE", "GET"],
    credentials: true,
  },
});
let activeUsers = {};
let socketIdToUserId={};
io.on("connection", (socket) => {
  console.log(`${socket.id} client connected`);
  socket.on("newUser", (userId) => {
    if (activeUsers[userId] === undefined) {
      activeUsers[userId] = [];
    }
    activeUsers[userId].push(socket.id);
    socketIdToUserId[socket.id] = userId;
    // console.log(activeUsers);
    io.emit("activeUserResponse", Object.keys(activeUsers));
  });

  socket.on("newMessage", (data) => {
    if (activeUsers[data]) {
      for (var i = 0; i < activeUsers[data].length; i++) {
        io.to(activeUsers[data][i]).emit("messageResponse", data);
      }
    }
  });
  socket.on("disconnect", () => {
    const userId = socketIdToUserId[socket.id];
    if (activeUsers[userId]) {
      activeUsers[userId] = activeUsers[userId].filter((id) => id !== socket.id);
      if (activeUsers[userId].length === 0) {
        delete activeUsers[userId];
      }
    }
    // console.log(activeUsers);
    console.log(" A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.status(201).json("Home get Request");
});
app.use("/api", router);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
