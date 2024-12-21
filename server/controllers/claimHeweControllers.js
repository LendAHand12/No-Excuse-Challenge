import asyncHandler from "express-async-handler";
import { claimHeweFunc } from "../utils/claimHeweSerepay";

const claimHewe = asyncHandler(async (req, res) => {
  const user = req.user;

  try {
    const response = await claimHeweFunc({
      amountClaim: user.avalableHewe,
      address: user.walletAddress1,
    });
    console.log({ response });

    res.status(200).json({
      message: "claim successful",
    });
  } catch (err) {
    res.status(400);
    throw new Error("Internal error");
  }
});

export { claimHewe };
