import asyncHandler from "express-async-handler";
import Permission from "../models/permissionModel.js";

const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find();

  res.json({
    permissions,
  });
});

const getPermissions = asyncHandler(async (req, res) => {
  // Check if it's an admin from Admin model or User model
  let role;
  if (req.admin) {
    // Use actual role from Admin model
    role = req.admin.role || "admin";
  } else if (req.user && req.user.role) {
    role = req.user.role;
  } else {
    res.status(401);
    throw new Error("Not authorised");
  }

  const permission = await Permission.findOne({ role }).populate(
    "pagePermissions.page"
  );

  if (!permission) {
    return res.json({
      permissions: [],
    });
  }

  // Format permissions to match frontend expectations
  const formattedPermissions = permission.pagePermissions
    ? permission.pagePermissions.map((pp) => ({
        page: pp.page,
        actions: pp.actions || [],
      }))
    : [];

  res.json({
    permissions: formattedPermissions,
  });
});

const createPermission = asyncHandler(async (req, res) => {
  const { role, pagePermissions } = req.body;

  try {
    await Permission.create({ role, pagePermissions });
    res.status(200).json({
      message: "Created permissions",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Internal error");
  }
});

const updatePermission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pagePermissions } = req.body;

  try {
    const permission = await Permission.findById(id);
    permission.pagePermissions = pagePermissions;
    await permission.save();
    res.status(200).json({
      message: "Update successful",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Internal error");
  }
});

const getPermissionsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const permission = await Permission.findById(id).populate(
    "pagePermissions.page"
  );

  res.json({
    permission,
  });
});

export {
  getAllPermissions,
  getPermissions,
  createPermission,
  updatePermission,
  getPermissionsById,
};
