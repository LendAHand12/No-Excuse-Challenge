import express from "express";
import {
  getDreamPool,
  updateDreamPool,
  getUserForUpdateDreampool,
  getAllDreampoolForExport,
} from "../controllers/dreampoolControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/").get(protectRoute, getDreamPool);
router.route("/").post(protectAdminRoute, updateDreamPool);
router
  .route("/notHonors")
  .get(protectAdminRoute, getUserForUpdateDreampool);
router.route("/export").post(protectAdminRoute, getAllDreampoolForExport);

export default router;
