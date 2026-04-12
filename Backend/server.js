import path from "path";
import { fileURLToPath } from "url";

// ✅ STEP 1 — Set __dirname FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ STEP 2 — Load .env with EXACT path SECOND
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, ".env") });

// ✅ STEP 3 — Now import everything else
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import postRoutes from "./routes/post.route.js";

const PORT = process.env.PORT || 8080;
const frontendDist = path.join(__dirname, "../Frontend/dist");

console.log("✅ MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "❌ MISSING");
console.log("✅ Frontend path:", frontendDist);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "https://guff-app.vercel.app",
    "https://chat-app-green-pi.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// ✅ Handle preflight requests
app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
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

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API not found" });
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} ✅`);
    });
  })
  .catch((err) => console.log("MongoDB error:", err));