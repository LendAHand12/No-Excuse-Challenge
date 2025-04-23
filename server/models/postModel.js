import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title_vn: {
      type: String,
    },
    title_en: {
      type: String,
    },
    banner: {
      type: String,
    },
    text_en: {
      type: String,
    },
    desc_en: {
      type: String,
    },
    cid: {
      type: String,
    },
    mid: {
      type: String,
    },
    type: {
      /* text or file */ type: String,
    },
    filename_en: {
      type: String,
    },
    views: {
      type: Number,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
