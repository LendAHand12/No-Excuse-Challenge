import express from "express";
import {
  getDreamPool,
  updateDreamPool,
  getUserForUpdateDreampool,
  getAllDreampoolForExport,
} from "../controllers/dreampoolControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, getDreamPool);
router.route("/").post(protectRoute, isAdmin, updateDreamPool);
router
  .route("/notHonors")
  .get(protectRoute, isAdmin, getUserForUpdateDreampool);
router.route("/export").post(protectRoute, isAdmin, getAllDreampoolForExport);

export default router;
