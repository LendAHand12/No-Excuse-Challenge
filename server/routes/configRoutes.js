import express from "express";
import {
  getAllConfigs, update, getExchangeRate
} from "../controllers/configControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllConfigs).post(protectRoute, isAdmin, update);
// Public endpoint to get exchange rate
router.route("/exchange-rate").get(getExchangeRate);

export default router;
