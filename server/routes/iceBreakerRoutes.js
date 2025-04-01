import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getAllIceBreakers } from "../controllers/iceBreakerControllers.js";

const router = express.Router();

router.route("/").get(protectRoute, getAllIceBreakers);

export default router;
