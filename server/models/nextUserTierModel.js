import mongoose from "mongoose";

// store the refresh tokens in the db
const nextUserTierSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    tier: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  { timestamps: true }
);

const NextUserTier = mongoose.model("NextUserTier", nextUserTierSchema);

export default NextUserTier;
