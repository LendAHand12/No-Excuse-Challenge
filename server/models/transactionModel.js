import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userCountPay: {
      type: Number,
    },
    tier: {
      type: Number,
      default: 1,
    },
    userId_ref: {
      type: String,
    },
    userId_to: {
      type: String,
      required: true,
    },
    username_ref: {
      type: String,
    },
    username_to: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    isHoldRefund: {
      type: Boolean,
      default: false,
    },
    buyPackage: {
      type: String,
      enum: ["A", "B", "C", ""],
      default: "A",
    },
    refBuyPackage: {
      type: String,
      enum: ["", "A", "B", "C"],
      default: "A",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
