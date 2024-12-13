import asyncHandler from "express-async-handler";
import PagePreview from "../models/pagePreviewModel.js";

const getAllPages = asyncHandler(async (req, res) => {
  const pages = await PagePreview.find();
  res.json({
    pages,
  });
});

const createPage = asyncHandler(async (req, res) => {
  const { pageName, actions, path } = req.body;

  try {
    await PagePreview.create({ pageName, actions, path });
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
  const page = await PagePreview.findOne({ pageName });

  res.json({
    result: page,
  });
});

const updatePageDetailsPageName = asyncHandler(async (req, res) => {
  const body = req.body;
  const { pageName } = req.params;
  const newPage = await PagePreview.findOneAndUpdate(
    { pageName },
    { $set: body }
  );

  if (newPage) {
    res.status(200).json({
      message: "Update successful",
      newPage,
    });
  }
});

export {
  getAllPages,
  createPage,
  getPageDetailsPageName,
  updatePageDetailsPageName,
};
