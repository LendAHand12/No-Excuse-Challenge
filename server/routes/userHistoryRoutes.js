import express from "express";
import {
  getAllUserHisotry,
  updateUserHistory,
} from "../controllers/userHistoryControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, isAdmin, getAllUserHisotry)
  .put(protectRoute, isAdmin, updateUserHistory);

export default router;
