import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import Permission from "../models/permissionModel.js";

const protectRoute = asyncHandler(async (req, res, next) => {
  let token;

  // if the header includes a Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get only the token string
      token = req.headers.authorization.split(" ")[1];

      // decode the token to get the corresponding user's id
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );

      // Try to find as User first, then as Admin
      req.user = await User.findById(decodedToken.id).select("-password");
      if (!req.user) {
        // If not found as User, try Admin
        req.admin = await Admin.findById(decodedToken.id).select("-password -googleAuthenticatorSecret");
        if (!req.admin || !req.admin.isActive) {
          res.status(401);
          throw new Error("Not authorised. User/Admin not found or inactive");
        }
        // Set user object for compatibility with existing code
        req.user = {
          _id: req.admin._id,
          email: req.admin.email,
          isAdmin: true,
          role: req.admin.role || "admin", // Use actual role from Admin model
          isRootAdmin: req.admin.isRootAdmin,
        };
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorised. Token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorised. No token provided");
  }
});

const isAdmin = asyncHandler((req, res, next) => {
  // Check if it's an admin (either from User model with isAdmin=true or from Admin model)
  if (req.admin || req.user?.isAdmin || (req.user && req.user.role !== "user")) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised admin");
  }
});

const isSuperAdmin = asyncHandler((req, res, next) => {
  // Check if it's a root admin (from Admin model) or super admin (from User model)
  if (req.admin?.isRootAdmin || (req.user && req.user.role === "admin")) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised. Super admin access required");
  }
});

const checkPermission = asyncHandler(async (req, res, next) => {
  const method = req.method;
  const pagePathHeader = req.headers["page-path"];
  
  if (!pagePathHeader) {
    res.status(400);
    throw new Error("Page path header is required");
  }

  // Determine role - check if it's an admin from Admin model or User model
  let userRole;
  if (req.admin) {
    // Admin from Admin model - use actual role from Admin model
    userRole = req.admin.role || "admin";
  } else if (req.user && req.user.role) {
    userRole = req.user.role;
  } else {
    res.status(401);
    throw new Error("Not authorised");
  }

  // Root admin has full access (bypass permission check)
  if (req.admin?.isRootAdmin) {
    return next();
  }

  // Role "admin" also has full access (for backward compatibility with User model)
  // But for Admin model, we should use the actual role from the database
  if (userRole === "admin" && !req.admin) {
    // Only allow full access for User model with role "admin"
    return next();
  }

  // Check permissions for other roles
  const permissions = await Permission.findOne({ role: userRole }).populate(
    "pagePermissions.page"
  );

  if (!permissions) {
    res.status(403);
    throw new Error("No permissions found for this role");
  }

  // Find the page permission that matches the requested path
  const pagePermission = permissions.pagePermissions.find(
    (pp) => pp.page && pp.page.path === pagePathHeader
  );

  if (!pagePermission) {
    res.status(403);
    throw new Error("Access denied - Page not found in permissions");
  }

  // Map HTTP methods to actions
  const methodToAction = {
    GET: "read",
    POST: "update",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
  };

  const requiredAction = methodToAction[method] || "read";

  // Check if the required action is allowed
  if (!pagePermission.actions || !pagePermission.actions.includes(requiredAction)) {
    res.status(403);
    throw new Error(`Access denied - ${requiredAction} action not allowed for this page`);
  }

  next();
});

export { protectRoute, isAdmin, checkPermission, isSuperAdmin };
