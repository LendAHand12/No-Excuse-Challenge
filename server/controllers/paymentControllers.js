import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import { getParentWithCountPay } from "../utils/getParentWithCountPay.js";
import Refund from "../models/refundModel.js";
import Config from "../models/configModel.js";
import {
  sendActiveLink,
  sendMailGetHewePrice,
  sendMailPaymentForAdmin,
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
  hasTwoBranches,
  getTotalLevel1ToLevel10OfUser,
} from "../utils/methods.js";
import Wallet from "../models/walletModel.js";
import Tree from "../models/treeModel.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import PreTier2Pool from "../models/preTier2PoolModel.js";
import { getListChildNotEnoughBranchOfUser } from "./userControllers.js";
import Order from "../models/orderModel.js";
import moment from "moment";

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
        let registerFee = 10;
        let pigFee = 5;
        let companyFee = 30;
        let directCommissionFee = 55;
        let referralCommissionFee = 10;
        // giao dich dang ky
        payments.push({
          userName: "REGISTRATION & MANAGEMENT FEE",
          amount: registerFee,
        });
        const transactionRegister = await Transaction.create({
          userId: user.id,
          amount: registerFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "REGISTRATION & MANAGEMENT FEE",
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
          to: "REGISTRATION & MANAGEMENT FEE",
        });
        // giao dich con heo
        payments.push({
          userName: "REWARD POOL",
          amount: pigFee,
        });
        const transactionPig = await Transaction.create({
          userId: user.id,
          amount: pigFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "REWARD POOL",
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
          to: "REWARD POOL",
        });
        // giao dich hewe cho cong ty
        payments.push({
          userName: "EXCHANGE FOR HEWE",
          amount: companyFee,
        });
        const transactionCompany = await Transaction.create({
          userId: user.id,
          amount: companyFee,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "EXCHANGE FOR HEWE",
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
          to: "EXCHANGE FOR HEWE",
        });

        // giao dich hoa hong truc tiep
        const refUserData = await User.findById(refUser.userId);

        if (refUserData.closeLah) {
          haveRefNotPayEnough = true;
        } else if (
          refUserData.openLah ||
          refUserData.adminChangeTier ||
          refUserData.createBy === "ADMIN"
        ) {
          haveRefNotPayEnough = false;
        } else {
          if (
            refUserData.status === "LOCKED" ||
            refUserData.tier < user.tier ||
            (refUserData.tier === user.tier && refUserData.countPay < 13) ||
            refUserData.errLahCode === "OVER45"
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
          to: refUser.userName,
          // to: refUser.walletAddress,
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
              receiveUser.errLahCode === "OVER45" ||
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
            let refId = p._id;
            if (p.isSubId) {
              let mainTree = await Tree.findOne({ userId: p.userId, isSubId: false });
              refId = mainTree._id;
            }
            const listRefOfReceiver = await Tree.find({
              refId,
              isSubId: false,
            });

            if (
              listRefOfReceiver.length === 0 ||
              (p.children.length === 2 && listRefOfReceiver.length < 2)
            ) {
              if (p.userId !== refUser.userId) {
                haveParentNotPayEnough = true;
              }
            }
            // else {
            //   let childrenWithCountPay13 = 0;
            //   for (const childTree of listRefOfReceiver) {
            //     const childUser = await User.findById(childTree.userId).select("countPay");
            //     if (childUser && childUser.countPay === 13) {
            //       childrenWithCountPay13++;
            //     }
            //   }

            //   if (childrenWithCountPay13 < 2) {
            //     haveParentNotPayEnough = true;
            //   }
            // }
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
            username_to: p.userName,
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
            // to: receiveUser.walletAddress,
          });
          countPayUser = countPayUser + 1;
          indexFor++;
        }
      }

      const exchangeRate = await Config.findOne({ label: "USD_TO_VND_SELL" });
      res.json({
        status: "PAY",
        payments,
        paymentIds,
        exchangeRate: exchangeRate.value,
      });
    }
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

