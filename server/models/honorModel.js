import mongoose from "mongoose";

const honorSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Honor = mongoose.model("Honor", honorSchema);

export default Honor;
