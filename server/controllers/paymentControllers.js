import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { getParentWithCountPay, getLevelOfRefUser } from "../utils/getParentWithCountPay.js";
import Refund from "../models/refundModel.js";
import { getActiveLink } from "../utils/getLinksActive.js";
import {
  sendActiveLink,
  sendMailReceiveCommission,
  sendMailRefDc,
} from "../utils/sendMailCustom.js";
import {
  checkRatioCountChildOfUser,
  getParentUser,
  getRefParentUser,
  checkSerepayWallet,
} from "../utils/methods.js";
import { checkCanIncreaseNextTier } from "./userControllers.js";
import Wallet from "../models/walletModel.js";
import Tree from "../models/treeModel.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";

const getPaymentInfo = asyncHandler(async (req, res) => {
  const { user } = req;

  if (user) {
    let walletUser = user.walletAddress;
    if (user.countPay === 13) {
      // const canIncreaseTier = await checkCanIncreaseNextTier(user);
      // if (!canIncreaseTier) {
      //   res.status(404);
      //   throw new Error("You are not eligible for next step payment");
      // }
      res.status(200).json({
        message: "Payment completed!",
      });
    } else {
      // delete pending trans
      await Transaction.deleteMany({
        $and: [
          {
            status: "PENDING",
          },
          { userId: user.id },
        ],
      });

      const wallets = await Wallet.find();
      const admin = await User.findOne({ email: "admin2@gmail.com" });
      const adminWallet = wallets.find((ele) => ele.type === "ADMIN");
      // const pigWallet = wallets.find((ele) => ele.type === "PIG");
      // const companyWallet = wallets.find((ele) => ele.type === "COMPANY");
      // const holdWallet = await getAdminWallets();
      const payments = [];
      const paymentIds = [];
      if (user.fine > 0) {
        const transactionFine = await Transaction.create({
          userId: user.id,
          amount: user.fine,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "Fine Fee",
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "FINE",
          status: "PENDING",
        });
        payments.push({
          userName: "Fine Fee",
          amount: user.fine,
        });
        paymentIds.push({
          type: "FINE",
          id: transactionFine._id,
          amount: user.fine,
          to: "Admin",
        });
      } else {
        const refUser = await getRefParentUser(user.id, user.tier);
        let haveRefNotPayEnough = false;
        let registerFee = 5 * user.tier;
        let pigFee = 5 * user.tier;
        let companyFee = 25 * user.tier;
        let directCommissionFee = 15 * user.tier;
        let referralCommissionFee = 5 * user.tier;
        // giao dich dang ky
        payments.push({
          userName: "Registration Fee",
          amount: registerFee,
        });
        const transactionRegister = await Transaction.create({
          userId: user.id,
          amount: registerFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "Registration Fee",
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "REGISTER",
          status: "PENDING",
        });
        paymentIds.push({
          type: "REGISTER",
          id: transactionRegister._id,
          amount: registerFee,
          to: "Registration Fee",
        });
        // giao dich con heo
        payments.push({
          userName: "DreamPool",
          amount: pigFee,
        });
        const transactionPig = await Transaction.create({
          userId: user.id,
          amount: pigFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "DreamPool",
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "PIG",
          status: "PENDING",
        });
        paymentIds.push({
          type: "PIG",
          id: transactionPig._id,
          amount: pigFee,
          to: "DreamPool",
        });
        // giao dich hewe cho cong ty
        payments.push({
          userName: "Purchased HEWE",
          amount: companyFee,
        });
        const transactionCompany = await Transaction.create({
          userId: user.id,
          amount: companyFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "Purchased HEWE",
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "COMPANY",
          status: "PENDING",
        });
        paymentIds.push({
          type: "COMPANY",
          id: transactionCompany._id,
          amount: companyFee,
          to: "Purchased HEWE",
        });
        // giao dich hoa hong truc tiep
        if (refUser.closeLah) {
          haveRefNotPayEnough = true;
        } else if (refUser.openLah || refUser.adminChangeTier || refUser.createBy === "ADMIN") {
          haveRefNotPayEnough = false;
        } else {
          if (
            refUser.status === "LOCKED" ||
            refUser.tier < user.tier ||
            (refUser.tier === user.tier && refUser.countPay < 13)
          ) {
            haveRefNotPayEnough = true;
          } else {
            haveRefNotPayEnough = false;
          }
        }
        const transactionDirect = await Transaction.create({
          userId: user.id,
          amount: directCommissionFee,
          userCountPay: user.countPay,
          userId_to: refUser._id,
          username_to: refUser.userId,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: haveRefNotPayEnough ? "DIRECTHOLD" : "DIRECT",
          status: "PENDING",
          refBuyPackage: refUser.buyPackage,
        });
        paymentIds.push({
          type: "DIRECT",
          id: transactionDirect._id,
          amount: directCommissionFee,
          to: refUser.userId,
        });
        payments.push({
          userName: refUser.userId,
          amount: directCommissionFee,
        });
        // await generatePackageTrans(
        //   user,
        //   refUser,
        //   directCommissionWallet,
        //   user.continueWithBuyPackageB
        // );
        const ancestorsData = await findAncestors(user.id, 10, user.tier);
        let ancestors = ancestorsData.map((data, index) => {
          if (index === 0) {
            data.isFirst = true;
          }
          return data;
        });
        let countPayUser = user.countPay;
        let indexFor = 1;
        for (let p of ancestors) {
          let haveParentNotPayEnough;
          const receiveUser = await User.findById(p ? p.userId : admin._id);
          if (receiveUser.closeLah) {
            haveParentNotPayEnough = true;
          } else if (
            receiveUser.openLah ||
            receiveUser.adminChangeTier ||
            receiveUser.createBy === "ADMIN"
          ) {
            haveParentNotPayEnough = false;
          } else {
            if (
              receiveUser.status === "LOCKED" ||
              (receiveUser.errLahCode !== "" && indexFor > 6) ||
              receiveUser.tier < user.tier ||
              (receiveUser.tier === user.tier && receiveUser.countPay < user.countPay + 1)
            ) {
              haveParentNotPayEnough = true;
            } else {
              haveParentNotPayEnough = false;
            }
          }
          if (receiveUser.hold !== "no" && receiveUser.holdLevel !== "no") {
            if (
              receiveUser.hold.toString() === user.tier.toString() &&
              parseInt(receiveUser.holdLevel) <= parseInt(user.countPay)
            ) {
              haveParentNotPayEnough = true;
            }
          } else if (user.tier >= 2 && user.countPay >= 3 && receiveUser.countChild[0] >= 300) {
            const checkRatioCountChild = await checkRatioCountChildOfUser(receiveUser._id);
            if (!checkRatioCountChild) haveParentNotPayEnough = true;
          }
          payments.push({
            userName: receiveUser.userId,
            amount: referralCommissionFee,
          });
          const transactionReferral = await Transaction.create({
            userId: user.id,
            amount: referralCommissionFee,
            userCountPay: countPayUser,
            userId_to: receiveUser._id,
            username_to: receiveUser.userId,
            tier: user.tier,
            buyPackage: user.buyPackage,
            hash: "",
            type: haveParentNotPayEnough ? "REFERRALHOLD" : "REFERRAL",
            status: "PENDING",
          });
          paymentIds.push({
            type: "REFERRAL",
            id: transactionReferral._id,
            amount: referralCommissionFee,
            to: receiveUser.userId,
          });
          countPayUser = countPayUser + 1;
          indexFor++;
        }
      }
      res.json({
        payments,
        paymentIds,
      });
    }
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

const getAdminWallets = async () => {
  const wallets = await Wallet.find();

  const holdWallet1 = wallets.find((ele) => ele.type === "HOLD1");
  const holdWallet2 = wallets.find((ele) => ele.type === "HOLD2");
  const holdWallet3 = wallets.find((ele) => ele.type === "HOLD3");
  const holdWallet4 = wallets.find((ele) => ele.type === "HOLD4");
  const holdWallet5 = wallets.find((ele) => ele.type === "HOLD5");

  return {
    1: holdWallet1.address,
    2: holdWallet2.address,
    3: holdWallet3.address,
    4: holdWallet4.address,
    5: holdWallet5.address,
  };
};

const findAncestors = async (userId, limit, tier) => {
  let ancestors = [];
  let currentUserId = userId;
  let currentParent;

  const tree = await Tree.findOne({ userId, tier });
  const refTree = await Tree.findOne({ userId: tree.refId, tier });
  if (!refTree) {
    throw new Error("Ref user does not exist");
  }
  ancestors.push(refTree);

  while (ancestors.length < limit) {
    const treeOfUser = await Tree.findOne({ userId: currentUserId, tier });
    if (!treeOfUser) throw new Error("User does not exist");

    const parentId = treeOfUser.parentId;

    if (!parentId) {
      ancestors.push(currentParent);
      continue;
    }

    if (parentId && parentId === tree.refId) {
      currentUserId = parentId;
      continue;
    }

    const parent = await Tree.findOne({ userId: parentId, tier });
    if (!parent) {
      ancestors.push(currentParent);
      continue;
    }

    currentParent = parent;
    ancestors.push(currentParent);
    currentUserId = parentId;
  }

  return ancestors;
};

const addPayment = asyncHandler(async (req, res) => {
  const { id, hash, type, transIds } = req.body;
  const transaction = await Transaction.findById(id);
  const user = await User.findById(transaction.userId);
  if (transaction.type === "FINE") {
    user.fine = 0;
    await user.save();
  }
  transaction.hash = hash || transaction.hash;
  transaction.status = "SUCCESS";
  const transactionUpdate = await transaction.save();

  if (type === "REFERRAL") {
    await onDonePayment(user, transIds);
  }

  if (transactionUpdate) {
    res.status(201).json({
      message: "Payment successful",
    });
  }
});

const onDonePayment = asyncHandler(async (req, res) => {
  const { user } = req;
  const { transIds, transactionHash } = req.body;
  const transIdsList = Object.values(transIds);

  if (transIdsList.length > 0) {
    if (transIdsList.length === 1 && transIdsList[0].type === "FINE") {
      user.fine = 0;
    } else {
      for (let transId of transIdsList) {
        const trans = await Transaction.findOneAndUpdate(
          { _id: transId.id, userId: user.id, tier: user.tier },
          { status: "SUCCESS", hash: transactionHash }
        );

        if (!trans.type.includes("HOLD")) {
          let userReceive = await User.findOne({ _id: trans.userId_to });
          userReceive.availableUsdt = userReceive.availableUsdt + trans.amount;
          await userReceive.save();
        }

        if (trans.type === "DIRECT" || trans.type === "REFERRAL") {
          let userReceive = await User.findOne({ _id: trans.userId_to });
          if (trans.type === "REFERRAL") {
            await sendMailRefDc({ senderName: user.userId, email: userReceive.email });
          } else {
            await sendMailReceiveCommission({ senderName: user.userId, email: userReceive.email });
          }
        }
      }

      if (user.countPay === 0 && user.tier === 1) {
        // const links = await getActiveLink(user.email, user.userId, user.phone);
        // if (links.length === 1) {
        // await sendActiveLink(user.email, links[0]);
        await sendActiveLink(user.userId, user.email);
        // }
      }

      let responseHewe = await getPriceHewe();
      const hewePrice = responseHewe.data.ticker.latest;
      const totalHewe = Math.round(100 / hewePrice);
      const hewePerDay = Math.round(totalHewe / 540);

      user.totalHewe = totalHewe;
      user.hewePerDay = hewePerDay;
      user.countPay = 13;
    }

    const updatedUser = await user.save();

    if (updatedUser) {
      res.json({ message: "system update successful" });
    }
  } else {
    throw new Error("No transaction found");
  }
});

const getAllPayments = asyncHandler(async (req, res) => {
  let { pageNumber, keyword, status, tier } = req.query;
  const page = Number(pageNumber) || 1;
  let searchType = {};
  if (
    status === "DIRECT" ||
    status === "REFERRAL" ||
    status === "REGISTER" ||
    status === "FINE" ||
    status === "PIG" ||
    status === "COMPANY"
  ) {
    searchType = { type: status };
  }
  if (status === "HOLD") {
    searchType = { type: { $regex: status, $options: "i" } };
  }

  console.log({ searchType });

  const pageSize = 10;

  const count = await Transaction.countDocuments({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userIds
          { userId_to: { $regex: keyword, $options: "i" } }, // Tìm theo địa chỉ ví
          { username_to: { $regex: keyword, $options: "i" } }, // Tìm theo địa chỉ ví
        ],
      },
      status !== "ALL" ? { ...searchType } : {},
      { tier },
      {
        status: "SUCCESS",
      },
      { type: { $ne: "PACKAGE" } },
    ],
  });

  const allPayments = await Transaction.find({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
          { username_to: { $regex: keyword, $options: "i" } },
          { userId_to: { $regex: keyword, $options: "i" } },
        ],
      },
      status !== "ALL" ? { ...searchType } : {},
      { tier },
      {
        status: "SUCCESS",
      },
      { type: { $ne: "PACKAGE" } },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(status === "HOLD" ? "isHoldRefund -createdAt" : "-createdAt")
    .select("-password");

  const result = [];
  for (let pay of allPayments) {
    let user = await User.findById(pay.userId);
    if (status === "REGISTER" || status === "FINE") {
      result.push({
        _id: pay._id,
        address_from: pay.address_from,
        tier: pay.tier,
        // hash: pay.hash,
        amount: pay.amount,
        userId: user.userId,
        email: user.email,
        type: pay.type,
        createdAt: pay.createdAt,
      });
    } else if (
      status === "DIRECT" ||
      status === "REFERRAL" ||
      status === "ALL" ||
      status === "PIG" ||
      status === "COMPANY"
    ) {
      const userRef = await User.findById(pay.userId_to);
      result.push({
        _id: pay._id,
        address_from: pay.address_from,
        tier: pay.tier,
        // hash: pay.hash,
        amount: pay.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef ? userRef.userId : "Unknow",
        userReceiveEmail: userRef ? userRef.email : "Unknow",
        userCountPay: pay.userCountPay,
        type: pay.type,
        createdAt: pay.createdAt,
      });
    } else if (status === "HOLD") {
      const userRef = await User.findById(pay.userId_to);
      result.push({
        _id: pay._id,
        address_from: pay.address_from,
        tier: pay.tier,
        // hash: pay.hash,
        amount: pay.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef ? userRef.userId : "Unknow",
        userReceiveEmail: userRef ? userRef.email : "Unknow",
        type: pay.type,
        userCountPay: pay.userCountPay,
        createdAt: pay.createdAt,
        isHoldRefund: pay.isHoldRefund,
      });
    }
  }

  res.json({
    payments: result,
    pages: Math.ceil(count / pageSize),
  });
});

