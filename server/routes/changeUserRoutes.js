import express from "express";
import {
  createChangeUser,
  getAllChangeUsers,
  getChangeUsersByUserId,
  cancleChangeUsersByUserId,
  getChangeUsersById,
  rejectChangeUser,
  approveChangeUser,
} from "../controllers/changeUserControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, getChangeUsersByUserId)
  .post(protectRoute, createChangeUser);

router.route("/cancel").get(protectRoute, cancleChangeUsersByUserId);
router.route("/reject").post(protectRoute, isAdmin, rejectChangeUser);
router.route("/approve").post(protectRoute, isAdmin, approveChangeUser);
router.route("/list").get(protectRoute, isAdmin, getAllChangeUsers);
router.route("/detail/:id").get(protectRoute, isAdmin, getChangeUsersById);

export default router;
