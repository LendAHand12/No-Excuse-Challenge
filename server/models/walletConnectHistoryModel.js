import mongoose from "mongoose";

const walletConnectionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userWalletAddress: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
walletConnectionHistorySchema.index({ userId: 1 });
walletConnectionHistorySchema.index({ walletAddress: 1 });
walletConnectionHistorySchema.index({ userWalletAddress: 1 });
walletConnectionHistorySchema.index({ createdAt: -1 });
walletConnectionHistorySchema.index({ userId: 1, createdAt: -1 });
walletConnectionHistorySchema.index({ walletAddress: 1, createdAt: -1 });

const WalletConnectionHistory = mongoose.model(
  "WalletConnectionHistory",
  walletConnectionHistorySchema
);

export default WalletConnectionHistory;
