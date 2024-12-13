import mongoose from "mongoose";

const refundSchema = mongoose.Schema(
  {
    transId: {
      type: String,
      required: true,
    },
    address_from: {
      type: String,
    },
    address_to: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
    },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;