/**
 * Tạo Order cho thanh toán chuyển khoản ngân hàng
 * @route POST /api/payment/createBankOrder
 * @access Private
 */
const createBankOrder = asyncHandler(async (req, res) => {
  const { user } = req;
  const { totalAmount } = req.body; // Total amount in VND

  if (!totalAmount || totalAmount <= 0) {
    res.status(400);
    throw new Error("Total amount is required and must be greater than 0");
  }

  // Generate unique orderId: NEC + timestamp + random suffix để đảm bảo unique
  // Format: NEC{timestamp}{random} - timestamp 13 chữ số + 3 chữ số random = 19 ký tự
  // Ví dụ: NEC1703123456789123 (19 ký tự: 3 "NEC" + 13 số timestamp + 3 số random)
  let orderId;
  let order;
  let maxRetries = 5;
  let retryCount = 0;

  // Retry logic để đảm bảo orderId unique
  while (retryCount < maxRetries) {
    try {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0"); // 3 chữ số random (000-999)
      orderId = `NEC${String(timestamp).padStart(13, "0")}${randomSuffix}`.toUpperCase();

      // Try to create order
      order = await Order.create({
        orderId: orderId,
        userId: user.id,
        userCountPay: user.countPay || 0,
        tier: user.tier || 1,
        amount: parseFloat(totalAmount),
        type: "PAYMENT",
        status: "PENDING",
        metadata: {
          createdAt: new Date(),
          paymentMethod: "BANK_TRANSFER",
        },
      });

      // Success - break out of loop
      break;
    } catch (error) {
      // Check if it's a duplicate key error (E11000)
      if (error.code === 11000 && error.keyPattern?.orderId) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error(`Failed to create unique orderId after ${maxRetries} retries`);
          res.status(500);
          throw new Error("Failed to create order. Please try again.");
        }
        // Wait a tiny bit before retry to get new timestamp
        await new Promise((resolve) => setTimeout(resolve, 1));
      } else {
        // Different error - rethrow
        throw error;
      }
    }
  }

  console.log("Bank order created:", {
    orderId: order.orderId,
    userId: user.userId,
    amount: order.amount,
  });

  res.status(201).json({
    success: true,
    orderId: order.orderId,
    amount: order.amount,
    message: "Order created successfully",
  });
});

/**
 * Kiểm tra trạng thái order
 * @route GET /api/payment/checkOrder/:orderId
 * @access Private
 */
