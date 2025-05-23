import mongoose from "mongoose";

const doubleKycSchema = mongoose.Schema(
  {
    userIdFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userIdTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DoubleKyc = mongoose.model("DoubleKyc", doubleKycSchema);

export default DoubleKyc;
