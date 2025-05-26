import asyncHandler from "express-async-handler";
import Config from "../models/configModel.js";

const getAllConfigs = asyncHandler(async (req, res) => {
  const allConfigs = await Config.find({
    label: { $not: { $regex: "PIG", $options: "i" } },
  });

  res.json({
    allConfigs: allConfigs,
  });
});

const update = asyncHandler(async (req, res) => {
  const { config } = req.body;

  const configData = await Config.findById(config._id);

  if (configData) {
    configData.value = config.value;
    await configData.save();
  }

  res.json({
    message: "Update successfully",
  });
});

export { getAllConfigs, update };
