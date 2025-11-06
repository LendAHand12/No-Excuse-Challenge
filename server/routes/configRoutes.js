import express from "express";
import {
  getAllConfigs,
  update,
  getExchangeRate,
  getConfigByLabel,
} from "../controllers/configControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllConfigs).post(protectRoute, isAdmin, update);
// Public endpoint to get exchange rate (must be before /:label)
router.route("/exchange-rate").get(getExchangeRate);
// Public endpoint to get config by label (must be after specific routes)
router.route("/:label").get(getConfigByLabel);

export default router;
