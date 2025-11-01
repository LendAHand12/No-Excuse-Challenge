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
      type: Number, // Tax amount (10% of USDT amount * exchangeRate)
    },
    // Admin processing info
    qrCode: {
      type: String, // QR code image URL or data
    },
    transferContent: {
      type: String, // Transfer content created by admin
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
