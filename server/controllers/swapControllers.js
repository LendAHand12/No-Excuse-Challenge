import asyncHandler from "express-async-handler";
import Withdraw from "../models/withdrawModel.js";
import User from "../models/userModel.js";
import { removeAccents } from "../utils/methods.js";
import mongoose from "mongoose";
import Swap from "../models/swapModel.js";

const getAllSwap = asyncHandler(async (req, res) => {
  let { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

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
  const countAggregation = await Swap.aggregate([...aggregationPipeline, { $count: "total" }]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        coinFrom: 1,
        coinTo: 1,
        amountFrom: 1,
        amountTo: 1,
        price: 1,
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

  const swaps = await Swap.aggregate(aggregationPipeline);

  res.json({
    swaps,
    pages: Math.ceil(count / pageSize),
  });
});

const requestSwap = asyncHandler(async (req, res) => {
  const user = req.user;
  const { coinForm, coinTo, amountFrom, amountTo, price } = req.body;

  try {
    if (amountFrom > user.availableUsdt) {
      throw new Error("Insufficient balance in account");
    } else {
      console.log({
        userId: user.id,
        coinForm,
        coinTo,
        amountFrom,
        amountTo,
        price,
      });

      const swap = await Swap.create({
        userId: user.id,
        coinForm,
        coinTo,
        amountFrom: parseInt(amountFrom),
        amountTo: parseInt(amountTo),
        price: parseInt(price),
      });

      if (coinTo === "HEWE") {
        user.availableHewe = parseInt(user.availableHewe) + parseInt(amountTo);
      }

      if (coinTo === "AMC") {
        user.availableAmc = parseInt(user.availableAmc) + parseInt(amountTo);
      }

      user.availableUsdt = parseInt(user.availableUsdt) - parseInt(amountFrom);

      await user.save();

      res.status(200).json({ message: "Swap completed successfully!" });
    }
  } catch (err) {
    console.log({ err });
    res.status(400).json({ error: "Internal Error" });
  }
});

const getSwapsOfUser = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const aggregationPipeline = [
    { $match: { userId } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        coinFrom: 1,
        coinTo: 1,
        amountFrom: 1,
        amountTo: 1,
        price: 1,
        createdAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    },
  ];

  const swaps = await Swap.aggregate(aggregationPipeline);

  res.json({ swaps });
});

export { getAllSwap, requestSwap, getSwapsOfUser };
