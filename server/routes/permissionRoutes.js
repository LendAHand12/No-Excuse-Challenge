import express from "express";
import {
  getAllPermissions,
  getPermissionsById,
  createPermission,
  updatePermission,
} from "../controllers/permissionControllers.js";
import {
  checkPermission,
  isAdmin,
  protectRoute,
} from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";
import { getPermissions } from "../controllers/permissionControllers.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, getAllPermissions)
  .post(protectAdminRoute, createPermission);

router
  .route("/me")
  .get(protectAdminRoute, getPermissions);

router
  .route("/:id")
  .get(protectRoute, getPermissionsById)
  .put(protectAdminRoute, updatePermission);

export default router;
