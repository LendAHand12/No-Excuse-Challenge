import express from "express";
import { getDreamPool, updateDreamPool } from "../controllers/dreampoolControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, getDreamPool);
router.route("/").post(protectRoute, updateDreamPool);

export default router;
