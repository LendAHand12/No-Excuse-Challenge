import asyncHandler from "express-async-handler";
import Admin from "../models/adminModel.js";
import generateToken from "../utils/generateToken.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import getFaceTecData from "../services/getFaceTecData.js";
import { createCallbackToken, decodeCallbackToken } from "../utils/methods.js";
import jwt from "jsonwebtoken";
import Permission from "../models/permissionModel.js";

// Middleware to protect admin routes
const protectAdminRoute = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );

      req.admin = await Admin.findById(decodedToken.id).select("-password");
      if (!req.admin || !req.admin.isActive) {
        res.status(401);
        throw new Error("Not authorized. Admin account is inactive.");
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized. Token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized. No token provided");
  }
});

// Check if admin is root admin
const isRootAdmin = asyncHandler(async (req, res, next) => {
  if (req.admin && req.admin.isRootAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized. Root admin access required.");
  }
});

// Admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const admin = await Admin.findOne({ email, isActive: true });

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check if first login - need to complete face registration and 2FA setup
  if (!admin.firstLoginCompleted) {
    return res.json({
      success: true,
      requiresFirstTimeSetup: true,
      message: "First login detected. Please complete face registration and 2FA setup.",
      adminId: admin._id,
    });
  }

  // Safety check: if firstLoginCompleted is true, both face and 2FA must be enabled
  if (!admin.faceRegistered || !admin.googleAuthenticatorEnabled) {
    // Reset firstLoginCompleted if setup is incomplete
    admin.firstLoginCompleted = false;
    await admin.save();
    return res.json({
      success: true,
      requiresFirstTimeSetup: true,
      message: "Setup incomplete. Please complete face registration and 2FA setup.",
      adminId: admin._id,
    });
  }

  // For subsequent logins, return temporary token that requires face verification and 2FA
  const tempToken = jwt.sign(
    { id: admin._id, type: "admin_temp" },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );

  return res.json({
    success: true,
    requiresFirstTimeSetup: false,
    requiresVerification: true,
    message: "Please verify face and enter 2FA code",
    tempToken,
  });
});

// Start face verification for login
const startFaceVerification = asyncHandler(async (req, res) => {
  const { tempToken } = req.body;

  if (!tempToken) {
    res.status(400);
    throw new Error("Temp token is required");
  }

  // Verify temp token
  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    if (decoded.type !== "admin_temp") {
      res.status(401);
      throw new Error("Invalid token type");
    }
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    res.status(404);
    throw new Error("Admin not found or inactive");
  }

  if (!admin.faceRegistered || admin.facetecTid === "") {
    res.status(400);
    throw new Error("Face not registered");
  }

  const token = createCallbackToken(admin._id.toString(), "admin_face_verify");
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/admin/face-verify-callback?token=${token}&tempToken=${tempToken}`;

  const redirectToKYC = `${process.env.KYC_URL}/verify.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${admin._id}`;

  res.json({ url: redirectToKYC, token });
});

// Verify face and 2FA for login
const verifyLogin = asyncHandler(async (req, res) => {
  const { tempToken, twoFactorCode, token } = req.body;

  if (!tempToken || !twoFactorCode || !token) {
    res.status(400);
    throw new Error("Temp token, 2FA code, and face verification token are required");
  }

  // Verify temp token first
  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    if (decoded.type !== "admin_temp") {
      res.status(401);
      throw new Error("Invalid token type");
    }
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    res.status(404);
    throw new Error("Admin not found or inactive");
  }

  // Verify callback token if provided (from face verification)
  if (token) {
    try {
      const decodedToken = decodeCallbackToken(token);
      if (decodedToken.purpose !== "admin_face_verify") {
        res.status(400);
        throw new Error("Invalid token purpose");
      }
      // Verify that callback token belongs to the same admin
      if (decodedToken.userId !== admin._id.toString()) {
        res.status(400);
        throw new Error("Token admin mismatch");
      }
    } catch (error) {
      res.status(400);
      throw new Error(error.message || "Invalid or expired callback token");
    }
  }

  // Verify face is registered
  if (!admin.faceRegistered || admin.facetecTid === "") {
    res.status(400);
    throw new Error("Face not registered");
  }

  // Note: In a production environment, you should verify the facetect_tid
  // against FaceTec's verification API to ensure the verification was successful

  // Verify 2FA code
  if (!admin.googleAuthenticatorEnabled || !admin.googleAuthenticatorSecret) {
    res.status(400);
    throw new Error("2FA not enabled");
  }

  const verified = speakeasy.totp.verify({
    secret: admin.googleAuthenticatorSecret,
    encoding: "base32",
    token: twoFactorCode,
    window: 2, // Allow 2 time steps before/after
  });

  if (!verified) {
    res.status(401);
    throw new Error("Invalid 2FA code");
  }

  // All verifications passed - generate real tokens
  const accessToken = generateToken(admin._id, "access");
  const refreshToken = generateToken(admin._id, "refresh");

  // Get permissions for admin role
  const permissions = await Permission.findOne({ role: "admin" }).populate(
    "pagePermissions.page"
  );

  // Format permissions to match frontend expectations
  const formattedPermissions = permissions && permissions.pagePermissions
    ? permissions.pagePermissions.map((pp) => ({
        page: pp.page,
        actions: pp.actions || [],
      }))
    : [];

  return res.json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    userInfo: {
      _id: admin._id,
      email: admin.email,
      isRootAdmin: admin.isRootAdmin,
      firstLoginCompleted: admin.firstLoginCompleted,
      role: "admin",
      isAdmin: true,
      permissions: formattedPermissions,
    },
  });
});

// Start FaceTec enrollment (for first-time setup)
const startFaceEnrollment = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  if (!adminId) {
    res.status(400);
    throw new Error("Admin ID is required");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  if (admin.faceRegistered) {
    res.status(400);
    throw new Error("Face already registered");
  }

  const token = createCallbackToken(admin._id.toString(), "admin_face_enroll");
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/admin/face-enroll-callback?token=${token}`;

  const redirectToKYC = `${process.env.KYC_URL}/enroll.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${admin._id}`;

  res.json({ url: redirectToKYC, token });
});

