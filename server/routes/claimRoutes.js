import express from "express";
import {
  claimHewe,
  claimUsdt,
  getAllClaims,
  getAllClaimsForExport,
} from "../controllers/claimHeweControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/hewe").post(protectRoute, claimHewe);
router.route("/usdt").post(protectRoute, claimUsdt);
router.route("/list").get(protectRoute, isAdmin, getAllClaims);
router.route("/export").post(protectRoute, isAdmin, getAllClaimsForExport);

export default router;
