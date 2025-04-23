import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";

const createPosts = async (req, res) => {
  const { title_en, text_en, desc_en, type } = req.body;

  const files = req.files;

  try {
    if (files) {
      var filename_en = "";
      if (files.file_en) {
        filename_en = files.file_en[0].filename;
      }
    }

    await Post.create({
      title_en,
      text_en,
      desc_en,
      cid: req.user.id,
      type,
      filename_en,
      status: "PUBLIC",
      views: Math.floor(Math.random() * (999 - 100 + 1)) + 100,
    });

    res.status(200).json({
      message: "saved successful",
    });
  } catch (err) {
    res.status(400);
    throw new Error("Internal error");
  }
};

const getAllPosts = asyncHandler(async (req, res) => {
  const { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 20;

  const count = await Post.countDocuments({
    $and: [
      {
        $or: [
          { title_en: { $regex: keyword, $options: "i" } },
          { desc_en: { $regex: keyword, $options: "i" } },
        ],
      },
      {
        status: "PUBLIC",
      },
    ],
  });
  const allPosts = await Post.find({
    $and: [
      {
        $or: [
          { title_en: { $regex: keyword, $options: "i" } },
          { desc_en: { $regex: keyword, $options: "i" } },
        ],
      },
      {
        status: "PUBLIC",
      },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt");

  res.json({
    list: allPosts,
    pages: Math.ceil(count / pageSize),
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: "PUBLIC" });
  post.views = post.views + 1;
  await post.save();

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error("Posts does not exist");
  }
});

const deletePostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    post.status = "DELETED";
    await post.save();
    res.json({
      message: "delete successful",
    });
  } else {
    res.status(404);
    throw new Error("Posts does not exist");
  }
});

const updatePosts = asyncHandler(async (req, res) => {
  const { title_en, text_en, desc_en, type } = req.body;
  const post = await Post.findOne({ _id: req.params.id });

  if (post) {
    post.title_en = title_en || post.title_en;
    post.text_en = text_en || post.text_en;
    post.desc_en = desc_en || post.desc_en;
    post.type = type || post.type;

    const files = req.files;

    if (files) {
      let filename_en = "";
      if (files.file_en) {
        filename_en = files.file_en[0].filename;
        post.filename_en = filename_en || post.filename_en;
      }
    }

    const updatedPost = await post.save();
    if (updatedPost) {
      res.status(200).json({
        message: "Update successful",
        data: updatedPost,
      });
    }
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

export { createPosts, getAllPosts, getPostById, updatePosts, deletePostById };
