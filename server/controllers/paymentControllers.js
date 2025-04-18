import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import {
  getParentWithCountPay,
  getLevelOfRefUser,
} from "../utils/getParentWithCountPay.js";
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
  findNextUser,
} from "../utils/methods.js";
import { checkCanIncreaseNextTier } from "./userControllers.js";
import Wallet from "../models/walletModel.js";
import Tree from "../models/treeModel.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";

const getPaymentInfo = asyncHandler(async (req, res) => {
  const { user } = req;

  if (user) {
    if (user.countPay === 13) {
      if (user.currentLayer.slice(-1) < 6) {
        res.status(200).json({
          status: "PENDING",
          message:
            "Your current level is insufficient to upgrade to the next tier",
        });
      }
    } else {
      await Transaction.deleteMany({
        $and: [
          {
            status: "PENDING",
          },
          { userId: user.id },
        ],
      });

      const admin = await User.findOne({ email: "admin2@gmail.com" });
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
        } else if (
          refUser.openLah ||
          refUser.adminChangeTier ||
          refUser.createBy === "ADMIN"
        ) {
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
              (receiveUser.tier === user.tier &&
                receiveUser.countPay < user.countPay + 1)
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
          } else {
            const listRefOfReceiver = await Tree.find({
              refId: p.userId,
            });
            if (listRefOfReceiver.length < 2) {
              haveParentNotPayEnough = true;
            }
          }
          //  else if (user.tier >= 2 && user.countPay >= 3 && receiveUser.countChild[0] >= 300) {
          //   const checkRatioCountChild = await checkRatioCountChildOfUser(receiveUser._id);
          //   if (!checkRatioCountChild) haveParentNotPayEnough = true;
          // }
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
        status: "PAY",
        payments,
        paymentIds,
      });
    }
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

