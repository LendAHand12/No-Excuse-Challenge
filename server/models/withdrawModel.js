import mongoose from "mongoose";

const withdrawSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    hash: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Withdraw = mongoose.model("Withdraw", withdrawSchema);

export default Withdraw;
