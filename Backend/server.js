import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  credentials: false
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ message: "Server is working!" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT} `));
  })
  .catch((err) => console.log(err));