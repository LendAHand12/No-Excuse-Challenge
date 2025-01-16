import express from "express";
import { getAllWithdraws, updateWithdraw } from "../controllers/withdrawControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllWithdraws);
router.route("/:id").put(protectRoute, isAdmin, updateWithdraw);

export default router;
