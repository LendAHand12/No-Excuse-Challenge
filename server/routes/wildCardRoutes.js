import express from "express";
import {
  getUserWildCards,
  useWildCard,
  adminGetUserWildCards,
  adminCreateWildCard,
} from "../controllers/wildCardControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.route("/").get(protectRoute, getUserWildCards);
router.route("/use").post(protectRoute, useWildCard);

// Admin routes
router.route("/admin/:userId").get(protectRoute, isAdmin, adminGetUserWildCards);
router.route("/admin/create").post(protectRoute, isAdmin, adminCreateWildCard);

export default router;
