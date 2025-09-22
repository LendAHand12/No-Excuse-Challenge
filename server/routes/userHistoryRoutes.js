import express from "express";
import {
  getAllUserHisotry,
  updateUserHistory,
  connectWallet,
  getAllConnectWallets,
} from "../controllers/userHistoryControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, isAdmin, getAllUserHisotry)
  .put(protectRoute, isAdmin, updateUserHistory);
router.route("/connect-wallet").post(protectRoute, connectWallet);
router.route("/connect-wallet-list").get(protectRoute, isAdmin, getAllConnectWallets);

export default router;
