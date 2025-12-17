import express from "express";
import {
  getAllPageSettings,
  updatePageSettings,
} from "../controllers/pageSettingControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPageSettings)
  .put(protectAdminRoute, updatePageSettings);

export default router;
