import asyncHandler from "express-async-handler";
import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import Income from "../models/incomeModel.js";

const getIncomeOfUser = asyncHandler(async (req, res) => {
  const { user } = req;
  let { pageNumber, coin } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 10;

  let results = [];
  let count = 0;

  if (coin === "usdt") {
    count = await Transaction.countDocuments({
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

    for (let pay of allPayments) {
      let user = await User.findById(pay.userId);
      results.push({
        _id: pay._id,
        from: user?.userId || "Unknow",
        tier: pay.tier,
        amount: pay.amount,
        userId: user?.userId || "Unknow",
        email: user?.email || "Unknow",
        type: pay.type,
        createdAt: pay.createdAt,
        isHoldRefund: pay.isHoldRefund,
      });
    }
  } else {
    count = await Income.countDocuments({
      $and: [
        {
          userId: user._id,
        },
        {
          coin: "HEWE",
        },
      ],
    });

    const allPayments = await Income.find({
      $and: [
        {
          userId: user._id,
        },
        {
          coin: "HEWE",
        },
      ],
    })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort("-createdAt");

    results = allPayments;
  }

  res.json({
    payments: results,
    pages: Math.ceil(count / pageSize),
  });
});

export { getIncomeOfUser };
