import expressAsyncHandler from "express-async-handler";
import { createCallbackToken } from "../utils/methods.js";

const startKYC = expressAsyncHandler(async (req, res) => {
  const { user } = req;

  const token = createCallbackToken(user._id);
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/kyc?token=${token}`;

  const redirectToKYC = `${
    process.env.KYC_URL
  }/enroll.html?callback=${encodeURIComponent(callbackUrl)}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

const register = expressAsyncHandler(async (req, res) => {
  const { facetect_tid, user_id } = req.body; // dữ liệu do KYC trả về
  const { user } = req;

  try {
    if (user_id !== user.id) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.facetecTid = facetect_tid;
    user.status = "PENDING";

    await user.save();

    return res.json({ message: "Setup Face ID successfully" });
  } catch (error) {
    // return res.status(401).json({ message: "Invalid or expired token" });
    throw new Error("Invalid token");
  }
});

export { startKYC, register };
