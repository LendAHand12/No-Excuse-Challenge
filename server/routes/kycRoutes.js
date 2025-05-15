import express from "express";
import { startKYC, register } from "../controllers/kycControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/start").get(protectRoute, startKYC);
router.route("/register").post(protectRoute, register);

export default router;
