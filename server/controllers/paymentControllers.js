import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { getParentWithCountPay } from "../utils/getParentWithCountPay.js";
import Refund from "../models/refundModel.js";
import Config from "../models/configModel.js";
import {
  sendActiveLink,
  sendMailGetHewePrice,
  sendMailReceiveCommission,
  sendMailRefDc,
} from "../utils/sendMailCustom.js";
import {
  getRefParentUser,
  findNextUser,
  findHighestIndexOfLevel,
  countChildOfEachLevel,
  totalChildOn2Branch,
  sumLevels,
  checkUserCanNextTier,
  getTotalLevel6ToLevel10OfUser,
} from "../utils/methods.js";
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
          message: "Your current level is insufficient to upgrade to the next tier",
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
        let registerFee = user.city === "US" ? 10 : 5;
        let pigFee = 5;
        let companyFee = 25;
        let kycFee = user.city === "US" ? 5 : 2;
        let directCommissionFee = user.city === "US" ? 55 : 15;
        let referralCommissionFee = user.city === "US" ? 10 : 5;
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
        // KYC
        payments.push({
          userName: "KYC Fee",
          amount: kycFee,
        });
        const transactionKYC = await Transaction.create({
          userId: user.id,
          amount: kycFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "KYC Fee",
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "KYC",
          status: "PENDING",
        });
        paymentIds.push({
          type: "KYC",
          id: transactionKYC._id,
          amount: kycFee,
          to: "KYC Fee",
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
            (refUser.tier === user.tier && refUser.countPay < 13) ||
            refUser.errLahCode === "OVER45"
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
          userId_to: refUser.userId,
          username_to: refUser.userName,
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
          // to: refUser.userName,
          to: refUser.walletAddress,
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

        const treeOfUser = await Tree.findOne({ userId: user.id, tier: 1 });
        const ancestorsData = await findAncestors(treeOfUser._id, 10, user.tier);
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
              (receiveUser.errLahCode === "OVER45" && indexFor > 6) ||
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
          } else {
            const listRefOfReceiver = await Tree.find({
              refId: p._id,
            });
            if (
              listRefOfReceiver.length === 0 ||
              (p.children.length === 2 && listRefOfReceiver.length < 2)
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
            // to: receiveUser.userId,
            to: receiveUser.walletAddress,
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
  } else if (user.currentLayer.slice(-1) < 4) {
    res.status(200).json({
      status: "PENDING",
      message: `Your current level is insufficient to upgrade to the tier ${user.tier + 1}`,
    });
  } else {
    let goNextTier = false;
    let holdForNotEnoughLevel = false;
    const treeOfUser = await Tree.findOne({ userId: user.id, tier: user.tier, isSubId: false });
    if (user.currentLayer.slice(-1)[0] === 5) {
      const checkCanNextTier = await checkUserCanNextTier(treeOfUser);
      if (checkCanNextTier) {
        goNextTier = true;
        holdForNotEnoughLevel = true;
      } else {
        res.status(200).json({
          status: "PENDING",
          message: `Your current level is insufficient to upgrade to the tier ${user.tier + 1}`,
        });
      }
    } else {
      goNextTier = true;
    }

    if (goNextTier) {
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
        let treeOfRefUser;
        const nextTierUserId = await findNextUser(user.tier + 1);
        if (user.paymentStep === 0) {
          refUser = await User.findById(nextTierUserId);
          treeOfRefUser = await Tree.findOne({
            userId: nextTierUserId,
            tier: user.tier + 1,
          });
          directCommissionUser = refUser;
        } else if (user.paymentStep === 1 && user.tier === 1) {
          const treeUserTier1 = await Tree.findOne({ userId: user._id, tier: 1 });
          const treeOfUserRefTier1 = await Tree.findById(treeUserTier1.refId);
          directCommissionUser = await User.findById(treeOfUserRefTier1.userId);

          treeOfRefUser = await Tree.findById(childId);
          refUser = await User.findById(treeOfRefUser.userId);
        } else {
          treeOfRefUser = await Tree.findById(childId);
          refUser = await User.findById(treeOfRefUser.userId);
          directCommissionUser = refUser;
        }

        // console.log({
        //   refUser: treeOfRefUser.userName,
        //   directCommissionUser: directCommissionUser.userId,
        // });

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
          treeOfRefUser._id,
          // user.paymentStep === 1 && user.tier === 1 ? 9 : 10,
          9,
          user.tier + 1 - user.paymentStep
        );

        // if (user.paymentStep === 1 && user.tier === 1) {
        ancestorsData.unshift(treeOfRefUser);
        // }
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
          }
          payments.push({
            userName: p.userName,
            amount: referralCommissionFee,
          });
          const transactionReferral = await Transaction.create({
            userId: user.id,
            amount: referralCommissionFee,
            userCountPay: countPayUser,
            userId_to: receiveUser._id,
            username_to: p.userName,
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
            to: p.userName,
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
        holdForNotEnoughLevel,
        notEnoughtChild: holdForNotEnoughLevel
          ? await getTotalLevel6ToLevel10OfUser(treeOfUser)
          : {},
      });
    }
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

const findAncestors = async (treeId, limit) => {
  const ancestors = [];
  let currentTreeId = treeId;

  while (ancestors.length < limit) {
    const treeOfUser = await Tree.findById(currentTreeId);

    if (!treeOfUser) break;

    let parentTree = null;

    if (treeOfUser.parentId) {
      parentTree = await Tree.findById(treeOfUser.parentId);
    }

    if (parentTree) {
      ancestors.push(parentTree);
      currentTreeId = parentTree._id;
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
          let userReceive = await User.findById(trans.userId_to);
          userReceive.availableUsdt = userReceive.availableUsdt + trans.amount;
          await userReceive.save();
        }

        // if (trans.type === "DIRECT" || trans.type === "REFERRAL") {
        //   let userReceive = await User.findById(trans.userId_to);
        //   if (trans.type === "REFERRAL") {
        //     await sendMailRefDc({
        //       senderName: user.userId,
        //       email: userReceive.email,
        //     });
        //   } else {
        //     await sendMailReceiveCommission({
        //       senderName: user.userId,
        //       email: userReceive.email,
        //     });
        //   }
        // }
      }

      if (user.countPay === 0 && user.tier === 1) {
        // const links = await getActiveLink(user.email, user.userId, user.phone);
        // if (links.length === 1) {
        // await sendActiveLink(user.email, links[0]);
        await sendActiveLink(user.userId, user.email);
        // }
      }

      let responseHewe = await getPriceHewe();
      if (responseHewe.data.result === "false") {
        await sendMailGetHewePrice();
      }
      const hewePriceConfig = await Config.findOne({ label: "HEWE_PRICE" });
      const hewePrice = responseHewe?.data?.ticker?.latest || hewePriceConfig.value;
      console.log({ hewePrice });
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
      }

      let message = "";
      if (user.paymentStep < user.tier) {
        user.paymentStep = user.paymentStep + 1;
        message = "Please pay next step";
      } else {
        let responseHewe = await getPriceHewe();
        const hewePrice = responseHewe?.data?.ticker?.latest || 0.0005287;
        const totalHewe = Math.round(
          (parseInt(process.env[`HEWE_AMOUNT_TIER${user.tier + 1}`]) + 25) / hewePrice
        );

        user.availableHewe = user.totalHewe + user.availableHewe + totalHewe;
        user.totalHewe = 0;
        user.countPay = 13;
        user.currentLayer = [...user.currentLayer, 0];
        user[`tier${user.tier + 1}Time`] = new Date();
        user.adminChangeTier = true;
        if (user.currentLayer[0] === 5) {
          user.tryToTier2 = "YES";
          user.timeToTry = new Date();
        }

        const newChildParent = await Tree.findById(childId);
        let childsOfChild = [...newChildParent.children];

        const newTreeTier1 = await Tree.create({
          userName: user.userId + "1-1",
          userId: user._id,
          parentId: childId,
          refId: childId,
          tier: user.tier,
          buyPackage: "A",
          children: [],
          isSubId: true,
        });

        newChildParent.children = [...childsOfChild, newTreeTier1._id];
        await newChildParent.save();

        const newParentId = await findNextUser(user.tier + 1);
        const newParent = await Tree.findOne({
          userId: newParentId,
          tier: user.tier + 1,
        });

        const highestIndexOfLevel = await findHighestIndexOfLevel(user.tier + 1);
        const treeOfUserTier2 = await Tree.create({
          userName: user.userId,
          userId: user._id,
          parentId: newParent._id,
          refId: newParent._id,
          tier: user.tier + 1,
          children: [],
          indexOnLevel: highestIndexOfLevel + 1,
        });

        let childs = [...newParent.children];
        newParent.children = [...childs, treeOfUserTier2._id];
        await newParent.save();

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
  try {
    let { pageNumber, keyword, status, tier } = req.query;
    const page = Number(pageNumber) || 1;
    let searchType = {};
    if (
      status === "DIRECT" ||
      status === "REFERRAL" ||
      status === "REGISTER" ||
      status === "FINE" ||
      status === "PIG" ||
      status === "KYC" ||
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
        status === "KYC" ||
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
        const userReceive = await User.findById(pay.userId_to);
        if (userReceive) {
          const treeOfReceiveUser = await Tree.findOne({
            userId: pay.userId_to,
            tier: 1,
          });
          const listRefOfReceiver = await Tree.find({
            refId: treeOfReceiveUser._id,
          });
          const checkResult = await checkCanRefund({
            userReceive,
            listRefOfReceiver,
            userCountPay: pay.userCountPay,
            trans: pay,
            treeOfReceiveUser,
          });

          result.push({
            _id: pay._id,
            address_from: pay.address_from,
            tier: pay.tier,
            // hash: pay.hash,
            amount: pay.amount,
            userId: user.userId,
            email: user.email,
            userReceiveId: userReceive ? userReceive.userId : "Unknow",
            userReceiveEmail: userReceive ? userReceive.email : "Unknow",
            type: pay.type,
            userCountPay: pay.userCountPay,
            createdAt: pay.createdAt,
            isHoldRefund: pay.isHoldRefund,
            isOk: checkResult === "" ? true : false,
          });
        }
      }
    }

    res.json({
      payments: result,
      pages: Math.ceil(count / pageSize),
    });
  } catch (err) {
    console.log({ err });
  }
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
    .select("-password")
    .lean();

  let results = [];

  for (let payment of allPayments) {
    if (payment.type.includes("REFERRAL") || payment.type.includes("DIRECT")) {
      const user = await User.findById(payment.userId_to);
      results.push({ ...payment, username_to: user.walletAddress });
    } else {
      results.push({ ...payment });
    }
  }

  res.json({
    payments: results,
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
      const refundTrans = await Refund.findOne({ transId: trans._id });
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
        isPaid: refundTrans ? true : false,
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
      const treeOfReceiveUser = await Tree.findOne({
        userId: userId_to,
        tier: 1,
      });
      const listRefOfReceiver = await Tree.find({
        refId: treeOfReceiveUser._id,
      });
      const checkResult = await checkCanRefund({
        userReceive,
        listRefOfReceiver,
        userCountPay,
        trans,
        treeOfReceiveUser,
      });
      if (checkResult === "") {
        res.json({
          message: "User is OK for a refund",
        });
      } else {
        throw new Error(checkResult);
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

const checkCanRefund = async ({
  userReceive,
  listRefOfReceiver,
  userCountPay,
  trans,
  treeOfReceiveUser,
}) => {
  if (userReceive.status === "LOCKED") {
    return `User parent locked`;
  } else if (userReceive.closeLah) {
    return `User is being blocked from trading`;
  } else if (userReceive.countPay - 1 < userCountPay) {
    return userReceive.countPay === 0
      ? `User parent NOT FINISHED REGISTER`
      : `User parent pay = ${userReceive.countPay - 1} time but user pay = ${userCountPay} time`;
  } else if (trans.type === "REFERRALHOLD" && userReceive.errLahCode === "OVER45") {
    return `User has not had 2 child within 45 days`;
  } else if (
    listRefOfReceiver.length === 0 ||
    (treeOfReceiveUser.children.length === 2 && listRefOfReceiver.length < 2)
  ) {
    return `Payment blocked because there are not enough 2 redirect user`;
  } else {
    return "";
  }
};

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

    // if (trans.type === "REFERRAL") {
    //   await sendMailRefDc({
    //     senderName: user.userId,
    //     email: receiveUser.email,
    //   });
    // } else {
    //   await sendMailReceiveCommission({
    //     senderName: user.userId,
    //     email: receiveUser.email,
    //   });
    // }

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
      senderStatus: sender ? (sender.status === "DELETED" ? "TK đã xoá" : "") : "unknow",
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
