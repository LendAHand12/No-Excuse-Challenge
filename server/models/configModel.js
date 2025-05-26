import mongoose from "mongoose";
const configSchema = mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
    },
    type: {
      type: String,
      default: "string"
    }
  },
  { timestamps: true }
);

const Config = mongoose.model("Config", configSchema);

export default Config;
