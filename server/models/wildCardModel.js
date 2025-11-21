import mongoose from "mongoose";

const wildCardSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardType: {
      type: String,
      enum: ["TIER2_REWARD", "REFERRAL_REWARD"], // TIER2_REWARD: từ Tier 2, REFERRAL_REWARD: từ giới thiệu 5 người
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "USED", "EXPIRED"],
      default: "ACTIVE",
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedBy: {
      type: String,
      enum: ["USER", "ADMIN", "AUTO"], // AUTO: tự động thêm tay
      default: null,
    },
    appliedToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Nếu admin dùng thay cho user khác
    },
    // Metadata
    sourceInfo: {
      type: String, // Thông tin nguồn gốc (ví dụ: "Tier 2 reward", "5 referrals")
      default: "",
    },
    expiresAt: {
      type: Date,
      default: null, // Có thể set expiry nếu cần
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
wildCardSchema.index({ userId: 1, status: 1 });
wildCardSchema.index({ userId: 1, cardType: 1 });

const WildCard = mongoose.model("WildCard", wildCardSchema);

export default WildCard;