const getPaymentsOfUser = asyncHandler(async (req, res) => {
  const { user } = req;
  const { pageNumber } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 20;

  const count = await Transaction.countDocuments({
    $and: [{ userId: user.id }, { status: "SUCCESS" }, { type: { $ne: "PACKAGE" } }],
  });

  const allPayments = await Transaction.find({
    $and: [{ userId: user.id }, { status: "SUCCESS" }, { type: { $ne: "PACKAGE" } }],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt")
    .select("-password");

  res.json({
    payments: allPayments,
    pages: Math.ceil(count / pageSize),
  });
});

const getPaymentDetail = asyncHandler(async (req, res) => {
  const trans = await Transaction.findById(req.params.id);
  if (trans) {
    let user = await User.findById(trans.userId);
    if (trans.type === "REGISTER") {
      res.json({
        _id: trans._id,
        address_from: trans.address_from,
        hash: trans.hash,
        amount: trans.amount,
        userId: user.userId,
        email: user.email,
        type: trans.type,
        status: trans.status,
        createdAt: trans.createdAt,
      });
    } else if (trans.type === "DIRECT" || trans.type === "REFERRAL") {
      const userRef = await User.findById(trans.userId_to);
      res.json({
        _id: trans._id,
        address_from: user.walletAddress,
        address_to: userRef.walletAddress,
        hash: trans.hash,
        amount: trans.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef.userId,
        userReceiveEmail: userRef.email,
        type: trans.type,
        status: trans.status,
        userCountPay: trans.userCountPay,
        createdAt: trans.createdAt,
      });
    } else if (trans.type === "DIRECTHOLD" || trans.type === "REFERRALHOLD") {
      const userRef = await User.findById(trans.userId_to);
      res.json({
        _id: trans._id,
        address_from: user.walletAddress,
        address_to: userRef.walletAddress,
        hash: trans.hash,
        amount: trans.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef.userId,
        userReceiveEmail: userRef.email,
        type: trans.type,
        status: trans.status,
        userCountPay: trans.userCountPay,
        createdAt: trans.createdAt,
        isHoldRefund: trans.isHoldRefund,
      });
    }
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const checkCanRefundPayment = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const trans = await Transaction.findById(id);
  if (trans) {
    const { userCountPay, userId_to } = trans;
    const userReceive = await User.findById(userId_to);
    // const isSerepayWallet = await checkSerepayWallet(userReceive.walletAddress);
    if (userReceive) {
      if (userReceive.status === "LOCKED") {
        res.status(404);
        throw new Error(`User parent locked`);
      } else if (userReceive.closeLah) {
        res.status(404);
        throw new Error(`User is being blocked from trading`);
      }
      //  else if (!isSerepayWallet) {
      //   throw new Error(`The wallet received is not a Serepay wallet`);
      // }
      else if (userReceive.countPay - 1 < userCountPay) {
        res.status(404);
        throw new Error(
          userReceive.countPay === 0
            ? `User parent NOT FINISHED REGISTER`
            : `User parent pay = ${
                userReceive.countPay - 1
              } time but user pay = ${userCountPay} time`
        );
      } else if (trans.type === "REFERRALHOLD" && userReceive.errLahCode === "OVER30") {
        throw new Error(`User has not had 3 child within 30 days`);
      } else if (trans.type === "REFERRALHOLD" && userReceive.errLahCode === "OVER60") {
        throw new Error(`User has not had 3 child within 60 days`);
      } else if (
        userReceive.buyPackage === "A" &&
        userReceive.tier === 1 &&
        userReceive.countPay < 13
      ) {
        throw new Error(
          `User is ${trans.buyPackage} package but pay ${
            userReceive.countPay === 0 ? 0 : userReceive.countPay - 1
          } times`
        );
      } else if (
        userReceive.buyPackage === "B" &&
        userReceive.tier === 1 &&
        userReceive.countPay < 7
      ) {
        throw new Error(
          `User is ${trans.buyPackage} package but pay ${
            userReceive.countPay === 0 ? 0 : userReceive.countPay - 1
          } times`
        );
      } else if (
        trans.type === "DIRECTHOLD" &&
        trans.buyPackage === "B" &&
        trans.amount === 35 &&
        trans.refBuyPackage === "C"
      ) {
        res.json({
          amount: 5,
          message: `User is ${trans.buyPackage} package Parent is ${trans.refBuyPackage} package (refund 5 USDT)`,
        });
      } else if (
        trans.type === "DIRECTHOLD" &&
        trans.buyPackage === "A" &&
        trans.refBuyPackage === "C"
      ) {
        res.json({
          amount: 5,
          message: `User is ${trans.buyPackage} package Parent is ${trans.refBuyPackage} package (refund 5 USDT)`,
        });
      } else if (
        trans.type === "DIRECTHOLD" &&
        trans.buyPackage === "A" &&
        trans.refBuyPackage === "B"
      ) {
        res.json({
          amount: 35,
          message: `User is ${trans.buyPackage} package Parent is ${trans.refBuyPackage} package (refund 35 USDT)`,
        });
      } else if (trans.type === "DIRECTHOLD" && trans.amount === 30) {
        const receiveParent = await User.findOne({
          walletAddress: { $in: [trans.address_ref] },
        });

        if (receiveParent.buyPackage !== "A") {
          res.json({
            message: `parent has not paid enough to upgrade to package A`,
          });
        } else {
          res.json({
            message: "User is OK for a refund",
          });
        }
      } else {
        res.json({
          message: "User is OK for a refund",
        });
      }
    } else {
      res.status(404);
      throw new Error("Cannot get user parent");
    }
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const changeToRefunded = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const trans = await Transaction.findById(id);
  if (trans) {
    trans.isHoldRefund = true;
    await trans.save();
    res.json({
      message: "Update successful",
    });
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const onAdminDoneRefund = asyncHandler(async (req, res) => {
  const { transId } = req.body;
  const trans = await Transaction.findById(transId);
  if (trans) {
    trans.isHoldRefund = true;
    await trans.save();

    const refund = await Refund.create({
      transId: transId,
      userId_from: trans.userId,
      userId_to: trans.userId_to,
      type: trans.type,
    });

    const user = await User.findById(trans.userId);
    const receiveUser = await User.findById(trans.userId_to);
    receiveUser.availableUsdt = receiveUser.availableUsdt + trans.amount;
    await receiveUser.save();

    if (trans.type === "REFERRAL") {
      await sendMailRefDc({ senderName: user.userId, email: receiveUser.email });
    } else {
      await sendMailReceiveCommission({ senderName: user.userId, email: receiveUser.email });
    }

    res.json({
      message: "Refund successful",
    });
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const findUserOtherParentId = asyncHandler(async (req, res) => {
  console.log("getting....");
  const listUsers = await User.find({ $and: [{ isAdmin: false }] });

  const result = [];
  for (let u of listUsers) {
    if (u.children.length > 0) {
      for (let childId of u.children) {
        const child = await User.findById(childId);
        if (child.parentId.toString() !== u.parentId.toString()) {
          result.push({ child: childId, parent: u._id });
        }
      }
    }
  }

  res.json(result);
});

const getParentWithCount = asyncHandler(async (req, res) => {
  const { id, countPay } = req.body;

  const parent = await getParentWithCountPay(id, countPay);

  res.json(parent);
});

const getAllTransForExport = asyncHandler(async (req, res) => {
  let fromDate, toDate;
  const { limit, page } = req.body;
  let match = {
    status: "SUCCESS",
    type: { $ne: "PACKAGE" },
  };

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

  const offset = (page - 1) * limit;

  const transactions = await Transaction.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "address_from",
        foreignField: "walletAddress",
        as: "sender",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "address_ref",
        foreignField: "walletAddress",
        as: "receiver",
      },
    },
    { $skip: offset },
    { $limit: limit },
    { $sort: { createdAt: -1 } },
  ]);

  const totalCount = await Transaction.countDocuments(match);

  const result = transactions.map((tran) => ({
    _id: tran._id,
    type: tran.type,
    amount: tran.amount,
    isHoldRefund: tran.isHoldRefund,
    status: tran.status,
    createdAt: tran.createdAt,
    address_from: tran.address_from,
    tier: tran.tier,
    address_ref: tran.address_ref,
    senderName: tran.sender.length > 0 ? tran.sender[0].userId : "unknown",
    senderEmail: tran.sender.length > 0 ? tran.sender[0].email : "unknown",
    senderStatus:
      tran.sender.length > 0 ? (tran.sender[0].status === "DELETED" ? "TK đã xoá" : "") : "unknow",
    receiverName: tran.receiver.length > 0 ? tran.receiver[0].userId : "unknown",
    receiverEmail: tran.receiver.length > 0 ? tran.receiver[0].email : "unknown",
  }));

  res.json({ totalCount, result });
});

export {
  getPaymentInfo,
  addPayment,
  getAllPayments,
  getPaymentsOfUser,
  getPaymentDetail,
  checkCanRefundPayment,
  changeToRefunded,
  onAdminDoneRefund,
  findUserOtherParentId,
  getParentWithCount,
  getAllTransForExport,
  onDonePayment,
};
