import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isRootAdmin: {
      type: Boolean,
      default: false,
    },
    // Role for permissions (e.g., "admin", "accountant", "media", etc.)
    role: {
      type: String,
      default: "admin",
    },
    // Google Authenticator
    googleAuthenticatorSecret: {
      type: String,
      default: "",
    },
    googleAuthenticatorEnabled: {
      type: Boolean,
      default: false,
    },
    // FaceTec
    facetecTid: {
      type: String,
      default: "",
    },
    faceRegistered: {
      type: Boolean,
      default: false,
    },
    // First login tracking
    firstLoginCompleted: {
      type: Boolean,
      default: false,
    },
    // Created by (reference to admin who created this)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// function to check if passwords are matching
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// encrypt password before saving
adminSchema.pre("save", async function (next) {
  const admin = this;
  if (!admin.isModified("password")) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);
  admin.password = hash;
  next();
});

// Indexes for better query performance
adminSchema.index({ email: 1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;


