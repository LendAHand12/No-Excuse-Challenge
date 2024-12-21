import express from "express";
import { claimHewe } from "../controllers/claimHeweControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/claim").post(protectRoute, claimHewe);

export default router;
