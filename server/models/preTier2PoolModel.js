import mongoose from "mongoose";

const PreTier2PoolSchema = mongoose.Schema(
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
    status: {
      type: String,
      required: true,
      enum: ["OUT", "IN"],
    },
  },
  { timestamps: true }
);

const PreTier2Pool = mongoose.model("PreTier2Pool", PreTier2PoolSchema);

export default PreTier2Pool;
