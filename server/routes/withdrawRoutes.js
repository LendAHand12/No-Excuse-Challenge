import express from "express";
import { getAllWithdraws, updateWithdraw, getAllWithdrawsForExport } from "../controllers/withdrawControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllWithdraws);
router.route("/export").post(protectRoute, isAdmin, getAllWithdrawsForExport);
router.route("/:id").put(protectRoute, isAdmin, updateWithdraw);

export default router;
