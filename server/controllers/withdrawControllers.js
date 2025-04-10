import asyncHandler from "express-async-handler";
import Withdraw from "../models/withdrawModel.js";
import User from "../models/userModel.js";

const getAllWithdraws = asyncHandler(async (req, res) => {
  const { pageNumber, status } = req.query;
  const page = Number(pageNumber) || 1;
  const searchStatus = status === "all" ? "" : status;

  const pageSize = 20;

  const query = { status: searchStatus || { $exists: true } };

  const count = await Withdraw.countDocuments(query);

  const withdraws = await Withdraw.find(query)
    .populate({
      path: "userId",
      model: "User",
      select: "userId email walletAddress",
    })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt")
    .exec();

  res.status(200).json({
    pages: Math.ceil(count / pageSize),
    withdraws,
  });
});

const updateWithdraw = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hash, status } = req.body;

  try {
    const withdraw = await Withdraw.findById(id);
    const user = await User.findById(withdraw.userId);
    if (status === "APPROVED") {
      withdraw.hash = hash;
      user.claimedUsdt = user.claimedUsdt + user.availableUsdt;
    }
    if (status === "CANCEL") {
      user.availableUsdt = user.availableUsdt + withdraw.amount;
    }
    withdraw.status = status;
    await user.save();
    await withdraw.save();

    res.status(200).json({ message: status === "APPROVED" ? "Withdraw successful" : "Cancel!" });
  } catch (err) {
    res.status(400).json({ error: "Internal Error" });
  }
});

export { getAllWithdraws, updateWithdraw };
