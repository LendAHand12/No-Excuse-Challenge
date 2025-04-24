import express from "express";
import {
  runCronjob
} from "../controllers/cronjobControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/run").post(protectRoute, isAdmin, runCronjob);

export default router;
