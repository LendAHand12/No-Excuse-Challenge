import asyncHandler from "express-async-handler";
import axios from "axios";

const claimHewe = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log({ user });

  try {
    if (user.status !== "APPROVED") {
      throw new Error("Please verify your account");
    }
    // const response = await axios.post("https://serepay.net/api/payment/claimHewe", {
    //   amountClaim: user.availableHewe,
    //   address: user.walletAddress,
    // });
    // console.log({ response: response });
    // console.log({ responseData: response.data });

    user.claimedHewe = user.claimedHewe + user.availableHewe;
    user.availableHewe = 0;
    await user.save();

    res.status(200).json({
      message: "claim successful",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export { claimHewe };