const checkOrderStatus = asyncHandler(async (req, res) => {
  const { user } = req;
  const { orderId } = req.params;

  if (!orderId) {
    res.status(400);
    throw new Error("OrderId is required");
  }

  const order = await Order.findOne({
    orderId: orderId,
    userId: user.id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json({
    success: true,
    order: {
      orderId: order.orderId,
      status: order.status,
      amount: order.amount,
      processedAt: order.processedAt,
      transferContent: order.transferContent,
    },
  });
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
      message: `Your current level is insufficient to upgrade to the tier ${user.tier + 1}`,
    });
  } else {
    let goNextTier = false;
    let holdForNotEnoughLevel = false;
    const treeOfUser = await Tree.findOne({
      userId: user.id,
      tier: user.tier,
      isSubId: false,
    });
    if (user.currentLayer.slice(-1)[0] === 3) {
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
          const treeUserTier1 = await Tree.findOne({
            userId: user._id,
            tier: 1,
          });
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
            refUser.errLahCode === "OVER45" ||
            (refUser.tier === user.tier && refUser.countPay < 13)
          ) {
            haveRefNotPayEnough = true;
          } else {
            haveRefNotPayEnough = false;
          }
        }

        if (user.paymentStep === 0 && treeOfRefUser.disable) {
          haveRefNotPayEnough = true;
        }

        let payOutForPool = false;
        let rePaymentForPool = 0;
        if (
          directCommissionUser.shortfallAmount > 0 &&
          directCommissionUser.shortfallAmount >= directCommissionFee
        ) {
          payOutForPool = true;
          rePaymentForPool += directCommissionFee;
        }

        const transactionDirect = await Transaction.create({
          userId: user.id,
          amount: directCommissionFee,
          userCountPay: user.countPay,
          userId_to: directCommissionUser._id,
          username_to: treeOfRefUser.userName,
          tier: user.tier + 1 - user.paymentStep,
          buyPackage: user.buyPackage,
          hash: "",
          type: payOutForPool ? "POOLREPAYMENT" : haveRefNotPayEnough ? "DIRECTHOLD" : "DIRECT",
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
              receiveUser.errLahCode === "OVER45" ||
              receiveUser.tier < user.tier
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
          if (user.paymentStep === 0 && p.disable) {
            haveParentNotPayEnough = true;
          }
          let rePayForPoolRef = false;
          if (
            receiveUser.shortfallAmount > 0 &&
            receiveUser.shortfallAmount >= referralCommissionFee + rePaymentForPool
          ) {
            rePayForPoolRef = true;
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
            type: rePayForPoolRef
              ? "POOLREPAYMENT"
              : haveParentNotPayEnough
              ? "REFERRALHOLD"
              : "REFERRAL",
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

      const exchangeRate = await Config.findOne({ label: "USD_TO_VND_SELL" });

      res.json({
        status: "OK",
        message: `You're all set for the Tier ${user.tier + 1}. Let's move up!`,
        payments,
        paymentIds,
        userStepPayment: user.paymentStep,
        holdForNotEnoughLevel,
        notEnoughtChild: holdForNotEnoughLevel
          ? await getTotalLevel1ToLevel10OfUser(treeOfUser, false)
          : {},
        exchangeRate: exchangeRate?.value || 0,
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

export const findAncestors = async (treeId, limit) => {
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
        if (trans.type.includes("POOLREPAYMENT")) {
          const newPreTier2Pool = new PreTier2Pool({
            userId: trans.userId_to,
            amount: trans.amount,
            status: "IN",
          });
          await newPreTier2Pool.save();
        } else if (!trans.type.includes("HOLD")) {
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
      const totalPriceHewe = 200;
      const totalDayReturnHewe = 730;
      const totalHewe = Math.round(totalPriceHewe / hewePrice);
      const hewePerDay = Math.round(totalHewe / totalDayReturnHewe);

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

        if (trans.type.includes("POOLREPAYMENT")) {
          const newPreTier2Pool = new PreTier2Pool({
            userId: trans.userId_to,
            amount: trans.amount,
            status: "IN",
          });
          await newPreTier2Pool.save();

          let userReceive = await User.findOne({ _id: trans.userId_to });
          userReceive.shortfallAmount = userReceive.shortfallAmount - trans.amount;
          await userReceive.save();
        } else if (!trans.type.includes("HOLD")) {
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

        const newChildParent = await Tree.findById(childId);
        const mainTree = await Tree.findOne({ tier: 1, userId: user._id, isSubId: false });
        let childsOfChild = [...newChildParent.children];

        const newTreeTier1 = await Tree.create({
          userName: user.userId + "1-1",
          userId: user._id,
          parentId: childId,
          refId: mainTree.refId,
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
        // Tính dieTime ban đầu: tier 1 = +30 ngày, tier 2 = +45 ngày
        const nextTier = user.tier + 1;
        const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(mainTree, false);
        const initialDieTimeTier2 =
          countChild1 + countChild2 >= 60 && countChild1 >= 19 && countChild2 >= 19
            ? null
            : moment().add(45, "days").toDate();

        const treeOfUserTier2 = await Tree.create({
          userName: user.userId,
          userId: user._id,
          parentId: newParent._id,
          refId: newParent._id,
          tier: nextTier,
          children: [],
          indexOnLevel: highestIndexOfLevel + 1,
          dieTime: initialDieTimeTier2,
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
            tier: pay.tier,
          });
          if (treeOfReceiveUser) {
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
      results.push({ ...payment });
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
        tier: trans.tier,
      });
      const listRefOfReceiver = await Tree.find({
        refId: treeOfReceiveUser._id,
        isSubId: false,
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
  const hasTwoRef = await hasTwoBranches(treeOfReceiveUser._id);
  if (hasTwoRef === false) {
    return `Payment blocked because there are not enough 2 branch`;
  } else if (treeOfReceiveUser.disable) {
    return `User have disabled`;
  } else if (userReceive.status === "LOCKED") {
    return `User parent locked`;
  } else if (userReceive.closeLah) {
    return `User is being blocked from trading`;
  } else if (userReceive.countPay === 0) {
    return `User parent NOT FINISHED REGISTER`;
  } else if (trans.type === "REFERRALHOLD" && userReceive.errLahCode === "OVER45") {
    return `User has not had 2 child within 45 days`;
  } else if (
    listRefOfReceiver.length === 0 ||
    (treeOfReceiveUser.children.length === 2 && listRefOfReceiver.length < 2)
  ) {
    for (let tree of listRefOfReceiver) {
      let u = await User.findOne({ _id: tree.userId, countPay: 13 });
      if (!u) {
        return `Payment blocked because there are not enough 2 redirect user (Not Pay Child)`;
      }
    }
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

const payWithCash = asyncHandler(async (req, res) => {
  const { user } = req;
  const { method, uuid } = req.body;

  user.paymentProcessed = true;
  user.paymentUUID = [...user.paymentUUID, uuid];
  user.paymentMethod = method;

  await user.save();

  await sendMailPaymentForAdmin({ userId: user.userId, uuid });
  res.json({
    message: "Payment is being processed!",
  });
});

const onDonePaymentWithCash = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (user) {
    const transIdsList = await Transaction.find({ userId, status: "PENDING" });
    if (transIdsList.length > 0) {
      for (let transId of transIdsList) {
        const trans = await Transaction.findOneAndUpdate(
          { _id: transId.id, userId: user.id, tier: user.tier },
          { status: "SUCCESS", hash: "" }
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
      const totalPriceHewe = user.city === "IN" ? 200 : 100;
      const totalDayReturnHewe = user.city === "IN" ? 730 : 540;
      const totalHewe = Math.round(totalPriceHewe / hewePrice);
      const hewePerDay = Math.round(totalHewe / totalDayReturnHewe);

      user.paymentProcessed = false;
      user.totalHewe = totalHewe;
      user.hewePerDay = hewePerDay;
      user.countPay = 13;

      const updatedUser = await user.save();

      if (updatedUser) {
        res.json({ message: "Payment accepted successfully" });
      }
    } else {
      throw new Error("No transaction found");
    }
  } else {
    throw new Error("No user found");
  }
});

// @desc    Search order by orderId (Admin) - cho phép search order đã SUCCESS để load transactions PENDING
// @route   GET /api/payment/admin/search-pending
// @access  Private/Admin
const searchPendingOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.query;

  if (!orderId) {
    res.status(400);
    throw new Error("Please provide orderId");
  }

  let orders = [];
  let transactions = [];

  // Search by orderId - cho phép tìm cả order SUCCESS (vì có thể transactions còn PENDING)
  const order = await Order.findOne({ orderId })
    .populate("userId", "userId email phone")
    .sort({ createdAt: -1 });

  if (order) {
    orders.push(order);

    // Get related transactions with PENDING status and matching tier
    // Ngay cả khi order đã SUCCESS, vẫn có thể có transactions còn PENDING chưa được xử lý
    const relatedTransactions = await Transaction.find({
      userId: order.userId.id || order.userId,
      status: "PENDING",
      tier: order.tier, // Tìm transactions theo tier của order
    }).populate("userId_to", "userId email");

    transactions = relatedTransactions;
  }

  res.status(200).json({
    orders,
    transactions,
  });
});

// @desc    Approve bank payment by admin
// @route   POST /api/payment/admin/approve-bank-payment
// @access  Private/Admin
const approveBankPayment = asyncHandler(async (req, res) => {
  const { user: admin } = req;
  const { orderId, transactionIds, bankTransactionId, transferContent, amount, adminNote } =
    req.body;

  if (!orderId && !transactionIds) {
    res.status(400);
    throw new Error("Please provide orderId or transactionIds");
  }

  if (!bankTransactionId) {
    res.status(400);
    throw new Error("Bank transaction ID is required");
  }

  // Update order if provided
  // Cho phép update order ngay cả khi đã SUCCESS (trường hợp order SUCCESS nhưng transactions còn PENDING)
  if (orderId) {
    const order = await Order.findOne({ orderId });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Nếu order chưa SUCCESS thì update status
    if (order.status === "PENDING") {
      order.status = "SUCCESS";
      order.processedBy = admin.id;
      order.processedAt = new Date();
    }

    // Update các field khác nếu có
    if (bankTransactionId) order.bankTransactionId = bankTransactionId;
    if (transferContent) order.transferContent = transferContent;
    if (amount) order.amount = amount;

    await order.save();
  }

  // Update transactions if provided
  if (transactionIds && transactionIds.length > 0) {
    const transIdsList = Array.isArray(transactionIds) ? transactionIds : [transactionIds];

    for (let transId of transIdsList) {
      const transaction = await Transaction.findById(transId);

      if (!transaction) {
        continue;
      }

      if (transaction.status !== "PENDING") {
        continue;
      }

      transaction.status = "SUCCESS";
      transaction.hash = bankTransactionId;

      await transaction.save();

      // Process payment completion
      const userObj = await User.findById(transaction.userId);
      if (userObj) {
        // Handle FINE type
        if (transaction.type === "FINE") {
          userObj.fine = 0;
        } else {
          // Handle POOLREPAYMENT type
          if (transaction.type.includes("POOLREPAYMENT")) {
            const newPreTier2Pool = await PreTier2Pool.create({
              userId: transaction.userId_to,
              amount: transaction.amount,
              status: "IN",
            });
          } else if (!transaction.type.includes("HOLD")) {
            // Update recipient user's available USDT
            const userReceive = await User.findById(transaction.userId_to);
            if (userReceive) {
              userReceive.availableUsdt = (userReceive.availableUsdt || 0) + transaction.amount;
              await userReceive.save();
            }
          }
        }

        // Process first payment for tier 1
        if (userObj.countPay === 0 && userObj.tier === 1) {
          await sendActiveLink(userObj.userId, userObj.email);
        }

        // Calculate and update HEWE
        let responseHewe = await getPriceHewe();
        if (responseHewe.data.result === "false") {
          // Handle error if needed
        }
        const hewePriceConfig = await Config.findOne({ label: "HEWE_PRICE" });
        const hewePrice = responseHewe?.data?.ticker?.latest || hewePriceConfig?.value || 0;
        const totalPriceHewe = 200;
        const totalDayReturnHewe = 730;
        const totalHewe = Math.round(totalPriceHewe / hewePrice);
        const hewePerDay = Math.round(totalHewe / totalDayReturnHewe);

        userObj.totalHewe = totalHewe;
        userObj.hewePerDay = hewePerDay;
        userObj.countPay = 13;
        await userObj.save();
      }
    }
  }

  res.status(200).json({
    message: "Payment approved successfully",
    data: {
      orderId: orderId || null,
      transactionIds: transactionIds || null,
      bankTransactionId,
    },
  });
});

export {
  getPaymentInfo,
  createBankOrder,
  checkOrderStatus,
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
  payWithCash,
  onDonePaymentWithCash,
  searchPendingOrder,
  approveBankPayment,
};
