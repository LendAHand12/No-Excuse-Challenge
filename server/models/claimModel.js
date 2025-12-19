import mongoose from "mongoose";

const claimSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    coin: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    withdrawalType: {
      type: String,
      enum: ["CRYPTO", "BANK"],
    },
    availableUsdtAfter: {
      type: Number,
      // Số dư USDT còn lại sau khi rút (chỉ cho USDT)
    },
    tax: {
      type: Number,
      // Thuế (10% của số tiền rút)
    },
    fee: {
      type: Number,
      // Phí giao dịch (1 USDT)
    },
    exchangeRate: {
      type: Number,
      // Tỷ giá quy đổi USDT sang VND (chỉ cho BANK withdrawal)
    },
    receivedAmount: {
      type: Number,
      // Số tiền thực tế nhận được (VND cho BANK, USDT cho CRYPTO)
    },
  },
  { timestamps: true }
);

// Add unique compound index to prevent duplicate claims
// This ensures that the same userId, amount, and hash combination cannot exist twice
claimSchema.index({ userId: 1, amount: 1, hash: 1 }, { unique: true });

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;
