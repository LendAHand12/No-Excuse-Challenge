import express from "express";
import { claimHewe, claimUsdt } from "../controllers/claimHeweControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/hewe").post(protectRoute, claimHewe);
router.route("/usdt").post(protectRoute, claimUsdt);

export default router;
