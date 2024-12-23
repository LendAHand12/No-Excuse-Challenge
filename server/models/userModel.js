import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
    },
    walletAddress1: {
      type: String,
      unique: true,
      required: true,
    },
    walletAddress2: {
      type: String,
      unique: true,
    },
    walletAddress3: {
      type: String,
      unique: true,
    },
    walletAddress4: {
      type: String,
      unique: true,
    },
    walletAddress5: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    tier: {
      type: Number,
      default: 1,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    avatar: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["UNVERIFY", "PENDING", "APPROVED", "LOCKED", "DELETED"],
      default: "UNVERIFY",
    },
    imgFront: {
      type: String,
      default: "",
    },
    imgBack: {
      type: String,
      default: "",
    },
    fine: {
      type: Number,
      default: 0,
    },
    countPay: {
      type: Number,
      default: 0,
    },
    countChild: {
      type: Array,
      default: [0],
    },
    phone: {
      type: String,
      default: "",
    },
    currentLayer: [
      {
        type: Number,
        default: 0,
      },
    ],
    oldLayer: [
      {
        type: Number,
        default: 0,
      },
    ],
    idCode: {
      type: String,
      default: "",
    },
    buyPackage: {
      type: String,
      enum: ["A", "B", "C", ""],
      default: "",
    },
    continueWithBuyPackageB: {
      type: Boolean,
      default: true,
    },
    errLahCode: {
      type: String,
      default: "",
      enum: ["", "TIER", "OVER180", "OVER60", "OVER30"],
    },
    tierDate: {
      type: Date,
    },
    openLah: {
      type: Boolean,
      default: false,
    },
    closeLah: {
      type: Boolean,
      default: false,
    },
    adminChangeTier: {
      type: Boolean,
      default: false,
    },
    createBy: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    havePaid: {
      type: Boolean,
    },
    note: {
      type: String,
    },
    lockedTime: {
      type: Date,
      default: null,
    },
    deletedTime: {
      type: Date,
      default: null,
    },
    tier1Time: {
      type: Date,
      default: null,
    },
    tier2Time: {
      type: Date,
      default: null,
    },
    tier3Time: {
      type: Date,
      default: null,
    },
    tier4Time: {
      type: Date,
      default: null,
    },
    tier5Time: {
      type: Date,
      default: null,
    },
    hold: {
      type: String,
      enum: ["no", 1, 2, 3, 4, 5],
      default: "no",
    },
    holdLevel: {
      type: String,
      enum: ["no", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      default: "no",
    },
    oldParents: {
      type: Array,
      default: [],
    },
    totalHewe: {
      type: Number,
      default: 0,
    },
    hewePerDay: {
      type: Number,
      default: 0,
    },
    availableHewe: {
      type: Number,
      default: 0,
    },
    availableUsdt: {
      type: Number,
      default: 0,
    },
    claimedUsdt: {
      type: Number,
      default: 0,
    },
    claimedHewe: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      // enum: ["USER", "ADMIN", "ADMIN1", "ADMIN2"],
    },
  },
  {
    timestamps: true,
  }
);

// function to check of passwords are matching
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// encrypt password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
