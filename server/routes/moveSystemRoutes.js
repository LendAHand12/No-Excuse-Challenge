import express from "express";
import {
  moveSystemStart,
  getAllMoveSystem,
  updateMoveSystemStatus
} from "../controllers/moveSysetmControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/register").post(protectRoute, moveSystemStart);
router
  .route("/")
  .get(protectAdminRoute, getAllMoveSystem)
  .put(protectAdminRoute, updateMoveSystemStatus);

export default router;
