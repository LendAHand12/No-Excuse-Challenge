import mongoose from "mongoose";

const swapSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coinForm: {
      type: String,
      required: true,
    },
    coinTo: {
      type: String,
      required: true,
    },
    amountFrom: {
      type: Number,
      required: true,
    },
    amountTo: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Swap = mongoose.model("Swap", swapSchema);

export default Swap;
