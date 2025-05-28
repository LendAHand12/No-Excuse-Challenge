import expressAsyncHandler from "express-async-handler";
import { createCallbackToken, getFaceTecData } from "../utils/methods.js";
import User from "../models/userModel.js";
import Config from "../models/configModel.js";
import mongoose from "mongoose";
import DoubleKyc from "../models/doubleKycModel.js";

const startKYC = expressAsyncHandler(async (req, res) => {
  const { user } = req;

  const token = createCallbackToken(user._id);
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/kyc?token=${token}`;

  const redirectToKYC = `${process.env.KYC_URL}/enroll.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

const claimKYC = expressAsyncHandler(async (req, res) => {
  const { coin } = req.body;
  const { user } = req;

  const token = createCallbackToken(user._id);
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/claim?coin=${coin}&token=${token}`;

  const redirectToKYC = `${process.env.KYC_URL}/verify.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

const register = expressAsyncHandler(async (req, res) => {
  const { facetect_tid, user_id } = req.body;
  const { user } = req;

  try {
    if (user_id !== user.id) {
      return res.status(400).json({ message: "Unknown user" });
    }

    const faceTecDataRes = await getFaceTecData(`ID_${user.id}`);
    const faceTecData = faceTecDataRes.data[0];
    const { isLikelyDuplicate, allUserEnrollmentsListSearchResult, ageV2GroupEnumInt } =
      faceTecData;
    console.log({ isLikelyDuplicate, allUserEnrollmentsListSearchResult, ageV2GroupEnumInt });

    if (
      isLikelyDuplicate &&
      allUserEnrollmentsListSearchResult?.searchResults &&
      allUserEnrollmentsListSearchResult.searchResults.length > 0
    ) {
      for (let enroll of allUserEnrollmentsListSearchResult.searchResults) {
        let externalRefID = enroll.externalDatabaseRefID;
        let userId = externalRefID.split("_")[1];

        if (isValidObjectId(userId)) {
          let dupUser = await User.findOne({
            _id: userId,
            status: { $ne: "DELETED" },
            status: { $ne: "REJECTED" },
          });

          if (dupUser) {
            await DoubleKyc.create({
              userIdFrom: user._id,
              userIdTo: userId,
            });

            return res.status(200).json({
              success: false,
              message: "Your face has been registered to another account.",
            });
          }
        }
      }
    }

    // Nếu không duplicate hoặc không trùng user nào
    const kycConfig = await Config.findOne({ label: "AUTO_KYC_REGISTER" });
    user.facetecTid = facetect_tid;
    user.status = kycConfig.value ? "APPROVED" : "PENDING";
    user.ageEstimate = ageV2GroupEnumInt;
    if (!user.kycFee) {
      user.availableUsdt = user.availableUsdt - 2;
      user.kycFee = true;
    }
    await user.save();

    return res.json({
      success: true,
      message: "Setup Face ID successfully",
    });
  } catch (error) {
    console.log({ error });
    throw new Error("Invalid token");
  }
});

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export { startKYC, register, claimKYC };
