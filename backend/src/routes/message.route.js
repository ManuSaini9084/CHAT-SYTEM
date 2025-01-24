import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import { acceptRateCard, declineRateCard, notifySender } from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/:id/accept", protectRoute, acceptRateCard);

router.post("/:id/decline", protectRoute, declineRateCard);
router.post("/:id/notify", protectRoute, notifySender);

export default router;
