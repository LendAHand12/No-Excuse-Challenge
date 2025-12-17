import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
} from "../controllers/notificationControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

// User routes
router.route("/").get(protectRoute, getNotifications);
router.route("/unread-count").get(protectRoute, getUnreadCount);
router.route("/read-all").put(protectRoute, markAllAsRead);
router.route("/:id/read").put(protectRoute, markAsRead);

// Admin routes (for future use)
router.route("/").post(protectAdminRoute, createNotification);

export default router;
