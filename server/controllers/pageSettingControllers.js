import asyncHandler from "express-async-handler";
import PageSetting from "../models/pageSettingModel.js";

const getAllPageSettings = asyncHandler(async (req, res) => {
  const settings = await PageSetting.find();

  res.json({
    settings,
  });
});

const updatePageSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  for (let setting of settings) {
    await PageSetting.findOneAndUpdate(
      { name: setting.name },
      { $set: { val: setting.val } }
    );
  }

  if (newPage) {
    res.status(200).json({
      message: "Update successful",
    });
  }
});

export { getAllPageSettings, updatePageSettings };
