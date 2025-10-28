import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    userCountPay: {
      type: Number,
    },
    tier: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["PAYMENT", "REFUND", "OTHER"],
      default: "PAYMENT",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    // Bank information
    bankTransactionId: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    accountName: {
      type: String,
    },
    bankCode: {
      type: String,
    },
    bankName: {
      type: String,
    },
    // Transfer content
    transferContent: {
      type: String,
    },
    // Processing info
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: String,
    },
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ bankTransactionId: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
