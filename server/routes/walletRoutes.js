import express from "express";
import {
  getAllWallets,
  updateWallet,
} from "../controllers/walletControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, isAdmin, getAllWallets)
  .post(protectRoute, isAdmin, updateWallet);

export default router;