// Register face after FaceTec enrollment
const registerFace = asyncHandler(async (req, res) => {
  const { facetect_tid, admin_id, token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Token is required");
  }

  let decodedToken;
  try {
    decodedToken = decodeCallbackToken(token);
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Invalid or expired token");
  }

  if (decodedToken.purpose !== "admin_face_enroll") {
    res.status(400);
    throw new Error("Invalid token purpose");
  }

  if (decodedToken.userId !== admin_id) {
    res.status(400);
    throw new Error("Token admin mismatch");
  }

  const admin = await Admin.findById(decodedToken.userId);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  // Get FaceTec data
  const faceTecDataRes = await getFaceTecData({ userId: admin._id.toString() });
  const faceTecData = faceTecDataRes.data.data[0];
  const { isLikelyDuplicate, allUserEnrollmentsListSearchResult } = faceTecData;

  // Check for duplicates
  if (
    isLikelyDuplicate &&
    allUserEnrollmentsListSearchResult &&
    allUserEnrollmentsListSearchResult.searchResults.length > 0
  ) {
    for (let enroll of allUserEnrollmentsListSearchResult.searchResults) {
      let externalRefID = enroll.externalDatabaseRefID;
      let userId = externalRefID.split("_")[1];

      // Check if it's registered to another admin
      let dupAdmin = await Admin.findOne({
        _id: userId,
        isActive: true,
      });

      if (dupAdmin) {
        return res.status(200).json({
          success: false,
          message: "Your face has been registered to another admin account.",
        });
      }
    }
  }

  admin.facetecTid = facetect_tid;
  admin.faceRegistered = true;
  
  // If 2FA is also enabled, mark first login as completed
  if (admin.googleAuthenticatorEnabled) {
    admin.firstLoginCompleted = true;
  }
  
  await admin.save();

  return res.json({
    success: true,
    message: "Face registration successful",
    firstLoginCompleted: admin.firstLoginCompleted,
  });
});

