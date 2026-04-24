import express from "express";
import {
  createPost,
  getFeedPosts,
  likePost,
  commentPost,
  deletePost,
  getDeletedPosts,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.get("/admin/deleted", protectRoute, getDeletedPosts);
router.post("/create", protectRoute, createPost);
router.put("/like/:id", protectRoute, likePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/:id", protectRoute, deletePost);

export default router;