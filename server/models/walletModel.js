import mongoose from "mongoose";

const walletSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["REGISTER", "ADMIN", "HOLD1", "HOLD2", "HOLD3", "HOLD4", "HOLD5"],
      default: "ADMIN",
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    updateAgent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
