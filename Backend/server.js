import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import postRoutes from "./routes/post.route.js";

const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://guff.ayushdahal.info.np",
    process.env.FRONTEND_URL || "https://guff.ayushdahal.info.np"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
}));

// ✅ Handle preflight
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ✅ Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} ✅`);
    });
  })
  .catch((err) => console.log("MongoDB error:", err));