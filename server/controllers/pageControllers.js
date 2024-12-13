import asyncHandler from "express-async-handler";
import Page from "../models/pageModel.js";
import PageSetting from "../models/pageSettingModel.js";

const getAllPages = asyncHandler(async (req, res) => {
  const pages = await Page.find();

  res.json({
    pages,
  });
});

const createPage = asyncHandler(async (req, res) => {
  const { pageName, actions, path } = req.body;

  try {
    await Page.create({ pageName, actions, path });
    res.status(200).json({
      message: "Created page",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Internal error");
  }
});

const getPageDetailsPageName = asyncHandler(async (req, res) => {
  const pageName = req.params.pageName;

  if (pageName === "cms-ourTeam") {
    const settings = await PageSetting.findOne({ name: "ourTeam" });
    res.json({
      result: settings,
    });
  } else if (pageName === "cms-footer") {
    const settings = await PageSetting.find({ name: { $ne: "ourTeam" } });
    res.json({
      result: settings,
    });
  } else {
    const page = await Page.findOne({ pageName });
    res.json({
      result: page,
    });
  }
});

const updatePageDetailsPageName = asyncHandler(async (req, res) => {
  const body = req.body;
  const { pageName } = req.params;

  if (pageName === "cms-ourTeam") {
    await PageSetting.findOneAndUpdate({ name: "ourTeam" }, { $set: body });
    res.status(200).json({
      message: "Update successful",
    });
  } else if (pageName === "cms-footer") {
    for (let setting of body.settings) {
      await PageSetting.findOneAndUpdate(
        { name: setting.name },
        { $set: setting }
      );
    }
    res.status(200).json({
      message: "Update successful",
    });
  } else {
    const newPage = await Page.findOneAndUpdate({ pageName }, { $set: body });

    if (newPage) {
      res.status(200).json({
        message: "Update successful",
        newPage,
      });
    }
  }
});

export {
  getAllPages,
  createPage,
  getPageDetailsPageName,
  updatePageDetailsPageName,
};
