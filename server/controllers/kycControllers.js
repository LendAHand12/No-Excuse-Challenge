import expressAsyncHandler from "express-async-handler";
import { createCallbackToken, decodeCallbackToken } from "../utils/methods.js";
import User from "../models/userModel.js";
import Config from "../models/configModel.js";
import mongoose from "mongoose";
import DoubleKyc from "../models/doubleKycModel.js";
import getFaceTecData from "../services/getFaceTecData.js";
import Transaction from "../models/transactionModel.js";
import Withdraw from "../models/withdrawModel.js";

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
  const { coin, amount, withdrawalType, exchangeRate } = req.body;
  const { user } = req;

  const token = createCallbackToken(user._id);
  let callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/claim?coin=${coin}&token=${token}&amount=${amount}`;

  // Add withdrawalType and exchangeRate to callback if provided
  if (withdrawalType) {
    callbackUrl += `&withdrawalType=${withdrawalType}`;
  }
  if (exchangeRate) {
    callbackUrl += `&exchangeRate=${exchangeRate}`;
  }

  const redirectToKYC = `${process.env.KYC_URL}/verify.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

const claimHeweKYC = expressAsyncHandler(async (req, res) => {
  const { user } = req;

  // Bước 1: Kiểm tra xem user đã dăng ký khuôn mặt chưa
  if (!user.facetecTid || user.facetecTid === "") {
    // Nếu chưa có khuôn mặt -> Tạo yêu cầu rút HEWE chờ admin duyệt

    // Dùng findOneAndUpdate để set isClaiming = true
    const lockedUser = await User.findOneAndUpdate(
      { _id: user._id, isClaiming: false },
      { $set: { isClaiming: true } },
      { new: true }
    );

    if (!lockedUser) {
      return res.status(400).json({
        error: "Your HEWE claim is already being processed. Please wait!",
      });
    }

    try {
      // Kiểm tra giới hạn rút HEWE từ config
      const limitConfig = await Config.findOne({ label: "LIMIT_AMOUNT_HEWE" });
      const limitAmount = limitConfig ? Number(limitConfig.value) : 0;

      if (limitAmount > 0 && lockedUser.availableHewe < limitAmount) {
        throw new Error(
          `Minimum withdrawal amount is ${limitAmount} HEWE. Your available balance is ${lockedUser.availableHewe} HEWE.`
        );
      }

      const MAX_WITHDRAWAL_AMOUNT = 700000;
      if (lockedUser.availableHewe > MAX_WITHDRAWAL_AMOUNT) {
        throw new Error(
          `Maximum withdrawal amount is ${MAX_WITHDRAWAL_AMOUNT} HEWE. Your available balance is ${lockedUser.availableHewe} HEWE.`
        );
      }

      if (lockedUser.availableHewe > 0) {
        // Tạo yêu cầu Withdraw chờ Admin duyệt
        await Withdraw.create({
          userId: lockedUser.id,
          amount: lockedUser.availableHewe,
          coin: "HEWE",
          status: "PENDING",
        });

        const amountClaimed = lockedUser.availableHewe;
        lockedUser.availableHewe = 0;
        // Tạm thời cộng vào claimedHewe (hoặc tạo field pendingHewe nếu muốn tách bạch hơn)
        // Hiện tại code cũ set về 0 luôn
        await lockedUser.save();

        return res.status(200).json({
          message: "Withdrawal request has been sent to Admin. Please wait!",
        });
      } else {
        throw new Error("Insufficient balance in account");
      }
    } catch (err) {
      return res.status(400).json({
        error: err.message ? err.message.split(",")[0] : "Internal Error",
      });
    } finally {
      await User.findByIdAndUpdate(user._id, { isClaiming: false });
    }
  }

  // Nếu đã có khuôn mặt -> Tiếp tục flow quét mặt FaceTec
  const token = createCallbackToken(user._id);
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/claim-hewe?token=${token}`;

  const redirectToKYC = `${process.env.KYC_URL}/verify.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

const moveSystemKyc = expressAsyncHandler(async (req, res) => {
  const { user } = req;

  const token = createCallbackToken(user._id);
  const callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/move-system?token=${token}`;

  const redirectToKYC = `${process.env.KYC_URL}/verify.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

const register = expressAsyncHandler(async (req, res) => {
  const { facetect_tid, user_id, token } = req.body;

  try {
    // Verify callback token
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    let decodedToken;
    try {
      decodedToken = decodeCallbackToken(token);
    } catch (error) {
      return res.status(400).json({ message: error.message || "Invalid or expired token" });
    }

    // Verify token purpose
    if (decodedToken.purpose !== "kyc") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Verify userId from token matches user_id from request
    if (decodedToken.userId !== user_id) {
      return res.status(400).json({ message: "Token user mismatch" });
    }

    // Get user from decoded token
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const faceTecDataRes = await getFaceTecData({ userId: user.id });
    const faceTecData = faceTecDataRes.data.data[0];
    const { isLikelyDuplicate, allUserEnrollmentsListSearchResult, ageV2GroupEnumInt } =
      faceTecData;
    console.log({
      isLikelyDuplicate,
      allUserEnrollmentsListSearchResult,
      ageV2GroupEnumInt,
    });

    if (
      isLikelyDuplicate &&
      allUserEnrollmentsListSearchResult?.searchResults &&
      allUserEnrollmentsListSearchResult.searchResults.length > 0
    ) {
      for (let enroll of allUserEnrollmentsListSearchResult.searchResults) {
        let externalRefID = enroll.externalDatabaseRefID;
        let userId = externalRefID.split("_")[1];

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

const checkUserCompleteKyc = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (user.facetecTid === "") {
      const faceTecData = await getFaceTecData({ userId });
      if (faceTecData.data.total === 0) {
        return res.json({
          success: false,
          message: "No data on facetec",
        });
      } else {
        const data = faceTecData.data.data[0];
        const tid = data.callData.tid;
        user.facetecTid = tid;
        user.ageEstimate = data.ageV2GroupEnumInt;
        if (!user.kycFee) {
          user.kycFee = true;
          user.availableUsdt = user.availableUsdt - 2;

          await Transaction.create({
            userId: user._id,
            amount: 2,
            userCountPay: user.countPay,
            userId_to: "6494e9101e2f152a593b66f2",
            username_to: "KYC Fee",
            tier: 1,
            buyPackage: "A",
            hash: "",
            type: "KYC",
            status: "SUCCESS",
          });
        }
        user.status = "PENDING";
        await user.save();
      }
    }

    return res.json({
      success: true,
      message: "Update successfully",
    });
  } catch (error) {
    console.log({ error });
    throw new Error("Internal Error");
  }
});

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Start face verification for updating user info
const startUpdateInfoKYC = expressAsyncHandler(async (req, res) => {
  const { user } = req;
  const {
    phone,
    walletAddress,
    email,
    fullName,
    bankName,
    bankCode,
    accountName,
    accountNumber,
    dateOfBirth,
    currentAddress,
  } = req.body;

  // Check if user has registered face
  if (!user.facetecTid || user.facetecTid === "") {
    return res.status(400).json({
      success: false,
      message: "Face not registered. Please register your face first."
    });
  }

  // Create callback token with purpose "update_info"
  const token = createCallbackToken(user._id, "update_info");

  // Build callback URL with all update fields as params
  let callbackUrl = `${process.env.FRONTEND_BASE_URL}/user/update-info?token=${token}`;

  // Add fields to callback URL params (only if they have values)
  if (phone) {
    callbackUrl += `&phone=${encodeURIComponent(phone)}`;
  }
  if (walletAddress) {
    callbackUrl += `&walletAddress=${encodeURIComponent(walletAddress)}`;
  }
  if (email) {
    callbackUrl += `&email=${encodeURIComponent(email)}`;
  }
  if (fullName) {
    callbackUrl += `&fullName=${encodeURIComponent(fullName)}`;
  }
  if (bankName) {
    callbackUrl += `&bankName=${encodeURIComponent(bankName)}`;
  }
  if (bankCode) {
    callbackUrl += `&bankCode=${encodeURIComponent(bankCode)}`;
  }
  if (accountName) {
    callbackUrl += `&accountName=${encodeURIComponent(accountName)}`;
  }
  if (accountNumber) {
    callbackUrl += `&accountNumber=${encodeURIComponent(accountNumber)}`;
  }
  if (dateOfBirth) {
    callbackUrl += `&dateOfBirth=${encodeURIComponent(dateOfBirth)}`;
  }
  if (currentAddress) {
    callbackUrl += `&currentAddress=${encodeURIComponent(currentAddress)}`;
  }

  // Redirect to FaceTec verify page
  const redirectToKYC = `${process.env.KYC_URL}/verify.html?callback=${encodeURIComponent(
    callbackUrl
  )}&user_id=${user.id}`;

  res.json({ url: redirectToKYC });
});

export { startKYC, register, claimKYC, claimHeweKYC, checkUserCompleteKyc, moveSystemKyc, startUpdateInfoKYC };
