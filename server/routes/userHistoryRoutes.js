import express from "express";
import {
  getAllUserHisotry,
  updateUserHistory,
  connectWallet,
} from "../controllers/userHistoryControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, isAdmin, getAllUserHisotry)
  .put(protectRoute, isAdmin, updateUserHistory);
router.route("/connect-wallet").post(protectRoute, connectWallet);

export default router;
