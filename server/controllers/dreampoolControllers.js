import expressAsyncHandler from "express-async-handler";
import Honor from "../models/honorModel.js";
import Transaction from "../models/transactionModel.js";
import Config from "../models/configModel.js";
import User from "../models/userModel.js";

const getDreamPool = expressAsyncHandler(async (req, res) => {
  const { tier } = req.query;

  const count = await Transaction.countDocuments({
    type: "PIG",
    status: "SUCCESS",
    tier: parseInt(tier),
  });

  const allBreakers = await Honor.find({})
    .populate("userId", "_id userId email")
    .sort("-createdAt");

  const pigConfig = await Config.findOne({ label: `PIG${tier}` });

  res.json({
    dreampool: count * process.env[`DREAMPOOL_AMOUNT_TIER${tier}`] + parseInt(pigConfig.value),
    allBreakers,
    dreampool_fee: process.env[`DREAMPOOL_AMOUNT_TIER${tier}`],
  });
});

const updateDreamPool = expressAsyncHandler(async (req, res) => {
  const { totalDreampool, newHonors, tier } = req.body;
  const pigConfig = await Config.findOne({ label: `PIG${tier}` });

  if (totalDreampool !== pigConfig.value) {
    const count = await Transaction.countDocuments({
      type: "PIG",
      status: "SUCCESS",
      tier,
    });

    const newPigConfigNumber =
      parseInt(totalDreampool) - count * process.env[`DREAMPOOL_AMOUNT_TIER${tier}`];
    pigConfig.value = newPigConfigNumber;
  }

  await pigConfig.save();

  for (let userHonor of newHonors) {
    const user = await User.findById(userHonor.value);
    user.availableUsdt = user.availableUsdt + 10;
    user.bonusRef = true;

    await user.save();
    await Honor.create({
      userId: user._id,
    });
  }

  res.json({ message: "Update successfuly" });
});

const getUserForUpdateDreampool = expressAsyncHandler(async (req, res) => {
  const honoredUserIds = await Honor.find().distinct("userId");

  const usersNotYetHonored = await User.find({
    _id: { $nin: honoredUserIds },
    status: "APPROVED",
    isAdmin: false,
    countPay: 13,
  }).select("_id userId");

  res.json({
    usersNotYetHonored,
  });
});

const getAllDreampoolForExport = expressAsyncHandler(async (req, res) => {
  let fromDate, toDate;
  let match = {};

  if (req.body.fromDate) {
    fromDate = req.body.fromDate.split("T")[0];
    match.createdAt = {
      $gte: new Date(new Date(fromDate).valueOf() + 1000 * 3600 * 24),
    };
  }
  if (req.body.toDate) {
    toDate = req.body.toDate.split("T")[0];
    match.createdAt = {
      ...match.createdAt,
      $lte: new Date(new Date(toDate).valueOf() + 1000 * 3600 * 24),
    };
  }

  const claims = await Honor.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users", // tên collection User (nên viết thường và dạng số nhiều)
        localField: "userId", // field trong Claim
        foreignField: "_id", // field trong User
        as: "userInfo", // tên field chứa dữ liệu join
      },
    },
    {
      $unwind: "$userInfo", // biến mảng userInfo thành object
    },
    { $sort: { createdAt: -1 } },
  ]);

  const totalCount = await Honor.countDocuments(match);

  const result = [];

  for (let claim of claims) {
    result.push({
      user: claim.userInfo?.userId,
      email: claim.userInfo?.email,
      createdAt: claim.createdAt,
    });
  }

  res.json({ totalCount, result });
});

export { getDreamPool, updateDreamPool, getUserForUpdateDreampool, getAllDreampoolForExport };
