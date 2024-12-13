import mongoose from "mongoose";

// store the refresh tokens in the db
const permissionSchema = mongoose.Schema(
  {
    role: {
      type: String,
      require: true,
      unique: true,
    },
    pagePermissions: [
      {
        page: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Page",
        },
        actions: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", permissionSchema);

export default Permission;
