import express from "express";
import {
  getAllPackages,
  updatePackages,
} from "../controllers/packageControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPackages)
  .post(protectAdminRoute, updatePackages);

export default router;
