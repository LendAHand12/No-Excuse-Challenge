import mongoose from "mongoose";

const changeOrderHistorySchema = mongoose.Schema(
  {
    userIdFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userIdTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderFrom: {
      type: Number,
      required: true,
    },
    orderTo: {
      type: Number,
      required: true,
    },
    approveBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const ChangeOrderHistory = mongoose.model("ChangeOrderHistory", changeOrderHistorySchema);

export default ChangeOrderHistory;
