import asyncHandler from "express-async-handler";
import Permission from "../models/permissionModel.js";

const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find();

  res.json({
    permissions,
  });
});

const getPermissions = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const permissions = await Permission.findOne({ role });

  res.json({
    permissions,
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
