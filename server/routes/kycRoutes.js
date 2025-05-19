import express from "express";
import { startKYC, register, claimKYC } from "../controllers/kycControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/start").get(protectRoute, startKYC);
router.route("/register").post(protectRoute, register);
router.route("/claim").post(protectRoute, claimKYC);

export default router;
