import asyncHandler from "express-async-handler";
import Honor from "../models/honorModel.js";

const getAllIceBreakers = asyncHandler(async (req, res) => {
  const count = await Honor.countDocuments({});

  const allBreakers = await Honor.find({}).populate("userId", "_id userId email")
    .sort("-createdAt");

  res.json({
    allBreakers,
  });
});

export { getAllIceBreakers };
