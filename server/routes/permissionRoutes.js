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

const router = express.Router();

router
  .route("/")
  .get(protectRoute, getAllPermissions)
  .post(protectRoute, createPermission);

router
  .route("/:id")
  .get(protectRoute, getPermissionsById)
  .put(protectRoute, updatePermission);

export default router;
