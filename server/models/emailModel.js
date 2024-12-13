import mongoose from "mongoose";

// store the refresh tokens in the db
const emailSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Email = mongoose.model("Email", emailSchema);

export default Email;
