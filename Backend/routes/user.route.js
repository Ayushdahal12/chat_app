import express from "express";
import { getMe, updateInterests, updateProfile, getSuggestedUsers } from "../controllers/user.controller.js";
import { deleteUserAndPosts } from "../controllers/deleteUserAndPosts.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.put("/update-interests", protectRoute, updateInterests);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);


// Route to delete user and all their posts
router.delete("/delete", protectRoute, deleteUserAndPosts);

export default router;