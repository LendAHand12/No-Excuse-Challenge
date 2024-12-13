import express from "express";
import {
  getAllPageSettings,
  updatePageSettings,
} from "../controllers/pageSettingControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPageSettings)
  .put(protectRoute, isAdmin, updatePageSettings);

export default router;
