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
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

export default Claim;
