import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deleteUserSchema = mongoose.Schema(
  {
    userId: {
      type: String,
    },
    oldId: {
      type: String,
    },
    walletAddress: {
      type: Array,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    parentId: {
      type: String,
    },
    refId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DeleteUser = mongoose.model("DeleteUser", deleteUserSchema);

export default DeleteUser;
