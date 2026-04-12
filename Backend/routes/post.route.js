import express from "express";
import {
  createPost,
  getFeedPosts,
  likePost,
  commentPost,
  deletePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.post("/create", protectRoute, createPost);
router.put("/like/:id", protectRoute, likePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/:id", protectRoute, deletePost);

export default router;