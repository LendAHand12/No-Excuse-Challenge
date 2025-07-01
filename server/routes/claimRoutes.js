import express from "express";
import {
  claimHewe,
  claimUsdt,
  getAllClaims,
  getAllClaimsForExport,
  getAllClaimsOfUser,
  resetProcessing,
} from "../controllers/claimHeweControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/hewe").post(claimHewe);
router.route("/usdt").post(claimUsdt);
router.route("/list").get(protectRoute, isAdmin, getAllClaims);
router.route("/export").post(protectRoute, isAdmin, getAllClaimsForExport);
router.route("/user").get(protectRoute, getAllClaimsOfUser);
router.route("/reset").get(protectRoute, isAdmin, resetProcessing);

export default router;
