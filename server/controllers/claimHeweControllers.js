import asyncHandler from "express-async-handler";
import axios from "axios";
import Claim from "../models/claimModel.js";
import sendHewe from "../services/sendHewe.js";
import sendUsdt from "../services/sendUsdt.js";

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

    // const receipt = await sendUsdt({
    //   amount: user.availableUsdt,
    //   receiverAddress: user.walletAddress,
    // });

    const claimed = await Claim.create({
      userId: user.id,
      amount: user.availableUsdt,
      hash: "hash",
      coin: "USDT",
    });

    user.claimedUsdt = user.claimedUsdt + user.availableUsdt;
    user.availableUsdt = 0;
    await user.save();

    res.status(200).json({
      message: "claim USDT successful",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export { claimHewe, claimUsdt };
