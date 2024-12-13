import express from "express";
import {
  getAllPackages,
  updatePackages,
} from "../controllers/packageControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPackages)
  .post(protectRoute, isAdmin, updatePackages);

export default router;
