import mongoose from "mongoose";
const configSchema = mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
    },
    value: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Config = mongoose.model("Config", configSchema);

export default Config;
