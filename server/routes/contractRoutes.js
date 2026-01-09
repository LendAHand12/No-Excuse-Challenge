import express from "express";
import {
  generateContract,
  getPreviewData,
} from "../controllers/contractController.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are for admin only
router.use(protectRoute);
router.use(isAdmin);

router.get("/generate/:userId", generateContract);
router.get("/preview-data/:userId", getPreviewData);

export default router;
