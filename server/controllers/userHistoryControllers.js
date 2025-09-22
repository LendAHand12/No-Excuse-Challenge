import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { removeAccents } from "../utils/methods.js";
import UserHistory from "../models/userHistoryModel.js";
import WalletConnectionHistory from "../models/walletConnectHistoryModel.js";

const getAllUserHisotry = asyncHandler(async (req, res) => {
  let { pageNumber, status, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  if (status && status !== "all") {
    matchStage.status = status.toLocaleLowerCase();
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

  console.log({ aggregationPipeline });

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await UserHistory.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);

  const count = countAggregation[0]?.total || 0;
  console.log({ page, count });

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { _id: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        status: 1,
        oldValue: 1,
        newValue: 1,
        field: 1,
        changedAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const list = await UserHistory.aggregate(aggregationPipeline);

  res.json({
    list,
    pages: Math.ceil(count / pageSize),
  });
});

const updateUserHistory = asyncHandler(async (req, res) => {
  const { status, id } = req.body;
  const { user } = req;

  try {
    const userHistory = await UserHistory.findById(id);
    const userData = await User.findById(userHistory.userId);

    if (userHistory.status === "pending" && status === "approve") {
      userData[userHistory.field] = userHistory.newValue;
      await userData.save();

      userHistory.status = "approved";
      userHistory.reviewedBy = user.userId;

      await userHistory.save();
    } else if (status === "reject") {
      userHistory.status = "rejected";
      userHistory.reviewedBy = user.userId;

      await userHistory.save();
    }

    res.status(200).json({ message: status === "approve" ? "Approved" : "Rejected!" });
  } catch (err) {
    res.status(400).json({ error: "Internal Error" });
  }
});

const connectWallet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { walletAddress, desc } = req.body;
  await WalletConnectionHistory.create({
    userId: user.id,
    walletAddress,
    userWalletAddress: user.walletAddress,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || "",
    status: "SUCCESS",
    desc,
  });

  res.json({ message: "Wallet connected successfully" });
});

const getAllConnectWallets = asyncHandler(async (req, res) => {
  let { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  const keywordRegex = keyword ? { $regex: removeAccents(keyword), $options: "i" } : null;

  const pipeline = [
    { $match: matchStage },

    // accountUser: chủ tài khoản (theo userId)
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "accountUser",
      },
    },
    {
      $unwind: {
        path: "$accountUser",
        preserveNullAndEmptyArrays: true,
      },
    },

    // connectorUser: người connect ví (theo walletAddress)
    {
      $lookup: {
        from: "users",
        localField: "walletAddress",
        foreignField: "walletAddress",
        as: "connectorUser",
      },
    },
    {
      $unwind: {
        path: "$connectorUser",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (keywordRegex) {
    pipeline.push({
      $match: {
        $or: [
          { "accountUser.userId": keywordRegex },
          { "accountUser.email": keywordRegex },
          { "accountUser.walletAddress": keywordRegex },
          { "connectorUser.userId": keywordRegex },
          { "connectorUser.email": keywordRegex },
          { "connectorUser.walletAddress": keywordRegex },
          { walletAddress: keywordRegex },
          { userWalletAddress: keywordRegex },
        ],
      },
    });
  }

  // Count trước khi phân trang
  const countAggregation = await WalletConnectionHistory.aggregate([
    ...pipeline,
    { $count: "total" },
  ]);
  const total = countAggregation[0]?.total || 0;

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        userId: 1,
        userWalletAddress: 1,
        walletAddress: 1,
        ipAddress: 1,
        userAgent: 1,
        desc: 1,
        status: 1,
        connectedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        accountUser: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
          phone: 1,
          status: 1,
        },
        connectorUser: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
          phone: 1,
          status: 1,
        },
      },
    }
  );

  const list = await WalletConnectionHistory.aggregate(pipeline);

  res.json({
    list,
    pages: Math.ceil(total / pageSize),
  });
});

export { getAllUserHisotry, updateUserHistory, connectWallet, getAllConnectWallets };
