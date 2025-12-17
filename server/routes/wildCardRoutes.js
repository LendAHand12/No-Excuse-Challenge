import express from "express";
import {
  getUserWildCards,
  useWildCard,
  adminGetUserWildCards,
  adminCreateWildCard,
  adminDeleteWildCard,
} from "../controllers/wildCardControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

// User routes
router.route("/").get(protectRoute, getUserWildCards);
router.route("/use").post(protectRoute, useWildCard);

// Admin routes
router.route("/admin/:userId").get(protectAdminRoute, adminGetUserWildCards);
router.route("/admin/create").post(protectAdminRoute, adminCreateWildCard);
router.route("/admin/delete/:cardId").delete(protectAdminRoute, adminDeleteWildCard);

export default router;
