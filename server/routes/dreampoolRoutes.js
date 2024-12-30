import express from "express";
import { getDreamPool } from "../controllers/userControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, getDreamPool);

export default router;
