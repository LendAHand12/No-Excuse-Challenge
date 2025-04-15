import asyncHandler from "express-async-handler";
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";

const getIncomeOfUser = asyncHandler(async (req, res) => {
  const { user } = req;
  let { pageNumber } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 10;

  const count = await Transaction.countDocuments({
    $and: [
      {
        userId_to: user._id,
      },
      {
        status: "SUCCESS",
      },
    ],
  });

  const allPayments = await Transaction.find({
    $and: [
      {
        userId_to: user._id,
      },
      {
        status: "SUCCESS",
      },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt");

  const results = [];
  for (let pay of allPayments) {
    let user = await User.findById(pay.userId);
    results.push({
      _id: pay._id,
      from: user.userId,
      tier: pay.tier,
      amount: pay.amount,
      userId: user.userId,
      email: user.email,
      type: pay.type,
      createdAt: pay.createdAt,
      isHoldRefund: pay.isHoldRefund,
    });
  }

  res.json({
    payments: results,
    pages: Math.ceil(count / pageSize),
  });
});

export { getIncomeOfUser };
