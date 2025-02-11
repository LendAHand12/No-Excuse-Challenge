import express from "express";
import { claimHewe, claimUsdt, getAllClaims } from "../controllers/claimHeweControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/hewe").post(protectRoute, claimHewe);
router.route("/usdt").post(protectRoute, claimUsdt);
router.route("/list").get( protectRoute, isAdmin, getAllClaims);

export default router;
