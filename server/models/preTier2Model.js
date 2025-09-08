import mongoose from "mongoose";

const PreTier2Schema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    achievedTime: {
      type: Date,
    },
    passedTime: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "ACHIEVED", "PASSED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const PreTier2 = mongoose.model("PreTier2", PreTier2Schema);

export default PreTier2;
