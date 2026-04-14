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
    withdrawalType: {
      type: String,
      enum: ["CRYPTO", "BANK"],
      default: "CRYPTO",
    },
    coin: {
      type: String,
      enum: ["USDT", "HEWE"],
      default: "USDT",
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
    bankCode: {
      type: String,
    },
    bankName: {
      type: String,
    },
    // For bank withdrawal
    exchangeRate: {
      type: Number,
    },
    receivedAmount: {
      type: Number, // Amount in VND after tax
    },
    tax: {
      type: Number, // Tax amount (10% of USDT amount * exchangeRate for BANK, or 10% of amount for CRYPTO)
    },
    fee: {
      type: Number, // Transaction fee (1 USDT converted to VND for BANK, or 1 USDT for CRYPTO)
    },
    actualAmount: {
      type: Number, // Actual amount to send after tax and fee (for CRYPTO only)
    },
    // Admin processing info
    qrCode: {
      type: String, // QR code image URL or data
    },
    transferContent: {
      type: String, // Transfer content created by admin
    },
    reason: {
      type: String,
    },
    processedBy: {
      type: String,
      ref: "User",
    },
    processedAt: {
      type: Date,
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
