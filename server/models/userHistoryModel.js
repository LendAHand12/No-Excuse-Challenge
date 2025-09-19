// models/UserHistory.ts
import { Schema, model, Types } from "mongoose";

const userHistorySchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  field: { type: String, required: true },
  oldValue: { type: Schema.Types.Mixed, required: true },
  newValue: { type: Schema.Types.Mixed, required: true },
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
