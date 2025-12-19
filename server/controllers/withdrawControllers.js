import asyncHandler from "express-async-handler";
import Withdraw from "../models/withdrawModel.js";
import User from "../models/userModel.js";
import Claim from "../models/claimModel.js";
import Notification from "../models/notificationModel.js";
import { removeAccents } from "../utils/methods.js";
import mongoose from "mongoose";
import moment from "moment";

const getAllWithdraws = asyncHandler(async (req, res) => {
  let { pageNumber, status, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  if (status && status !== "all") {
    matchStage.status = status;
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
  const countAggregation = await Withdraw.aggregate([...aggregationPipeline, { $count: "total" }]);
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
        method: 1,
        withdrawalType: 1,
        exchangeRate: 1,
        receivedAmount: 1,
        tax: 1,
        fee: 1,
        transferContent: 1,
        processedBy: 1,
        processedAt: 1,
        createdAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
          accountName: 1,
          accountNumber: 1,
          bankCode: 1,
          bankName: 1,
          paymentMethod: 1,
        },
      },
    }
  );

  const withdraws = await Withdraw.aggregate(aggregationPipeline);

  res.json({
    withdraws,
    pages: Math.ceil(count / pageSize),
  });
});

const getAllWithdrawsForExport = asyncHandler(async (req, res) => {
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

  const withdraws = await Withdraw.aggregate([
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

  const totalCount = await Withdraw.countDocuments(match);

  const result = [];

  for (let withdraw of withdraws) {
    result.push({
      user: withdraw.userInfo?.userId,
      email: withdraw.userInfo?.email,
      amount: withdraw.amount,
      status: withdraw.status,
      hash: withdraw.hash,
      createdAt: withdraw.createdAt,
      method: withdraw.method,
    });
  }

  res.json({ totalCount, result });
});

const updateWithdraw = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hash, status, transferContent, cancelReason } = req.body;
  const { user: admin } = req;

  try {
    // Use findOneAndUpdate with condition to prevent race condition
    // Only update if status is still PENDING (atomic operation)
    let withdraw;
    if (status === "APPROVED") {
      // For APPROVED: Only update if current status is PENDING
      withdraw = await Withdraw.findOneAndUpdate(
        { _id: id, status: "PENDING" },
        {
          $set: {
            hash: hash || "",
            status: "APPROVED",
            processedBy: admin.id,
            processedAt: new Date(),
            ...(transferContent && { transferContent }),
          },
        },
        { new: true }
      );

      if (!withdraw) {
        res.status(400);
        throw new Error("Withdraw request not found or already processed");
      }

      const user = await User.findById(withdraw.userId);
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      if (withdraw.withdrawalType === "BANK") {
        // Bank withdrawal: Save transfer content and admin processing info
        // Use transferContent as hash for bank transfers
        const claimHash = transferContent || `BANK_${withdraw._id}_${Date.now()}`;

        // Check if Claim already exists with same userId, amount, and hash
        const existingClaim = await Claim.findOne({
          userId: withdraw.userId,
          amount: withdraw.amount,
          hash: claimHash,
        });

        if (existingClaim) {
          res.status(400);
          throw new Error("Claim already exists for this withdrawal");
        }

        // Create claim record for bank withdrawal
        await Claim.create({
          userId: withdraw.userId,
          amount: withdraw.amount,
          coin: "USDT",
          hash: claimHash,
          withdrawalType: "BANK",
          availableUsdtAfter: user.availableUsdt, // Lưu số dư còn lại
          tax: withdraw.tax || 0, // Thuế (USDT)
          fee: withdraw.fee || 0, // Phí giao dịch (USDT)
          exchangeRate: withdraw.exchangeRate || 0, // Tỷ giá quy đổi
          receivedAmount: withdraw.receivedAmount || 0, // Số tiền thực tế nhận được (USDT)
        });
      } else {
        // Crypto withdrawal: Update claimed USDT
        user.claimedUsdt = user.claimedUsdt + withdraw.amount;

        // Calculate receivedAmount for CRYPTO withdrawal
        const amountUsdt = withdraw.amount || 0;
        const tax = withdraw.tax || 0;
        const fee = withdraw.fee || 0;
        const receivedAmount = amountUsdt - tax - fee; // Số tiền thực tế nhận được (USDT)

        // Create claim record for crypto withdrawal
        // Use transaction hash from blockchain
        const claimHash = hash || `CRYPTO_${withdraw._id}_${Date.now()}`;

        // Check if Claim already exists with same userId, amount, and hash
        const existingClaim = await Claim.findOne({
          userId: withdraw.userId,
          amount: withdraw.amount,
          hash: claimHash,
        });

        if (existingClaim) {
          res.status(400);
          throw new Error("Claim already exists for this withdrawal");
        }

        // Create claim record for crypto withdrawal
        await Claim.create({
          userId: withdraw.userId,
          amount: withdraw.amount,
          coin: "USDT",
          hash: claimHash,
          withdrawalType: "CRYPTO",
          availableUsdtAfter: user.availableUsdt, // Lưu số dư còn lại
          tax: tax, // Thuế (USDT)
          fee: fee, // Phí giao dịch (USDT)
          receivedAmount: receivedAmount, // Số tiền thực tế nhận được (USDT)
        });

        await user.save();
      }

      const processedAt = withdraw.processedAt || new Date();

      // Create notification for approved withdrawal
      const processedTime = moment(processedAt).format("DD/MM/YYYY HH:mm:ss");
      let amountText = "";
      if (withdraw.withdrawalType === "BANK") {
        const receivedAmountUsdt = withdraw.receivedAmount || withdraw.amount;
        const receivedAmountVnd =
          withdraw.receivedAmount && withdraw.exchangeRate
            ? Math.floor(withdraw.receivedAmount * withdraw.exchangeRate)
            : 0;
        amountText =
          receivedAmountVnd > 0
            ? `${receivedAmountUsdt.toLocaleString(
                "vi-VN"
              )} USDT (${receivedAmountVnd.toLocaleString("vi-VN")} VND)`
            : `${receivedAmountUsdt.toLocaleString("vi-VN")} USDT`;
      } else {
        const receivedAmount = (withdraw.amount || 0) - (withdraw.tax || 0) - (withdraw.fee || 0);
        amountText = `${receivedAmount.toLocaleString("vi-VN")} USDT`;
      }

      await Notification.create({
        userId: withdraw.userId,
        title: "Yêu cầu rút tiền đã được giải quyết",
        message: `Yêu cầu rút tiền của bạn đã được giải quyết vào lúc ${processedTime} với số tiền ${amountText}.`,
        type: "SUCCESS",
        createdBy: admin.id,
      });
    } else if (status === "CANCEL") {
      // For CANCEL: Only update if current status is PENDING
      withdraw = await Withdraw.findOneAndUpdate(
        { _id: id, status: "PENDING" },
        {
          $set: {
            status: "CANCEL",
            cancelReason: cancelReason || "Không có lý do cụ thể",
          },
        },
        { new: true }
      );

      if (!withdraw) {
        res.status(400);
        throw new Error("Withdraw request not found or already processed");
      }

      const user = await User.findById(withdraw.userId);
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Refund USDT to user's available balance
      user.availableUsdt = user.availableUsdt + withdraw.amount;
      await user.save();

      // Create notification for cancelled withdrawal
      const reason = cancelReason || "Không có lý do cụ thể";
      const amountText = `${withdraw.amount.toLocaleString("vi-VN")} USDT`;
      await Notification.create({
        userId: withdraw.userId,
        title: "Rút tiền thất bại",
        message: `Yêu cầu rút tiền ${amountText} đã bị hủy với lí do: ${reason}`,
        type: "ERROR",
        createdBy: admin.id,
      });
    } else {
      res.status(400);
      throw new Error("Invalid status");
    }

    res.status(200).json({ message: status === "APPROVED" ? "Withdraw successful" : "Cancel!" });
  } catch (err) {
    console.error("Error updating withdraw:", err);
    res.status(400).json({ error: "Internal Error" });
  }
});

const getWithdrawsOfUser = asyncHandler(async (req, res) => {
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
    },
  ];

  const withdraws = await Withdraw.aggregate(aggregationPipeline);

  res.json({ withdraws });
});

export { getAllWithdraws, updateWithdraw, getAllWithdrawsForExport, getWithdrawsOfUser };
