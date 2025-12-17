import express from "express";
import {
  getAllWithdraws,
  updateWithdraw,
  getAllWithdrawsForExport,
  getWithdrawsOfUser,
} from "../controllers/withdrawControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/").get(protectAdminRoute, getAllWithdraws);
router.route("/export").post(protectAdminRoute, getAllWithdrawsForExport);
router.route("/user").get(protectRoute, getWithdrawsOfUser);
router.route("/:id").put(protectAdminRoute, updateWithdraw);

export default router;
