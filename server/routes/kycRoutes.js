import express from "express";
import { startKYC, register, claimKYC, claimHeweKYC, checkUserCompleteKyc, moveSystemKyc, startUpdateInfoKYC } from "../controllers/kycControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";
import { getAllDoubleKyc } from "../controllers/doubleKycControllers.js";

const router = express.Router();

router.route("/start").get(protectRoute, startKYC);
router.route("/register").post(register);
// User withdrawals disabled. Restore the commented routes to re-enable.
const withdrawDisabled = (req, res) =>
  res.status(403).json({ error: "Withdrawals are currently disabled" });
router.route("/claim").post(withdrawDisabled);
router.route("/claim-hewe").post(withdrawDisabled);
// router.route("/claim").post(protectRoute, claimKYC);
// router.route("/claim-hewe").post(protectRoute, claimHeweKYC);
router.route("/double").get(protectAdminRoute, getAllDoubleKyc);
router.route("/checkKyc").post(protectAdminRoute, checkUserCompleteKyc);
router.route("/move-system").post(protectRoute, moveSystemKyc);
router.route("/start-update-info").post(protectRoute, startUpdateInfoKYC);

export default router;
