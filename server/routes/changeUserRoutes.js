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
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, getChangeUsersByUserId)
  .post(protectRoute, createChangeUser);

router.route("/cancel").get(protectRoute, cancleChangeUsersByUserId);
router.route("/reject").post(protectAdminRoute, rejectChangeUser);
router.route("/approve").post(protectAdminRoute, approveChangeUser);
router.route("/list").get(protectAdminRoute, getAllChangeUsers);
router.route("/detail/:id").get(protectAdminRoute, getChangeUsersById);

export default router;
