import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ✅ Store online users
const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // ✅ Emit online users to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("callUser", ({ to, signal, from, username }) => {
  console.log("📞 callUser event:", { to, from, username });
  console.log("🗺️ userSocketMap:", userSocketMap);
  const receiverSocket = userSocketMap[to];
  console.log("📡 receiver socket:", receiverSocket);
  if (receiverSocket) {
    io.to(receiverSocket).emit("receiveCall", { signal, from, username });
    console.log("✅ receiveCall emitted!");
  } else {
    console.log("❌ receiver not found in map!");
  }
});

  socket.on("answerCall", ({ to, signal }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAccepted", signal);
    }
  });

  socket.on("endCall", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
    }
  });
});

export { app, io, server, getReceiverSocketId };