import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { removeAccents } from "../utils/methods.js";
import UserHistory from "../models/userHistoryModel.js";

const getAllUserHisotry = asyncHandler(async (req, res) => {
  let { pageNumber, status, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  if (status && status !== "all") {
    matchStage.status = status;
  }

  const keywordRegex = keyword
    ? { $regex: removeAccents(keyword), $options: "i" }
    : null;

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
  const countAggregation = await UserHistory.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
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
  console.log({ id, status });

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

    res
      .status(200)
      .json({ message: status === "approve" ? "Approved" : "Rejected!" });
  } catch (err) {
    res.status(400).json({ error: "Internal Error" });
  }
});

export { getAllUserHisotry, updateUserHistory };
