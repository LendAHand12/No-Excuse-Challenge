import express from "express";
import {
  getIncomeOfUser
} from "../controllers/incomeControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, getIncomeOfUser);

export default router;
