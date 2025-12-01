import asyncHandler from "express-async-handler";
import axios from "axios";
import Claim from "../models/claimModel.js";
import User from "../models/userModel.js";
import Tree from "../models/treeModel.js";
import Config from "../models/configModel.js";
import sendHewe from "../services/sendHewe.js";
import sendUsdt from "../services/sendUsdt.js";
import Withdraw from "../models/withdrawModel.js";
import { sendTelegramMessage } from "../utils/sendTelegram.js";
import { decodeCallbackToken, removeAccents } from "../utils/methods.js";
import mongoose from "mongoose";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import { getPriceAmc } from "../utils/getPriceAmc.js";
import moment from "moment-timezone";

const claimHewe = asyncHandler(async (req, res) => {
  const { user } = req;

  // Dùng findOneAndUpdate để set isClaimingHewe = true
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

    // Nếu có config giới hạn và availableHewe chưa đạt giới hạn thì không cho rút
    if (limitAmount > 0 && lockedUser.availableHewe < limitAmount) {
      throw new Error(
        `Minimum withdrawal amount is ${limitAmount} HEWE. Your available balance is ${lockedUser.availableHewe} HEWE.`
      );
    }

    // Giới hạn tối đa số hewe có thể rút là 700000
    const MAX_WITHDRAWAL_AMOUNT = 700000;
    if (lockedUser.availableHewe > MAX_WITHDRAWAL_AMOUNT) {
      throw new Error(
        `Maximum withdrawal amount is ${MAX_WITHDRAWAL_AMOUNT} HEWE. Your available balance is ${lockedUser.availableHewe} HEWE.`
      );
    }

    if (lockedUser.availableHewe > 0) {
      // Gửi token HEWE
      const receipt = await sendHewe({
        amount: lockedUser.availableHewe,
        receiverAddress: lockedUser.walletAddress,
      });

      await Claim.create({
        userId: lockedUser.id,
        amount: lockedUser.availableHewe,
        hash: receipt.hash,
        coin: "HEWE",
      });

      lockedUser.availableHewe = 0;
      await lockedUser.save();

      res.status(200).json({
        message: "Claim HEWE successful",
      });
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    res.status(400).json({
      error: err.message || "Internal error",
    });
  } finally {
    // Reset lại trạng thái để lần sau vẫn claim được
    await User.findByIdAndUpdate(lockedUser._id, { isClaiming: false });
  }
});

