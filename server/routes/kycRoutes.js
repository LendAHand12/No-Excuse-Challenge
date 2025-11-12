import express from "express";
import { startKYC, register, claimKYC, checkUserCompleteKyc, moveSystemKyc } from "../controllers/kycControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { getAllDoubleKyc } from "../controllers/doubleKycControllers.js";

const router = express.Router();

router.route("/start").get(protectRoute, startKYC);
router.route("/register").post(register);
router.route("/claim").post(protectRoute, claimKYC);
router.route("/double").get(protectRoute, isAdmin, getAllDoubleKyc);
router.route("/checkKyc").post(protectRoute, isAdmin, checkUserCompleteKyc);
router.route("/move-system").post(protectRoute, moveSystemKyc);

export default router;
