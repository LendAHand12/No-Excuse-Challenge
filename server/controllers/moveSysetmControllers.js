import expressAsyncHandler from "express-async-handler";
import { decodeCallbackToken, removeAccents } from "../utils/methods.js";
import MoveSystem from "../models/moveSystemModel.js";
import User from "../models/userModel.js";

const moveSystemStart = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;

  const decode = decodeCallbackToken(token);

  if (decode) {
    const { userId } = decode;
    const user = await User.findById(userId);

    if (user) {
      const duplicate = await MoveSystem.findOne({ userId });
      if (duplicate) {
        throw new Error("You have already registered for the transfer.");
      } else {
        const data = await MoveSystem.create({
          userId,
          status: "PENDING",
        });

        res.json({ message: "Transfer registration successful" });
      }
    }
  }
});

const getAllMoveSystem = expressAsyncHandler(async (req, res) => {
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
  const countAggregation = await MoveSystem.aggregate([
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

  const list = await MoveSystem.aggregate(aggregationPipeline);

  res.json({
    list,
    pages: Math.ceil(count / pageSize),
  });
});

const updateMoveSystemStatus = expressAsyncHandler(async (req, res) => {
  const { status, id } = req.body;
  const { user } = req;

  try {
    const moveSystemData = await MoveSystem.findById(id);

    if (status === "APPROVED" && moveSystemData.status === "PENDING") {
      moveSystemData.status = "APPROVED";
      moveSystemData.approveBy = user.userId;
      moveSystemData.approveTime = new Date();

      await moveSystemData.save();
    }

    res.status(200).json({ message: "Approved"});
  } catch (err) {
    res.status(400).json({ error: "Internal Error" });
  }
});

export { moveSystemStart, getAllMoveSystem, updateMoveSystemStatus };
