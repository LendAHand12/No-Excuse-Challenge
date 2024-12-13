import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const changeUserSchema = mongoose.Schema(
  {
    newUserId: {
      type: String,
      required: true,
    },
    newPhone: {
      type: String,
      required: true,
    },
    newWalletAddress: {
      type: Array,
      required: true,
    },
    newEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELED"],
    },
    newImgFront: {
      type: String,
      default: "",
    },
    newImgBack: {
      type: String,
      default: "",
    },
    newIdCode: {
      type: String,
      default: "",
    },
    reasonRequest: {
      type: String,
      require: true,
    },
    reasonReject: {
      type: String,
    },
    oldUserId: {
      type: String,
      required: true,
    },
    oldUserName: {
      type: String,
      required: true,
    },
    oldWalletAddress: {
      type: Array,
    },
    oldEmail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ChangeUser = mongoose.model("ChangeUser", changeUserSchema);

export default ChangeUser;
