import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://guff-app.vercel.app",
      "https://chat-app-green-pi.vercel.app"
    ],
    credentials: true,
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("callUser", ({ to, signal, from, username }) => {
    io.to(userSocketMap[to]).emit("receiveCall", { signal, from, username });
  });

  socket.on("answerCall", ({ to, signal }) => {
    io.to(userSocketMap[to]).emit("callAccepted", signal);
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    io.to(userSocketMap[to]).emit("iceCandidate", { candidate });
  });

  socket.on("endCall", ({ to }) => {
    io.to(userSocketMap[to]).emit("callEnded");
  });

  // ✅ All inside connection block
  socket.on("typing", ({ to }) => {
    io.to(userSocketMap[to]).emit("typing", { from: userId });
  });

  socket.on("stopTyping", ({ to }) => {
    io.to(userSocketMap[to]).emit("stopTyping", { from: userId });
  });

  socket.on("messageSeen", ({ to }) => {
    io.to(userSocketMap[to]).emit("messageSeen", { from: userId });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };