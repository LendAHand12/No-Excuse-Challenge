import mongoose from "mongoose";

// store the refresh tokens in the db
const pageSettingSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    val_vn: {},
    val_en: {},
  },
  { timestamps: true }
);

const PageSetting = mongoose.model("PageSetting", pageSettingSchema);

export default PageSetting;
