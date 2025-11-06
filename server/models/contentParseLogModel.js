import mongoose from "mongoose";

const contentParseLogSchema = mongoose.Schema(
  {
    // Content gốc từ webhook
    originalContent: {
      type: String,
      required: true,
    },
    // Content đã trim
    contentTrimmed: {
      type: String,
    },
    // OrderId đã parsed từ content
    parsedOrderId: {
      type: String,
    },
    // Kết quả parse: success, failed, no_match
    parseStatus: {
      type: String,
      enum: ["success", "failed", "no_match"],
      required: true,
    },
    // Pattern đã match (nếu có): NEC_NEW, NEC_OLD, AMERITEC, FULL_CONTENT, NONE
    matchedPattern: {
      type: String,
      enum: ["NEC_NEW", "NEC_OLD", "AMERITEC", "FULL_CONTENT", "NONE"],
    },
    // Order có được tìm thấy không
    orderFound: {
      type: Boolean,
      default: false,
    },
    // OrderId của order đã tìm thấy (nếu có)
    foundOrderId: {
      type: String,
    },
    // Order status (nếu tìm thấy)
    foundOrderStatus: {
      type: String,
    },
    // Thông tin từ webhook
    webhookData: {
      sepayId: Number,
      gateway: String,
      transactionDate: String,
      accountNumber: String,
      code: String,
      transferType: String,
      transferAmount: Number,
      accumulated: Number,
      subAccount: String,
      referenceCode: String,
      description: String,
    },
    // Kết quả xử lý
    processingResult: {
      type: String,
      enum: ["success", "order_not_found", "order_already_processed", "amount_mismatch", "user_not_found", "error"],
    },
    // Error message (nếu có)
    errorMessage: {
      type: String,
    },
    // Response đã gửi về SePay
    responseSent: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
contentParseLogSchema.index({ parsedOrderId: 1 });
contentParseLogSchema.index({ parseStatus: 1 });
contentParseLogSchema.index({ orderFound: 1 });
contentParseLogSchema.index({ createdAt: -1 });
contentParseLogSchema.index({ "webhookData.sepayId": 1 });

const ContentParseLog = mongoose.model("ContentParseLog", contentParseLogSchema);

export default ContentParseLog;

