import express from "express";
import {
  getAllPreTier2Users,
  approveUserPreTier2,
  getPaymentInfo,
  onDonePayment,
  changeOrderByAdmin,
  getPaymentTier2Info,
  onDoneTier2Payment,
  getInfoPreTier2Pool,
  getPreTier2UsersForUser,
  achievedUserTier2,
  getPassedUsers,
} from "../controllers/preTier2Controllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllPreTier2Users);
router.route("/pre-tier-2-list").get(protectRoute, getPreTier2UsersForUser);
router.route("/pre-tier-2-passed-list").get(protectRoute, getPassedUsers);
router.route("/pool").get(protectRoute, getInfoPreTier2Pool);
router.route("/payment").get(protectRoute, getPaymentInfo);
router.route("/done-payment").post(protectRoute, onDonePayment);
router.route("/payment-tier-2-info").get(protectRoute, getPaymentTier2Info);
router.route("/done-payment-tier-2").post(protectRoute, onDoneTier2Payment);
router.route("/change-order").post(protectRoute, isAdmin, changeOrderByAdmin);
router.route("/achieve-user/:id").put(protectRoute, isAdmin, achievedUserTier2);
router.route("/:id").put(protectRoute, isAdmin, approveUserPreTier2);

export default router;
