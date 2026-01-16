import express from "express";
import {
  generateContract
} from "../controllers/contractController.js";
import { previewContractTemplate, getContractContent } from "../controllers/contractPreviewController.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


// Route to get contract content with user data (requires userId)
router.get("/content/:userId", getContractContent);

// Admin-only routes
router.use(protectRoute);
router.use(isAdmin);

// Preview contract template as HTML
router.get("/preview", previewContractTemplate);

router.get("/generate/:userId", generateContract);

export default router;
