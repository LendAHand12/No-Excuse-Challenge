import asyncHandler from "express-async-handler";
import Package from "../models/packageModel.js";

const getAllPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({}).select("name status");

  res.json({
    packages,
  });
});

const getActivePackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ status: "active" }).select("name");
  return packages.map((ele) => ele.name);
});

const updatePackages = asyncHandler(async (req, res) => {
  const { packages } = req.body;
  try {
    for (let p of packages) {
      let packageData = await Package.findById(p._id);
      packageData.status = p.status || packageData.status;
      packageData.uid = req.user.id;
      await packageData.save();
    }
    res.status(200).json({
      message: "Update successful",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Internal error");
  }
});

export { getAllPackages, updatePackages, getActivePackages };