const claimUsdt = asyncHandler(async (req, res) => {
  const { token, amount, withdrawalType, exchangeRate } = req.body;
  console.log({ withdrawalType });
  const decode = decodeCallbackToken(token);
  console.log({ decode });

  if (!decode) {
    throw new Error("Internal Error");
  }

  const { userId } = decode;

  // Bước 1: Set isClaiming = true chỉ khi hiện tại nó = false
  const user = await User.findOneAndUpdate(
    { _id: userId, isClaiming: false },
    { $set: { isClaiming: true } },
    { new: true }
  );

  if (!user) {
    return res.status(400).json({
      error: "Your withdraw request is already being processed. Please wait!",
    });
  }

  try {
    // Bước 2: Validate user
    if (user.status !== "APPROVED" || user.facetecTid === "") {
      throw new Error("Please verify your account");
    }

    // Kiểm tra dieTime từ Tree tier 1 - nếu đã chết thì không cho rút
    const treeTier1 = await Tree.findOne({
      userId: user._id,
      tier: 1,
      isSubId: false,
    });

    if (treeTier1 && treeTier1.dieTime) {
      const todayStart = moment.tz("Asia/Ho_Chi_Minh").startOf("day");
      const dieTimeStart = moment.tz(treeTier1.dieTime, "Asia/Ho_Chi_Minh").startOf("day");

      // Nếu dieTime đã quá hạn (today >= dieTime) thì không cho rút
      if (todayStart.isSameOrAfter(dieTimeStart)) {
        throw new Error("Request denied");
      }
    }

    // Bước 3: Check balance
    if (user.availableUsdt > 0 && user.availableUsdt >= parseInt(amount)) {
      const withdrawType = withdrawalType || "BANK"; // Mặc định là BANK

      // BANK withdrawal: Always create withdraw request
      if (withdrawType === "BANK") {
        // Validate bank information
        if (!user.accountName || !user.accountNumber || !user.bankName || !user.bankCode) {
          throw new Error("Please update your bank information in Profile");
        }

        // Calculate amounts - Tất cả tính bằng USDT
        const rate = parseFloat(exchangeRate) || 0;
        if (!rate || rate <= 0) {
          throw new Error("Invalid exchange rate");
        }

        const amountUsdt = parseFloat(amount);
        const tax = amountUsdt * 0.1; // 10% tax (USDT)
        const fee = 1; // Transaction fee 1 USDT
        const receivedAmount = amountUsdt - tax - fee; // Số tiền thực tế nhận được (USDT)

        if (receivedAmount <= 0) {
          throw new Error("Amount is too small after fees");
        }

        // Create withdraw request
        // Lưu tất cả giá trị bằng USDT, chỉ lưu thêm exchangeRate
        // Khi hiển thị sẽ tính VND từ USDT * exchangeRate
        await Withdraw.create({
          userId: user.id,
          amount: amountUsdt, // Số tiền user yêu cầu (USDT)
          withdrawalType: "BANK",
          exchangeRate: rate,
          tax: tax, // Thuế (USDT)
          fee: fee, // Phí giao dịch (USDT)
          receivedAmount: receivedAmount, // Số tiền thực tế nhận được (USDT)
        });

        user.availableUsdt -= parseInt(amount);
        await user.save();

        res.status(200).json({
          message: "Withdrawal request has been sent to Admin. Please wait!",
        });
      } else if (withdrawType === "CRYPTO") {
        // CRYPTO withdrawal: Send USDT directly via blockchain
        // Validate wallet address
        if (!user.walletAddress) {
          throw new Error("Please update your wallet address in Profile");
        }

        // Calculate amounts - Tất cả tính bằng USDT
        const amountUsdt = parseFloat(amount);
        const tax = amountUsdt * 0.1; // 10% tax (USDT)
        const fee = 1; // Transaction fee 1 USDT
        const receivedAmount = amountUsdt - tax - fee; // Số tiền thực tế nhận được (USDT)

        if (receivedAmount <= 0) {
          throw new Error("Amount is too small after fees");
        }

        // Send USDT via blockchain
        const receipt = await sendUsdt({
          amount: receivedAmount,
          receiverAddress: user.walletAddress,
        });

        // Create Claim record
        await Claim.create({
          userId: user.id,
          amount: amountUsdt, // Số tiền user yêu cầu (USDT)
          hash: receipt.hash,
          coin: "USDT",
          withdrawalType: "CRYPTO",
          tax: tax, // Thuế (USDT)
          fee: fee, // Phí giao dịch (USDT)
          receivedAmount: receivedAmount, // Số tiền thực tế nhận được (USDT)
          availableUsdtAfter: user.availableUsdt - parseInt(amount), // Số dư còn lại
        });

        // Update user balance
        user.claimedUsdt += parseInt(amount);
        user.availableUsdt -= parseInt(amount);
        await user.save();

        res.status(200).json({
          message: "Claim USDT successful",
          hash: receipt.hash,
        });
      } else {
        throw new Error("Invalid withdrawal type");
      }
    } else {
      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    res.status(400).json({
      error: err.message ? err.message.split(",")[0] : "Internal Error",
    });
  } finally {
    // Reset trạng thái sau khi xử lý xong (dù success hay error)
    await User.findByIdAndUpdate(userId, { isClaiming: false });
  }
});

// const claimUsdt = asyncHandler(async (req, res) => {
//   const { user } = req;
//   const { amount } = req.body;

//   // Dùng findOneAndUpdate để set isClaimingHewe = true
//   const lockedUser = await User.findOneAndUpdate(
//     { _id: user._id, isClaiming: false },
//     { $set: { isClaiming: true } },
//     { new: true }
//   );

//   if (!lockedUser) {
//     return res.status(400).json({
//       error: "Your HEWE claim is already being processed. Please wait!",
//     });
//   }

//   try {
//     if (lockedUser.availableUsdt > 0) {
//       if (user.status !== "APPROVED" || user.facetecTid === "") {
//         throw new Error("Please verify your account");
//       }
//       if (user.errLahCode === "OVER45") {
//         throw new Error("Request denied");
//       }

//       if (parseInt(amount) < 200 && user.paymentMethod === "") {
//         //         // Gửi trực tiếp USDT
//         const receipt = await sendUsdt({
//           amount: amount - 1,
//           receiverAddress: user.walletAddress,
//         });

//         await Claim.create({
//           userId: user.id,
//           amount: parseInt(amount),
//           hash: receipt.hash,
//           coin: "USDT",
//         });

//         user.claimedUsdt += parseInt(amount);
//         user.availableUsdt -= parseInt(amount);
//         await user.save();

//         res.status(200).json({ message: "claim USDT successful" });
//       } else {
//         // Tạo yêu cầu withdraw chờ admin xử lý
//         await Withdraw.create({
//           userId: user.id,
//           amount: parseInt(amount),
//           method: user.paymentMethod,
//           accountName: user.accountName,
//           accountNumber: user.accountNumber,
//         });

//         user.availableUsdt -= parseInt(amount);
//         await user.save();

//         res.status(200).json({
//           message: "Withdrawal request has been sent to Admin. Please wait!",
//         });
//       }
//     } else {
//       throw new Error("Insufficient balance in account");
//     }
//   } catch (err) {
//     res.status(400).json({
//       error: err.message || "Internal error",
//     });
//   } finally {
//     // Reset lại trạng thái để lần sau vẫn claim được
//     await User.findByIdAndUpdate(lockedUser._id, { isClaiming: false });
//   }
// });

var processingAmcUserIds = [];

const claimAmc = asyncHandler(async (req, res) => {
  const { user } = req;

  if (processingAmcUserIds.includes(user._id)) {
    return res.status(400).json({
      error: "Your withdraw request is already being processed. Please wait!",
    });
  }

  processingAmcUserIds.push(user._id);

  try {
    if (user.status !== "APPROVED" || user.facetecTid === "") {
      throw new Error("Please verify your account");
    }

    if (user.availableAmc > 0) {
      // const receipt = await sendHewe({
      //   amount: user.availableAmc,
      //   receiverAddress: user.walletAddress,
      // });

      const claimed = await Claim.create({
        userId: user.id,
        amount: user.availableAmc,
        hash: "receipt.hash",
        coin: "AMC",
      });

      user.claimedAmc = user.claimedAmc + user.availableAmc;
      user.availableAmc = 0;
      await user.save();

      const index = processingAmcUserIds.indexOf(user.id);
      if (index !== -1) {
        processingAmcUserIds.splice(index, 1);
      }

      res.status(200).json({
        message: "claim AMC successful",
      });
    } else {
      const index = processingAmcUserIds.indexOf(user._id);
      if (index !== -1) {
        processingAmcUserIds.splice(index, 1);
      }

      throw new Error("Insufficient balance in account");
    }
  } catch (err) {
    const index = processingAmcUserIds.indexOf(user._id);
    if (index !== -1) {
      processingAmcUserIds.splice(index, 1);
    }
    res.status(400).json({ error: err.message });
  }
});

const getAllClaims = asyncHandler(async (req, res) => {
  let { pageNumber, coin, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  if (coin === "HEWE" || coin === "USDT") {
    matchStage.coin = coin;
  }

  const keywordRegex = keyword ? { $regex: removeAccents(keyword), $options: "i" } : null;

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  if (keywordRegex) {
    aggregationPipeline.push({
      $match: {
        "userInfo.userId": keywordRegex,
      },
    });
  }

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await Claim.aggregate([...aggregationPipeline, { $count: "total" }]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        coin: 1,
        amount: 1,
        hash: 1,
        withdrawalType: 1,
        availableUsdtAfter: 1,
        tax: 1,
        fee: 1,
        exchangeRate: 1,
        receivedAmount: 1,
        createdAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const claims = await Claim.aggregate(aggregationPipeline);

  res.json({
    claims,
    pages: Math.ceil(count / pageSize),
  });
});

const getAllClaimsForExport = asyncHandler(async (req, res) => {
  let fromDate, toDate;
  let match = {};

  if (req.body.fromDate) {
    fromDate = req.body.fromDate.split("T")[0];
    match.createdAt = {
      $gte: new Date(new Date(fromDate).valueOf() + 1000 * 3600 * 24),
    };
  }
  if (req.body.toDate) {
    toDate = req.body.toDate.split("T")[0];
    match.createdAt = {
      ...match.createdAt,
      $lte: new Date(new Date(toDate).valueOf() + 1000 * 3600 * 24),
    };
  }

  const claims = await Claim.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users", // tên collection User (nên viết thường và dạng số nhiều)
        localField: "userId", // field trong Claim
        foreignField: "_id", // field trong User
        as: "userInfo", // tên field chứa dữ liệu join
      },
    },
    {
      $unwind: "$userInfo", // biến mảng userInfo thành object
    },
    { $sort: { createdAt: -1 } },
  ]);

  const totalCount = await Claim.countDocuments(match);

  const result = [];

  for (let claim of claims) {
    result.push({
      user: claim.userInfo?.userId,
      email: claim.userInfo?.email,
      amount: claim.amount,
      coin: claim.coin,
      hash: claim.hash,
      createdAt: claim.createdAt,
      tax: claim.tax || 0,
      fee: claim.fee || 0,
      receivedAmount:
        claim.receivedAmount !== undefined
          ? claim.receivedAmount
          : claim.amount - (claim.tax || 0) - (claim.fee || 0),
      withdrawalType: claim.withdrawalType,
      exchangeRate: claim.exchangeRate || 0,
    });
  }

  res.json({ totalCount, result });
});

