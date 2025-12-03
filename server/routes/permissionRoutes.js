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
import { getPermissions } from "../controllers/permissionControllers.js";

const router = express.Router();

router
  .route("/")
  .get(protectRoute, getAllPermissions)
  .post(protectRoute, isAdmin, createPermission);

router
  .route("/me")
  .get(protectRoute, isAdmin, getPermissions);

router
  .route("/:id")
  .get(protectRoute, getPermissionsById)
  .put(protectRoute, isAdmin, updatePermission);

export default router;
