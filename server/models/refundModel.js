import mongoose from "mongoose";

const refundSchema = mongoose.Schema(
  {
    transId: {
      type: String,
      required: true,
    },
    userId_from: {
      type: String,
      required: true,
    },
    userId_to: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;