const getPaymentNextTierInfo = asyncHandler(async (req, res) => {
  const { user } = req;
  const { childId } = req.query;

  if (user.paymentStep > 0 && childId === "") {
    res.json({
      status: "OK",
      message: `You're all set for the Tier ${user.tier + 1}. Let's move up!`,
      payments: [],
      paymentIds: [],
      userStepPayment: user.paymentStep,
    });
  } else if (user.currentLayer.slice(-1) < 3) {
    res.status(200).json({
      status: "PENDING",
      message: `Your current level is insufficient to upgrade to the tier ${
        user.tier + 1
      }`,
    });
  } else {
    await Transaction.deleteMany({
      $and: [
        {
          status: "PENDING",
        },
        { userId: user.id },
      ],
    });

    const admin = await User.findOne({ email: "admin2@gmail.com" });
    const payments = [];
    const paymentIds = [];
    if (user.fine > 0) {
      const transactionFine = await Transaction.create({
        userId: user.id,
        amount: user.fine,
        userCountPay: user.countPay,
        userId_to: admin._id,
        username_to: "Fine Fee",
        tier: user.tier + 1,
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
      let haveRefNotPayEnough = false;
      let registerFee = parseInt(
        process.env[`REGISTER_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
      );
      let pigFee = parseInt(
        process.env[`DREAMPOOL_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
      );
      let companyFee = parseInt(
        process.env[`HEWE_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
      );
      let directCommissionFee = parseInt(
        process.env[`DIRECT_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
      );
      let referralCommissionFee = parseInt(
        process.env[`CONTRIBUTE_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
      );
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
        tier: user.tier + 1 - user.paymentStep,
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
        tier: user.tier + 1 - user.paymentStep,
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
      if (companyFee > 0) {
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
          tier: user.tier + 1 - user.paymentStep,
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
      }

      let refUser;
      let directCommissionUser;
      const nextTierUserId = await findNextUser(user.tier + 1);
      console.log({ nextTierUserId });
      if (user.paymentStep === 0) {
        refUser = await User.findById(nextTierUserId);
        directCommissionUser = refUser;
      } else if (user.paymentStep === 1 && user.tier === 1) {
        const treeUserTier1 = await Tree.findOne({ userId: user._id, tier: 1 });
        directCommissionUser = await User.findById(treeUserTier1.refId);
        const refTreeUser = await Tree.findOne({
          userId: childId,
          createdAt: { $gt: treeUserTier1.createdAt },
        });
        refUser = await User.findById(refTreeUser.userId);
      } else {
        refUser = await User.findById(childId);
        directCommissionUser = refUser;
      }

      console.log({
        refUser: refUser.userId,
        directCommissionUser: directCommissionUser.userId,
      });

      // giao dich hoa hong truc tiep
      if (refUser.closeLah) {
        haveRefNotPayEnough = true;
      } else if (
        refUser.openLah ||
        refUser.adminChangeTier ||
        refUser.createBy === "ADMIN"
      ) {
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
        userId_to: directCommissionUser._id,
        username_to: directCommissionUser.userId,
        tier: user.tier + 1 - user.paymentStep,
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
        to: directCommissionUser.userId,
      });
      payments.push({
        userName: directCommissionUser.userId,
        amount: directCommissionFee,
      });
      // await generatePackageTrans(
      //   user,
      //   refUser,
      //   directCommissionWallet,
      //   user.continueWithBuyPackageB
      // );

      const ancestorsData = await findAncestors(
        refUser._id,
        10,
        user.tier + 1 - user.paymentStep
      );
      let ancestors = ancestorsData.map((data, index) => {
        if (index === 0) {
          data.isFirst = true;
        }
        return data;
      });
      let countPayUser = 0;
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
            (receiveUser.tier === user.tier &&
              receiveUser.countPay < user.countPay + 1)
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
          tier: user.tier + 1 - user.paymentStep,
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
      status: "OK",
      message: `You're all set for the Tier ${user.tier + 1}. Let's move up!`,
      payments,
      paymentIds,
      userStepPayment: user.paymentStep,
    });
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
  const ancestors = [];
  let currentUserId = userId;

  while (ancestors.length < limit) {
    const treeOfUser = await Tree.findOne({ userId: currentUserId, tier });

    if (!treeOfUser) break;

    let parentTree = null;

    if (treeOfUser.parentId) {
      parentTree = await Tree.findOne({
        userId: treeOfUser.parentId,
        tier,
        createdAt: { $lt: treeOfUser.createdAt },
      }).sort({ createdAt: -1 });
    }

    if (parentTree) {
      ancestors.push(parentTree);
      currentUserId = parentTree.userId;
    } else {
      while (ancestors.length < limit) {
        ancestors.push(treeOfUser);
      }
      break;
    }
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
            await sendMailRefDc({
              senderName: user.userId,
              email: userReceive.email,
            });
          } else {
            await sendMailReceiveCommission({
              senderName: user.userId,
              email: userReceive.email,
            });
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

const onDoneNextTierPayment = asyncHandler(async (req, res) => {
  const { user } = req;
  const { transIds, transactionHash, childId } = req.body;
  const transIdsList = Object.values(transIds);

  if (transIdsList.length > 0) {
    if (transIdsList.length === 1 && transIdsList[0].type === "FINE") {
      user.fine = 0;
    } else {
      for (let transId of transIdsList) {
        const trans = await Transaction.findOneAndUpdate(
          { _id: transId.id, userId: user.id },
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
            // await sendMailRefDc({
            //   senderName: user.userId,
            //   email: userReceive.email,
            // });
          } else {
            // await sendMailReceiveCommission({
            //   senderName: user.userId,
            //   email: userReceive.email,
            // });
          }
        }
      }

      let message = "";
      if (user.paymentStep < user.tier) {
        user.paymentStep = user.paymentStep + 1;
        message = "Please pay next step";
      } else {
        let responseHewe = await getPriceHewe();
        const hewePrice = responseHewe.data.ticker.latest;
        console.log({ hewePrice });
        const totalHewe = Math.round(
          (parseInt(process.env[`HEWE_AMOUNT_TIER${user.tier + 1}`]) + 25) /
            hewePrice
        );
        console.log({ totalHewe });

        user.availableHewe = user.availableHewe + totalHewe;
        user.countPay = 13;
        user.currentLayer = [...user.currentLayer, 0];
        user[`tier${user.tier + 1}Time`] = new Date();
        user.adminChangeTier = true;

        const newChildParent = await Tree.findOne({
          userId: childId,
          tier: user.tier,
          isSubId: false,
        });
        let childsOfChild = [...newChildParent.children];
        newChildParent.children = [...childsOfChild, user._id];
        await newChildParent.save();

        await Tree.create({
          userName: user.userId + "1-1",
          userId: user._id,
          parentId: childId,
          refId: childId,
          tier: user.tier,
          buyPackage: "A",
          children: [],
          isSubId: true,
        });

        const newParentId = await findNextUser(user.tier + 1);
        const newParent = await Tree.findOne({
          userId: newParentId,
          tier: user.tier + 1,
        });
        let childs = [...newParent.children];
        newParent.children = [...childs, user._id];
        await newParent.save();

        await Tree.create({
          userName: user.userId,
          userId: user._id,
          parentId: newParentId,
          refId: newParentId,
          tier: user.tier + 1,
          buyPackage: "A",
          children: [],
        });

        user.tier = user.tier + 1;
        user.paymentStep = 0;
        message = "Payment successful";
      }

      const updatedUser = await user.save();

      if (updatedUser) {
        res.json({ message });
      }
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
    $and: [
      { userId: user.id },
      { status: "SUCCESS" },
      { type: { $ne: "PACKAGE" } },
    ],
  });

  const allPayments = await Transaction.find({
    $and: [
      { userId: user.id },
      { status: "SUCCESS" },
      { type: { $ne: "PACKAGE" } },
    ],
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
      } else if (
        trans.type === "REFERRALHOLD" &&
        userReceive.errLahCode === "OVER30"
      ) {
        throw new Error(`User has not had 3 child within 30 days`);
      } else if (
        trans.type === "REFERRALHOLD" &&
        userReceive.errLahCode === "OVER60"
      ) {
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
      await sendMailRefDc({
        senderName: user.userId,
        email: receiveUser.email,
      });
    } else {
      await sendMailReceiveCommission({
        senderName: user.userId,
        email: receiveUser.email,
      });
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
  let match = {
    status: "SUCCESS",
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

  const transactions = await Transaction.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
  ]);

  const totalCount = await Transaction.countDocuments(match);

  const result = [];

  for (let tran of transactions) {
    const sender = await User.findById(tran.userId);
    const receiver = await User.findById(tran.userId_to);

    result.push({
      _id: tran._id,
      type: tran.type,
      amount: tran.amount,
      isHoldRefund: tran.isHoldRefund,
      status: tran.status,
      createdAt: tran.createdAt,
      tier: tran.tier,
      address_ref: tran.address_ref,
      senderName: sender ? sender.userId : "unknown",
      senderEmail: sender ? sender.email : "unknown",
      senderStatus: sender
        ? sender.status === "DELETED"
          ? "TK đã xoá"
          : ""
        : "unknow",
      receiverName: receiver ? receiver.userId : "unknown",
      receiverEmail: receiver ? receiver.email : "unknown",
    });
  }

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
  getPaymentNextTierInfo,
  onDoneNextTierPayment,
};
