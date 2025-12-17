import express from "express";
import {
  getAllWallets,
  updateWallet,
} from "../controllers/walletControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router
  .route("/")
  .get(protectAdminRoute, getAllWallets)
  .post(protectAdminRoute, updateWallet);

export default router;