const getAllClaimsOfUser = asyncHandler(async (req, res) => {
  const { user } = req;
  let { pageNumber, coin } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  // ✅ Ép kiểu ObjectId
  if (!mongoose.Types.ObjectId.isValid(user.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  matchStage.userId = new mongoose.Types.ObjectId(user.id);

  if (coin === "HEWE" || coin === "USDT") {
    matchStage.coin = coin;
  }

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await Claim.aggregate([...aggregationPipeline, { $count: "total" }]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        coin: 1,
        amount: 1,
        hash: 1,
        withdrawalType: 1,
        availableUsdtAfter: 1,
        tax: 1,
        fee: 1,
        exchangeRate: 1,
        receivedAmount: 1,
        createdAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const claims = await Claim.aggregate(aggregationPipeline);

  res.json({
    claims,
    pages: Math.ceil(count / pageSize),
  });
});

const resetProcessing = asyncHandler(async (req, res) => {
  await User.updateMany({}, { $set: { isClaiming: false } });

  res.json({
    message: "Reset black list successfully",
  });
});

const getPrice = asyncHandler(async (req, res) => {
  const { coin } = req.body;
  const { user } = req;

  if (coin === "HEWE") {
    let responseHewe = await getPriceHewe();
    const hewePrice = responseHewe.data.ticker.latest;

    res.json({
      price: hewePrice,
      availableUsdt: user.availableUsdt,
    });
  } else if (coin === "AMC") {
    let responseAmc = await getPriceAmc();
    const amcPrice = responseAmc.data.result[0].p;

    res.json({
      price: amcPrice,
      availableUsdt: user.availableUsdt,
    });
  }
});

export {
  claimHewe,
  claimUsdt,
  getAllClaims,
  getAllClaimsForExport,
  getAllClaimsOfUser,
  resetProcessing,
  getPrice,
  claimAmc,
};
