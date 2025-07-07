import mongoose from "mongoose";

const moveSystemSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "PENDING",
    },
    approveBy: {
      type: String,
    },
    approveTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const MoveSystem = mongoose.model("MoveSystem", moveSystemSchema);

export default MoveSystem;
