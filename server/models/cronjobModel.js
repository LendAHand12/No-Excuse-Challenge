import mongoose from "mongoose";

const cronjob = mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    status: {
      type: String,
    },
    finishedAt: { type: Date },
    error: { type: String },
  },
  { timestamps: true }
);

const Cronjob = mongoose.model("Cronjob", cronjob);

export default Cronjob;
