import asyncHandler from "express-async-handler";
import axios from "axios";
import Claim from "../models/claimModel.js";
import sendHewe from "../services/sendHewe.js";
import sendUsdt from "../services/sendUsdt.js";
import Withdraw from "../models/withdrawModel.js";
import { sendTelegramMessage } from "../utils/sendTelegram.js";

const claimHewe = asyncHandler(async (req, res) => {
  const user = req.user;

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

      const claimed = await Claim.create({
        userId: user.id,
        amount: user.availableHewe,
        hash: receipt.blockHash,
        coin: "HEWE",
      });

      user.claimedHewe = user.claimedHewe + user.availableHewe;
      user.availableHewe = 0;
      await user.save();

      res.status(200).json({
        message: "claim HEWE successful",
      });
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const claimUsdt = asyncHandler(async (req, res) => {
  const user = req.user;

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
          hash: receipt.blockHash,
          coin: "USDT",
        });

        user.claimedUsdt = user.claimedUsdt + user.availableUsdt;
        user.availableUsdt = 0;
        await user.save();

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
  }
});

const getAllClaims = asyncHandler(async (req, res) => {
  let { pageNumber, coin } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 10;

  const count = await Claim.countDocuments({
    $and: [coin === "HEWE" || coin === "USDT" ? { coin } : {}],
  });

  const allClaims = await Claim.find({
    $and: [coin === "HEWE" || coin === "USDT" ? { coin } : {}],
  })
    .populate("userId", "_id userId email walletAddress")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt");

  res.json({
    claims: allClaims,
    pages: Math.ceil(count / pageSize),
  });
});

export { claimHewe, claimUsdt, getAllClaims };
