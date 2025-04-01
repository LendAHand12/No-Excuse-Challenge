import mongoose from "mongoose";

const honorSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Honor = mongoose.model("Honor", honorSchema);

export default Honor;
