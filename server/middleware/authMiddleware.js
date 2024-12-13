import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
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

      // fetch that user from db, but not get the user's password and set this fetched user to the req.user
      req.user = await User.findById(decodedToken.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorised. Token failed");
    }
  }
});

const isAdmin = asyncHandler((req, res, next) => {
  if (req.user.isAdmin || (req.user && req.user.role !== "user")) next();
  else {
    res.status(401);
    throw new Error("Not authorised admin");
  }
});

const isSuperAdmin = asyncHandler((req, res, next) => {
  if (req.user.isAdmin || (req.user && req.user.role === "admin")) next();
  else {
    res.status(401);
    throw new Error("Not authorised admin");
  }
});

const checkPermission = asyncHandler(async (req, res, next) => {
  const method = req.method;
  const pageNameHeader = req.headers["page-path"];
  if (req.user && req.user.role) {
    const userRole = req.user.role;
    if (userRole === "admin") {
      next();
    } else {
      const permission = pagePermissions.find(
        (ele) => ele.pageName === pageNameHeader && ele.method === method
      );
      console.log({ permission });
      const permissions = await Permission.findOne({ role: userRole }).populate(
        "pagePermissions.page"
      );
      for (let page of permissions.pagePermissions) {
        console.log({ page });
      }
      const page = permissions.pagePermissions.find(
        (ele) => ele.page.pageName === pageNameHeader
      );
      if (page) {
      } else {
        res.status(401);
        throw new Error("Access denied");
      }
      console.log({ page });
    }
  } else {
    res.status(401);
    throw new Error("Not authorised");
  }
});

export { protectRoute, isAdmin, checkPermission, isSuperAdmin };
