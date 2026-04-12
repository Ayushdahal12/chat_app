import express from "express";
import { getMessages, sendMessage, markSeen, reactToMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/seen/:id", protectRoute, markSeen);
router.put("/react/:id", protectRoute, reactToMessage);

export default router;