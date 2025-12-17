import express from "express";
import {
  claimHewe,
  claimUsdt,
  claimAmc,
  getAllClaims,
  getAllClaimsForExport,
  getAllClaimsOfUser,
  resetProcessing,
  getPrice,
} from "../controllers/claimHeweControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/hewe").post(protectRoute, claimHewe);
router.route("/amc").post(protectRoute, claimAmc);
router.route("/usdt").post(claimUsdt);
// router.route("/usdt").post(protectRoute, claimUsdt);
router.route("/list").get(protectAdminRoute, getAllClaims);
router.route("/export").post(protectAdminRoute, getAllClaimsForExport);
router.route("/user").get(protectRoute, getAllClaimsOfUser);
router.route("/reset").get(protectAdminRoute, resetProcessing);
router.route("/price").post(protectRoute, getPrice);

export default router;
