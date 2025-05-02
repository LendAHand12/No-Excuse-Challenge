import expressAsyncHandler from "express-async-handler";
import { createCallbackToken } from "../utils/methods.js";

const startKYC = expressAsyncHandler(async (req, res) => {
  const { user } = req;

  const token = createCallbackToken(user._id);
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/kyc/result?token=${token}`;

  const redirectToKYC = `${process.env.KYC_URL}/enroll?callback=${encodeURIComponent(callbackUrl)}`;

  res.json({ url: redirectToKYC });
});

const callback = expressAsyncHandler(async (req, res) => {
  const { token } = req.query;
  const kycResult = req.body; // dữ liệu do KYC trả về
  const { user } = req;

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);

    if (decoded.userId !== user.id) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isKyc = true;
    user.status = "APPROVED";

    return res.json({ message: "Setup Face ID successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export { startKYC, callback };
