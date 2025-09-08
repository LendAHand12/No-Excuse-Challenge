import mongoose from "mongoose";

const incomeSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    coin: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    from: {
      type: String,
    },
  },
  { timestamps: true }
);

const Income = mongoose.model("Income", incomeSchema);

export default Income;
