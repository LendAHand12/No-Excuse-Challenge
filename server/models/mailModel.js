import mongoose from "mongoose";
const mailSchema = mongoose.Schema(
  {
    to: {
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

const Mail = mongoose.model("Mail", mailSchema);

export default Mail;
