import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import postRoutes from "./routes/post.route.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Log the path so we can verify
console.log("dirname:", __dirname);
console.log("Frontend dist path:", path.join(__dirname, "../Frontend/dist"));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.1.68:5173",
    "https://dioicous-nonorthodoxly-carl.ngrok-free.dev"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ API routes FIRST — before static files
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../Frontend/dist");
  
  // Serve static files with correct MIME types
  app.use(express.static(frontendDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    }
  }));

  // Only catch non-API routes
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "API not found" });
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    server.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));
  })
  .catch((err) => console.log(err));