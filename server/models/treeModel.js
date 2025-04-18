import mongoose from "mongoose";

// store the refresh tokens in the db
const treeSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    tier: {
      type: Number,
      default: 1,
      required: true,
    },
    children: [{ type: String }],
    parentId: {
      type: String,
    },
    refId: {
      type: String,
    },
    buyPackage: {
      type: String,
      enum: ["A", "B", "C", ""],
      default: "",
    },
    indexOnLevel: {
      type: Number,
      default: 0,
    },
    isSubId: {
      type: Boolean,
      default: false
    },
    countChild: {
      type: Number,
      default: 0
    },
    income: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Tree = mongoose.model("Tree", treeSchema);

export default Tree;
