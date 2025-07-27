import mongoose from "mongoose";

const withdrawSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    hash: {
      type: String,
    },
    method: {
      type: String,
    },
    accountName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED", "CANCEL"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Withdraw = mongoose.model("Withdraw", withdrawSchema);

export default Withdraw;
