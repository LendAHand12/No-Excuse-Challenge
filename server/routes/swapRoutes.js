import express from "express";
import { getAllSwap, requestSwap, getSwapsOfUser } from "../controllers/swapControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/").get(protectAdminRoute, getAllSwap).post(protectRoute, requestSwap);
router.route("/:id").get(protectRoute, getSwapsOfUser);

export default router;
