import express from "express";
import {
  moveSystemStart,
  getAllMoveSystem,
  updateMoveSystemStatus
} from "../controllers/moveSysetmControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/register").post(protectRoute, moveSystemStart);
router
  .route("/")
  .get(protectRoute, isAdmin, getAllMoveSystem)
  .put(protectRoute, isAdmin, updateMoveSystemStatus);

export default router;
