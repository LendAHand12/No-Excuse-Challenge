import express from "express";
import {
  protectAdminRoute,
  isRootAdmin,
  adminLogin,
  startFaceVerification,
  verifyLogin,
  startFaceEnrollment,
  registerFace,
  setup2FA,
  verifyAndEnable2FA,
  createAdmin,
  getAdminInfo,
  getAllAdmins,
} from "../controllers/adminControllers.js";

const router = express.Router();

// Public routes
router.route("/login").post(adminLogin);
router.route("/start-face-verification").post(startFaceVerification);
router.route("/verify-login").post(verifyLogin);

// First-time setup routes (no auth required, but need adminId)
router.route("/start-face-enrollment").post(startFaceEnrollment);
router.route("/register-face").post(registerFace);
router.route("/setup-2fa").post(setup2FA);
router.route("/verify-enable-2fa").post(verifyAndEnable2FA);

// Protected routes
router.route("/me").get(protectAdminRoute, getAdminInfo);
router.route("/create").post(protectAdminRoute, isRootAdmin, createAdmin);
router.route("/all").get(protectAdminRoute, isRootAdmin, getAllAdmins);

export default router;

