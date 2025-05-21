import mongoose from "mongoose";

const doubleKycSchema = mongoose.Schema(
  {
    userIdFrom: {
      type: String,
      require: true
    },
    userIdTo: {
      type: String,
      require: true
    },
  },
  {
    timestamps: true,
  }
);

const DoubleKyc = mongoose.model("DoubleKyc", doubleKycSchema);

export default DoubleKyc;
