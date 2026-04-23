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
  pingTimeout: 120000,  // ✅ Increased to 120s to prevent false disconnects
  pingInterval: 25000,  // ✅ Increased frequency for better stability (25s)
  maxHttpBufferSize: 5e6,  // ✅ 5MB for large WebRTC offers/answers
  serveClient: false,
  allowUpgrades: true,
  cookie: false,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// ✅ Store online users — userId: socketId
const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("✅ Mapped userId:", userId, "→ socketId:", socket.id);
  }

  // ✅ Emit online users to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // ✅ CALL USER — caller sends offer to receiver
  socket.on("callUser", ({ to, signal, from, username }) => {
    console.log("📞 callUser:", { to, from, username });
    console.log("🗺️ userSocketMap:", userSocketMap);
    const receiverSocketId = userSocketMap[to];
    console.log("📡 receiver socket:", receiverSocketId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveCall", {
        signal,
        from,       // ← caller's USER ID
        username,
      });
      console.log("✅ receiveCall emitted to:", receiverSocketId);
    } else {
      console.log("❌ receiver not found!");
    }
  });

  // ✅ ANSWER CALL — receiver sends answer back to CALLER
  // "to" here is the CALLER's USER ID
  socket.on("answerCall", ({ to, signal }) => {
    console.log("✅ answerCall — sending to caller userId:", to);
    // ✅ Look up caller's SOCKET ID from their USER ID
    const callerSocketId = userSocketMap[to];
    console.log("📡 caller socket:", callerSocketId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", signal);
      console.log("✅ callAccepted emitted to caller!");
    } else {
      console.log("❌ caller socket not found!");
    }
  });

  // ✅ ICE CANDIDATE — relay between peers
  socket.on("iceCandidate", ({ to, candidate }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("iceCandidate", { candidate });
    }
  });

  // ✅ END CALL
  socket.on("endCall", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
    }
  });

  // ✅ Toggle video/audio notification
  socket.on("toggleVideo", ({ to, enabled }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("remoteVideoToggle", { enabled });
    }
  });

  socket.on("toggleAudio", ({ to, enabled }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("remoteAudioToggle", { enabled });
    }
  });
});

export { app, io, server, getReceiverSocketId };