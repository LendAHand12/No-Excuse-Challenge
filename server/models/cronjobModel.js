import mongoose from "mongoose";

const cronjob = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Cronjob = mongoose.model("Cronjob", cronjob);

export default Cronjob;
