import express from "express";
import { startKYC, callback } from "../controllers/kycControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/start").get(protectRoute, startKYC);
router.route("/callback").get(protectRoute, callback);

export default router;
