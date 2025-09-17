import asyncHandler from "express-async-handler";
import axios from "axios";
import Claim from "../models/claimModel.js";
import User from "../models/userModel.js";
import sendHewe from "../services/sendHewe.js";
import sendUsdt from "../services/sendUsdt.js";
import Withdraw from "../models/withdrawModel.js";
import { sendTelegramMessage } from "../utils/sendTelegram.js";
import { decodeCallbackToken, removeAccents } from "../utils/methods.js";
import mongoose from "mongoose";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import { getPriceAmc } from "../utils/getPriceAmc.js";

const claimHewe = asyncHandler(async (req, res) => {
  const { user } = req;

  // Nếu user đang xử lý claim HEWE rồi thì reject luôn
  if (user.isClaimingHewe) {
    return res.status(400).json({
      error: "Your HEWE claim is already being processed. Please wait!",
    });
  }

  try {
    // Đặt trạng thái đang xử lý
    user.isClaiming = true;
    await user.save();

    if (user.availableHewe > 0) {
      const receipt = await sendHewe({
        amount: user.availableHewe,
        receiverAddress: user.walletAddress,
      });

      await Claim.create({
        userId: user.id,
        amount: user.availableHewe,
        hash: receipt.hash,
        coin: "HEWE",
      });

      user.claimedHewe += user.availableHewe;
      user.availableHewe = 0;
      await user.save();

      res.status(200).json({
        message: "Claim HEWE successful",
      });
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    res.status(400).json({
      error: err.message || "Internal error",
    });
  } finally {
    // Reset lại trạng thái dù thành công hay lỗi
    await User.findByIdAndUpdate(user.id, { isClaiming: false });
  }
});

const claimUsdt = asyncHandler(async (req, res) => {
  const { token, amount } = req.body;
  const decode = decodeCallbackToken(token);

  if (!decode) {
    throw new Error("Internal Error");
  }

  const { userId } = decode;
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Unknown User");
  }

  // Nếu user đang xử lý claim rồi thì reject luôn
  if (user.isClaiming) {
    return res.status(400).json({
      error: "Your withdraw request is already being processed. Please wait!",
    });
  }

  try {
    // Đặt trạng thái đang xử lý
    user.isClaiming = true;
    await user.save();

    if (user.status !== "APPROVED" || user.facetecTid === "") {
      throw new Error("Please verify your account");
    }
    if (user.errLahCode === "OVER45") {
      throw new Error("Request denied");
    }

    if (user.availableUsdt > 0 && user.availableUsdt >= parseInt(amount)) {
      if (parseInt(amount) < 200 && user.paymentMethod === "") {
        const receipt = await sendUsdt({
          amount: amount - 1,
          receiverAddress: user.walletAddress,
        });

        await Claim.create({
          userId: user.id,
          amount: parseInt(amount),
          hash: receipt.hash,
          coin: "USDT",
        });

        user.claimedUsdt += parseInt(amount);
        user.availableUsdt -= parseInt(amount);
        await user.save();

        res.status(200).json({ message: "claim USDT successful" });
      } else {
        await Withdraw.create({
          userId: user.id,
          amount: parseInt(amount),
          method: user.paymentMethod,
          accountName: user.accountName,
          accountNumber: user.accountNumber,
        });

        user.availableUsdt -= parseInt(amount);
        await user.save();

        res.status(200).json({
          message: "Withdrawal request has been sent to Admin. Please wait!",
        });
      }
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    res.status(400).json({
      error: err.message ? err.message.split(",")[0] : "Internal Error",
    });
  } finally {
    // Reset trạng thái sau khi xử lý xong (dù success hay error)
    await User.findByIdAndUpdate(userId, { isClaiming: false });
  }
});

var processingAmcUserIds = [];

const claimAmc = asyncHandler(async (req, res) => {
  const { user } = req;

  if (processingAmcUserIds.includes(user._id)) {
    return res.status(400).json({
      error: "Your withdraw request is already being processed. Please wait!",
    });
  }

  processingAmcUserIds.push(user._id);

  try {
    if (user.status !== "APPROVED" || user.facetecTid === "") {
      throw new Error("Please verify your account");
    }

    if (user.availableAmc > 0) {
      // const receipt = await sendHewe({
      //   amount: user.availableAmc,
      //   receiverAddress: user.walletAddress,
      // });

      const claimed = await Claim.create({
        userId: user.id,
        amount: user.availableAmc,
        hash: "receipt.hash",
        coin: "AMC",
      });

      user.claimedAmc = user.claimedAmc + user.availableAmc;
      user.availableAmc = 0;
      await user.save();

      const index = processingAmcUserIds.indexOf(user.id);
      if (index !== -1) {
        processingAmcUserIds.splice(index, 1);
      }

      res.status(200).json({
        message: "claim AMC successful",
      });
    } else {
      const index = processingAmcUserIds.indexOf(user._id);
      if (index !== -1) {
        processingAmcUserIds.splice(index, 1);
      }

      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    const index = processingAmcUserIds.indexOf(user._id);
    if (index !== -1) {
      processingAmcUserIds.splice(index, 1);
    }
    res.status(400).json({ error: err.message });
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

const resetProcessing = asyncHandler(async (req, res) => {
  await User.updateMany({}, { $set: { isClaiming: false } });

  res.json({
    message: "Reset black list successfully",
  });
});

const getPrice = asyncHandler(async (req, res) => {
  const { coin } = req.body;
  const { user } = req;

  if (coin === "HEWE") {
    let responseHewe = await getPriceHewe();
    const hewePrice = responseHewe.data.ticker.latest;

    res.json({
      price: hewePrice,
      availableUsdt: user.availableUsdt,
    });
  } else if (coin === "AMC") {
    let responseAmc = await getPriceAmc();
    const amcPrice = responseAmc.data.result[0].p;

    res.json({
      price: amcPrice,
      availableUsdt: user.availableUsdt,
    });
  }
});

export {
  claimHewe,
  claimUsdt,
  getAllClaims,
  getAllClaimsForExport,
  getAllClaimsOfUser,
  resetProcessing,
  getPrice,
  claimAmc,
};
