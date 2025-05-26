import express from "express";
import {
  getAllConfigs, update
} from "../controllers/configControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllConfigs).post(protectRoute, isAdmin, update);;

export default router;
