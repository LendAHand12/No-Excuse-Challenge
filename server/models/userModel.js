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
    status: {
      type: String,
      enum: ["UNVERIFY", "PENDING", "APPROVED", "LOCKED", "DELETED", "REJECTED"],
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
    errLahCode: {
      type: String,
      default: "",
      enum: ["", "TIER", "OVER35", "OVER45", "OVER90"],
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
    availableAmc: {
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
    claimedAmc: {
      type: Number,
      default: 0,
    },
    ranking: {
      type: Number,
      default: 0,
    },
    bonusRef: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      // enum: ["USER", "ADMIN", "ADMIN1", "ADMIN2"],
    },
    paymentStep: {
      type: Number,
      default: 0,
    },
    facetecTid: {
      type: String,
      default: "",
    },
    kycFee: {
      type: Boolean,
      default: false,
    },
    ageEstimate: {
      type: Number,
    },
    tryToTier2: {
      type: String,
      default: "",
      enum: ["", "YES", "DONE", "REDO"],
    },
    timeToTry: {
      type: Date,
    },
    changeCreatedAt: {
      type: Date,
    },
    lockKyc: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "VN",
      enum: ["", "VN", "US", "IN"],
    },
    paymentProcessed: {
      type: Boolean,
    },
    paymentUUID: {
      type: Array,
    },
    accountName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    timeRetryOver45: {
      type: Date,
    },
    doneChangeToDie: {
      type: Boolean,
      default: false,
    },
    preTier2Status: {
      type: String,
      enum: ["", "ACHIEVED", "PENDING", "APPROVED", "PASSED"],
      default: "",
    },
    timeOkPreTier2: {
      type: Date,
    },
    shortfallAmount: {
      type: Number,
      default: 0,
    },
    isClaiming: {
      type: Boolean,
      default: false,
    },
    currentShortfall: {
      type: Number,
      default: 0,
    },
    done62Id: {
      type: Boolean,
      default: false,
    },
    dieTime: {
      type: Date,
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
