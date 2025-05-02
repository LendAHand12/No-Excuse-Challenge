import asyncHandler from "express-async-handler";
import axios from "axios";
import Claim from "../models/claimModel.js";
import sendHewe from "../services/sendHewe.js";
import sendUsdt from "../services/sendUsdt.js";
import Withdraw from "../models/withdrawModel.js";
import { sendTelegramMessage } from "../utils/sendTelegram.js";
import { removeAccents } from "../utils/methods.js";
import mongoose from "mongoose";

const processingHeweUserIds = [];

const claimHewe = asyncHandler(async (req, res) => {
  const user = req.user;

  if (processingHeweUserIds.includes(user.id)) {
    return res.status(400).json({
      error: "Your withdraw request is already being processed. Please wait!",
    });
  }

  processingHeweUserIds.push(user.id);

  try {
    if (user.status !== "APPROVED") {
      throw new Error("Please verify your account");
    }
    // const response = await axios.post("https://serepay.net/api/payment/claimHewe", {
    //   amountClaim: user.availableHewe,
    //   address: user.heweWallet,
    // });

    if (user.availableHewe > 0) {
      const receipt = await sendHewe({
        amount: user.availableHewe,
        receiverAddress: user.walletAddress,
      });

      console.log({ receipt });

      const claimed = await Claim.create({
        userId: user.id,
        amount: user.availableHewe,
        hash: receipt.hash,
        coin: "HEWE",
      });

      user.claimedHewe = user.claimedHewe + user.availableHewe;
      user.availableHewe = 0;
      await user.save();

      const index = processingHeweUserIds.indexOf(user._id);
      if (index !== -1) {
        processingHeweUserIds.splice(index, 1);
      }

      res.status(200).json({
        message: "claim HEWE successful",
      });
    } else {
      const index = processingHeweUserIds.indexOf(user._id);
      if (index !== -1) {
        processingHeweUserIds.splice(index, 1);
      }

      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    const index = processingHeweUserIds.indexOf(user._id);
    if (index !== -1) {
      processingHeweUserIds.splice(index, 1);
    }
    res.status(400).json({ error: err.message });
  }
});

const processingUserIds = [];

const claimUsdt = asyncHandler(async (req, res) => {
  const user = req.user;

  if (processingUserIds.includes(user.id)) {
    return res.status(400).json({
      error: "Your withdraw request is already being processed. Please wait!",
    });
  }

  processingUserIds.push(user.id);

  // res.status(400).json({
  //   error:
  //     "This withdrawal function is under maintenance, please come back later",
  // });
  try {
    if (user.status !== "APPROVED") {
      throw new Error("Please verify your account");
    }

    if (user.availableUsdt > 0) {
      if (user.availableUsdt < 100) {
        const receipt = await sendUsdt({
          amount: user.availableUsdt - 1,
          receiverAddress: user.walletAddress,
        });
        const claimed = await Claim.create({
          userId: user.id,
          amount: user.availableUsdt,
          hash: receipt.hash,
          coin: "USDT",
        });

        user.claimedUsdt = user.claimedUsdt + user.availableUsdt;
        user.availableUsdt = 0;
        await user.save();

        const index = processingUserIds.indexOf(user._id);
        if (index !== -1) {
          processingUserIds.splice(index, 1);
        }

        res.status(200).json({
          message: "claim USDT successful",
        });
      } else {
        const withdraw = await Withdraw.create({
          userId: user.id,
          amount: user.availableUsdt,
        });
        user.availableUsdt = 0;
        await user.save();

        // await sendTelegramMessage({ userName: user.userId });

        const index = processingUserIds.indexOf(user._id);
        if (index !== -1) {
          processingUserIds.splice(index, 1);
        }

        res.status(200).json({
          message: "Withdrawal request has been sent to Admin. Please wait!",
        });
      }
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    const index = processingUserIds.indexOf(user._id);
    if (index !== -1) {
      processingUserIds.splice(index, 1);
    }
    res.status(400).json({
      error: err.message ? err.message.split(",")[0] : "Internal Error",
    });
  }
});

const getAllClaims = asyncHandler(async (req, res) => {
  let { pageNumber, coin, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  if (coin === "HEWE" || coin === "USDT") {
    matchStage.coin = coin;
  }

  const keywordRegex = keyword ? { $regex: removeAccents(keyword), $options: "i" } : null;

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  if (keywordRegex) {
    aggregationPipeline.push({
      $match: {
        "userInfo.userId": keywordRegex,
      },
    });
  }

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await Claim.aggregate([...aggregationPipeline, { $count: "total" }]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        coin: 1,
        amount: 1,
        hash: 1,
        createdAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const claims = await Claim.aggregate(aggregationPipeline);

  res.json({
    claims,
    pages: Math.ceil(count / pageSize),
  });
});

const getAllClaimsForExport = asyncHandler(async (req, res) => {
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

  const claims = await Claim.aggregate([
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

  const totalCount = await Claim.countDocuments(match);

  const result = [];

  for (let claim of claims) {
    result.push({
      user: claim.userInfo?.userId,
      email: claim.userInfo?.email,
      amount: claim.amount,
      coin: claim.coin,
      hash: claim.hash,
      createdAt: claim.createdAt,
    });
  }

  res.json({ totalCount, result });
});

const getAllClaimsOfUser = asyncHandler(async (req, res) => {
  const { user } = req;
  let { pageNumber, coin } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  // ✅ Ép kiểu ObjectId
  if (!mongoose.Types.ObjectId.isValid(user.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  matchStage.userId = new mongoose.Types.ObjectId(user.id);

  if (coin === "HEWE" || coin === "USDT") {
    matchStage.coin = coin;
  }

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await Claim.aggregate([...aggregationPipeline, { $count: "total" }]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        coin: 1,
        amount: 1,
        hash: 1,
        createdAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const claims = await Claim.aggregate(aggregationPipeline);

  res.json({
    claims,
    pages: Math.ceil(count / pageSize),
  });
});

export { claimHewe, claimUsdt, getAllClaims, getAllClaimsForExport, getAllClaimsOfUser };