// Setup Google Authenticator (generate secret and QR code)
const setup2FA = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  if (!adminId) {
    res.status(400);
    throw new Error("Admin ID is required");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  // If 2FA is already enabled, don't allow re-setup
  if (admin.googleAuthenticatorEnabled) {
    res.status(400);
    throw new Error("2FA is already enabled");
  }

  let secret;
  let qrCodeUrl;

  // If there's an existing unverified secret, reuse it
  if (admin.googleAuthenticatorSecret && !admin.googleAuthenticatorEnabled) {
    secret = {
      base32: admin.googleAuthenticatorSecret,
      otpauth_url: speakeasy.otpauthURL({
        secret: admin.googleAuthenticatorSecret,
        label: `Admin (${admin.email})`,
        issuer: "No-Excuse Challenge",
        encoding: "base32",
      }),
    };
    qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  } else {
    // Generate new secret
    secret = speakeasy.generateSecret({
      name: `Admin (${admin.email})`,
      issuer: "No-Excuse Challenge",
    });

    // Generate QR code
    qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret temporarily (will be saved after verification)
    admin.googleAuthenticatorSecret = secret.base32;
    await admin.save();
  }

  return res.json({
    success: true,
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32,
  });
});

// Verify and enable 2FA
const verifyAndEnable2FA = asyncHandler(async (req, res) => {
  const { adminId, twoFactorCode } = req.body;

  if (!adminId || !twoFactorCode) {
    res.status(400);
    throw new Error("Admin ID and 2FA code are required");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  if (!admin.googleAuthenticatorSecret) {
    res.status(400);
    throw new Error("2FA secret not generated. Please setup 2FA first.");
  }

  // Verify the code
  const verified = speakeasy.totp.verify({
    secret: admin.googleAuthenticatorSecret,
    encoding: "base32",
    token: twoFactorCode,
    window: 2,
  });

  if (!verified) {
    res.status(401);
    throw new Error("Invalid 2FA code");
  }

  // Enable 2FA
  admin.googleAuthenticatorEnabled = true;
  
  // If face is also registered, mark first login as completed
  if (admin.faceRegistered) {
    admin.firstLoginCompleted = true;
  }
  
  await admin.save();

  return res.json({
    success: true,
    message: "2FA enabled successfully",
    firstLoginCompleted: admin.firstLoginCompleted,
  });
});

// Create new admin (only root admin can do this)
const createAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // Check if email already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    res.status(400);
    throw new Error("Admin with this email already exists");
  }

  // Create new admin
  const newAdmin = await Admin.create({
    email,
    password,
    isRootAdmin: false,
    createdBy: req.admin._id,
    firstLoginCompleted: false,
    faceRegistered: false,
    googleAuthenticatorEnabled: false,
  });

  return res.status(201).json({
    success: true,
    message: "Admin created successfully",
    admin: {
      _id: newAdmin._id,
      email: newAdmin.email,
      isRootAdmin: newAdmin.isRootAdmin,
    },
  });
});

// Get current admin info
const getAdminInfo = asyncHandler(async (req, res) => {
  // Get permissions for admin role
  const permissions = await Permission.findOne({ role: "admin" }).populate(
    "pagePermissions.page"
  );

  // Format permissions to match frontend expectations
  const formattedPermissions = permissions && permissions.pagePermissions
    ? permissions.pagePermissions.map((pp) => ({
        page: pp.page,
        actions: pp.actions || [],
      }))
    : [];

  return res.json({
    success: true,
    admin: {
      _id: req.admin._id,
      email: req.admin.email,
      isRootAdmin: req.admin.isRootAdmin,
      firstLoginCompleted: req.admin.firstLoginCompleted,
      faceRegistered: req.admin.faceRegistered,
      googleAuthenticatorEnabled: req.admin.googleAuthenticatorEnabled,
      role: "admin",
      isAdmin: true,
      permissions: formattedPermissions,
    },
  });
});

// Get all admins (only root admin)
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({ isActive: true })
    .select("-password -googleAuthenticatorSecret")
    .populate("createdBy", "email")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    admins,
  });
});

// Refresh access token for admin
const refreshAdminToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }

  // Check if admin exists and is active
  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    res.status(401);
    throw new Error("Admin not found or inactive");
  }

  // Generate new access token
  const accessToken = generateToken(admin._id, "access");

  return res.json({
    success: true,
    accessToken,
  });
});

export {
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
  refreshAdminToken,
};

