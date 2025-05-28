// models/UserHistory.ts
import { Schema, model, Types } from "mongoose";

const userHistorySchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  field: { type: String, enum: ["email", "phone", "walletAddress"], required: true },
  oldValue: { type: String, required: true },
  newValue: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  changedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
});

export default model("UserHistory", userHistorySchema);
