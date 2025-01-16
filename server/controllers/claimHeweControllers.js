import asyncHandler from "express-async-handler";
import axios from "axios";
import Claim from "../models/claimModel.js";
import sendHewe from "../services/sendHewe.js";
import sendUsdt from "../services/sendUsdt.js";
import Withdraw from "../models/withdrawModel.js";

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

  try {
    if (user.status !== "APPROVED") {
      throw new Error("Please verify your account");
    }

    if (user.availableUsdt > 0) {
      if (user.availableUsdt < 100) {
        // const receipt = await sendUsdt({
        //   amount: user.availableUsdt,
        //   receiverAddress: user.walletAddress,
        // });

        const claimed = await Claim.create({
          userId: user.id,
          amount: user.availableUsdt,
          // hash: receipt.blockHash,
          hash: "receipt.blockHash",
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

        user.claimedUsdt = user.claimedUsdt + user.availableUsdt;
        user.availableUsdt = 0;
        await user.save();

        res.status(200).json({
          message: "Withdrawal request has been sent to Admin. Please wait!",
        });
      }
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    res.status(400).json({ error: err.message ? err.message.split(",")[0] : "Internal Error" });
  }
});

export { claimHewe, claimUsdt };
