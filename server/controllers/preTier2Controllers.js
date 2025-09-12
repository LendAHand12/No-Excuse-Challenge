import asyncHandler from "express-async-handler";
import Withdraw from "../models/withdrawModel.js";
import User from "../models/userModel.js";
import {
  findHighestIndexOfLevel,
  findNextUser,
  getTotalLevel6ToLevel10OfUser,
  removeAccents,
} from "../utils/methods.js";
import mongoose from "mongoose";
import PreTier2 from "../models/preTier2Model.js";
import Transaction from "../models/transactionModel.js";
import Income from "../models/incomeModel.js";
import Config from "../models/configModel.js";
import { sendMailGetHewePrice } from "../utils/sendMailCustom.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import PreTier2Pool from "../models/preTier2PoolModel.js";
import Tree from "../models/treeModel.js";
import ChangeOrderHistory from "../models/changeOrderHistoryModel.js";
import { findAncestors } from "./paymentControllers.js";
import moment from "moment";

const getAllPreTier2Users = asyncHandler(async (req, res) => {
  let { pageNumber, keyword, status } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;
  const searchStatus = status === "all" ? "" : status;

  const matchStage = { status: { $regex: searchStatus, $options: "i" } };

  // Nếu có filter status

  const keywordRegex = keyword
    ? { $regex: removeAccents(keyword), $options: "i" }
    : null;

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
        $or: [
          { "userInfo.userId": keywordRegex },
          { "userInfo.email": keywordRegex },
          { "userInfo.walletAddress": keywordRegex },
        ],
      },
    });
  }

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await PreTier2.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { order: 1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        order: 1,
        userId: 1,
        status: 1,
        createdAt: 1,
        achievedTime: 1,
        passedTime: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const data = await PreTier2.aggregate(aggregationPipeline);

  const results = [];
  for (let user of data) {
    const tree = await Tree.findOne({
      userId: user.userId,
      isSubId: false,
      tier: 1,
    });
    const { countChild1, countChild2 } = await getTotalLevel6ToLevel10OfUser(
      tree
    );
    results.push({
      ...user,
      countChild1: countChild1,
      countChild2: countChild2,
    });
  }

  res.json({
    data: results,
    pages: Math.ceil(count / pageSize),
  });
});

const getPreTier2UsersForUser = asyncHandler(async (req, res) => {
  let { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = { status: { $in: ["PENDING", "ACHIEVED"] } };

  const keywordRegex = keyword
    ? { $regex: removeAccents(keyword), $options: "i" }
    : null;

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
        $or: [
          { "userInfo.userId": keywordRegex },
          { "userInfo.email": keywordRegex },
          { "userInfo.walletAddress": keywordRegex },
        ],
      },
    });
  }

  // Đếm số bản ghi sau khi lọc
  const countAggregation = await PreTier2.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp (không dùng order trong document nữa, chỉ dùng createdAt)
  aggregationPipeline.push(
    { $sort: { order: 1 } }, // sắp xếp theo thời gian vào bảng
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        userId: 1,
        status: 1,
        createdAt: 1,
        achievedTime: 1,
        passedTime: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
          walletAddress: 1,
        },
      },
    }
  );

  const data = await PreTier2.aggregate(aggregationPipeline);

  const results = [];
  for (let index = 0; index < data.length; index++) {
    const user = data[index];
    const tree = await Tree.findOne({
      userId: user.userId,
      isSubId: false,
      tier: 1,
    });

    const { countChild1, countChild2 } = await getTotalLevel6ToLevel10OfUser(
      tree
    );

    // gán order động theo trang
    const order = (page - 1) * pageSize + index;

    results.push({
      ...user,
      order,
      countChild1: countChild1,
      countChild2: countChild2,
    });
  }

  res.json({
    data: results,
    pages: Math.ceil(count / pageSize),
  });
});

const approveUserPreTier2 = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    user.preTier2Status = "APPROVED";
    user.timeOkPreTier2 = new Date();
    await user.save();

    res.status(200).json({ message: "Update successful" });
  } catch (err) {
    res.status(400).json({ error: "Internal Error" });
  }
});

const achievedUserTier2 = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const pre = await PreTier2.findById(id);
    if (pre) {
      pre.status = "ACHIEVED";
      pre.achievedTime = new Date();
      pre.achievedBy = "ADMIN";
      await pre.save();

      const user = await User.findById(pre.userId);
      user.tryToTier2 = "YES";
      user.timeToTry = moment().add(30, "days").toDate();
      await user.save();
    }

    res.status(200).json({ message: "Update successful" });

    setImmediate(async () => {
      try {
        await reorderPreTier2Orders();
      } catch (err) {
        console.error("Error in reorderPreTier2Orders function:", err);
      }
    });
  } catch (err) {
    res.status(400).json({ error: "Internal Error" });
  }
});

const getPaymentInfo = asyncHandler(async (req, res) => {
  const { user } = req;

  if (user) {
    if (
      user.preTier2Status === "APPROVED" ||
      user.preTier2Status === "ACHIEVED"
    ) {
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
        let registerFee = 10;
        let companyFee = 20;
        let preTier2Pool = 201;
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
        // giao dich pre tier 2 pool
        payments.push({
          userName: "Pre-Tier2 Pool",
          amount: preTier2Pool,
        });
        const transactionPrePool = await Transaction.create({
          userId: user.id,
          amount: preTier2Pool,
          userCountPay: user.countPay,
          userId_to: admin._id,
          username_to: "Pre-Tier2 Pool",
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "PRETIER2",
          status: "PENDING",
        });
        paymentIds.push({
          type: "PRETIER2",
          id: transactionPrePool._id,
          amount: preTier2Pool,
          to: "Pre-Tier2 Pool",
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
      }
      res.json({
        status: "PAY",
        payments,
        paymentIds,
      });
    } else {
      res.status(200).json({
        status: "PENDING",
        message: `Your current level is insufficient to upgrade to Pre-Tier 2`,
      });
    }
  } else {
    res.status(404);
    throw new Error("User does not exist");
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
          { _id: transId.id },
          { status: "SUCCESS", hash: transactionHash }
        );
      }

      let responseHewe = await getPriceHewe();
      if (responseHewe.data.result === "false") {
        await sendMailGetHewePrice();
      }
      const hewePriceConfig = await Config.findOne({ label: "HEWE_PRICE" });
      const hewePrice =
        responseHewe?.data?.ticker?.latest || hewePriceConfig.value;
      const totalHewe = Math.round(20 / hewePrice);

      user.availableHewe = user.availableHewe + totalHewe;
      user.preTier2Status = "PASSED";

      const newIncome = new Income({
        userId: user.id,
        amount: totalHewe,
        coin: "HEWE",
        from: "Buy Hewe Pre-Tier2",
        type: "",
      });

      await newIncome.save();

      const lastUserPreTier2 = await PreTier2.findOne()
        .sort({ order: -1 })
        .lean();

      const newPreTier2User = new PreTier2({
        userId: user.id,
        order: lastUserPreTier2 ? lastUserPreTier2.order + 1 : 0,
        status: "PENDING",
      });

      await newPreTier2User.save();

      const newPreTier2Pool = new PreTier2Pool({
        userId: user.id,
        amount: 201,
        status: "IN",
      });

      await newPreTier2Pool.save();
    }

    const updatedUser = await user.save();

    if (updatedUser) {
      res.json({ message: "system update successful" });

      setImmediate(async () => {
        try {
          await onUserPassTier2();
          await reorderPreTier2Orders();
        } catch (err) {
          console.error("Error in post-response function:", err);
        }
      });
    }
  } else {
    throw new Error("No transaction found");
  }
});

const onUserPassTier2 = async () => {
  try {
    const listPendingPreTier2 = await PreTier2.find({ status: "PENDING" });
    for (let pre of listPendingPreTier2) {
      const treeOfUser = await Tree.findOne({
        userId: pre.userId,
        tier: 1,
        isSubId: false,
      });
      const { countChild1, countChild2 } = await getTotalLevel6ToLevel10OfUser(
        treeOfUser
      );

      if (
        (countChild1 >= 20 && countChild2 >= 42) ||
        (countChild1 >= 42 && countChild2 >= 20)
      ) {
        pre.status = "ACHIEVED";
        pre.achievedTime = new Date();
      }

      await pre.save();
    }
  } catch (err) {
    console.error("❌ Error in checkRemoveTopPreTier2User:", err);
    throw err;
  }
};

export const reorderPreTier2Orders = async () => {
  // Lấy tất cả theo order hiện tại
  const allDocs = await PreTier2.find();

  // Gom nhóm
  const passed = allDocs
    .filter((d) => d.status === "PASSED")
    .sort((a, b) => a.createdAt - b.createdAt);
  const achieved = allDocs
    .filter((d) => d.status === "ACHIEVED")
    .sort((a, b) => a.createdAt - b.createdAt);
  const pending = allDocs
    .filter((d) => d.status === "PENDING")
    .sort((a, b) => a.createdAt - b.createdAt);

  // Ghép lại
  const ordered = [...passed, ...achieved, ...pending];

  // Update lại order từ 1 → N
  for (let i = 0; i < ordered.length; i++) {
    ordered[i].order = i + 1;
    await ordered[i].save();
  }

  return { message: "Reorder done", total: ordered.length };
};

const changeOrderByAdmin = asyncHandler(async (req, res) => {
  const admin = req.user; // admin đang thao tác
  const { id, action } = req.body;

  try {
    const docFrom = await PreTier2.findById(id);
    if (!docFrom) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (docFrom.status !== "PENDING") {
      return res
        .status(400)
        .json({ error: "Only PENDING users can change order" });
    }

    const currentOrder = docFrom.order;

    // tìm document liền kề theo action, nhưng chỉ lấy doc có status = "PENDING"
    let docTo;

    if (action === "up") {
      // tìm doc PENDING gần nhất phía trên
      docTo = await PreTier2.findOne({
        order: { $lt: currentOrder },
        status: "PENDING",
      }).sort({ order: -1 });
      if (!docTo) {
        return res.status(400).json({ error: "Already at the top" });
      }
    } else if (action === "down") {
      // tìm doc PENDING gần nhất phía dưới
      docTo = await PreTier2.findOne({
        order: { $gt: currentOrder },
        status: "PENDING",
      }).sort({ order: 1 });
      if (!docTo) {
        return res.status(400).json({ error: "Already at the bottom" });
      }
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (!docTo) {
      return res
        .status(404)
        .json({ error: "Target document not found or not PENDING" });
    }

    // hoán đổi order
    const order1 = docFrom.order;
    const order2 = docTo.order;
    docFrom.order = order2;
    docTo.order = order1;

    await docFrom.save();
    await docTo.save();

    // lưu lịch sử đổi chỗ
    const history = new ChangeOrderHistory({
      userIdFrom: docFrom.userId,
      userIdTo: docTo.userId,
      orderFrom: order1,
      orderTo: order2,
      approveBy: admin.userId,
    });
    await history.save();

    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getPaymentTier2Info = asyncHandler(async (req, res) => {
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
  } else {
    let goNextTier = false;
    let holdForNotEnoughLevel = false;
    const treeOfUser = await Tree.findOne({
      userId: user.id,
      tier: user.tier,
      isSubId: false,
    });

    const checkCanNextTier = await PreTier2.findOne({
      userId: user.id,
      status: "ACHIEVED",
    });
    if (checkCanNextTier) {
      goNextTier = true;
      holdForNotEnoughLevel = true;
    } else {
      res.status(200).json({
        status: "PENDING",
        message: `Your current level is insufficient to upgrade to the tier ${
          user.tier + 1
        }`,
      });
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
          process.env[
            `DREAMPOOL_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`
          ]
        );
        let companyFee = parseInt(
          process.env[`HEWE_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
        );
        let directCommissionFee = parseInt(
          process.env[`DIRECT_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`]
        );
        let referralCommissionFee = parseInt(
          process.env[
            `CONTRIBUTE_AMOUNT_TIER${user.tier + 1 - user.paymentStep}`
          ]
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

        if (user.paymentStep === 0 && treeOfRefUser.disable) {
          haveRefNotPayEnough = true;
        }

        let payOutForPool = false;
        let rePaymentForPool = 0;
        if (
          user.paymentStep === 0 &&
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
          type: payOutForPool
            ? "POOLREPAYMENT"
            : haveRefNotPayEnough
            ? "DIRECTHOLD"
            : "DIRECT",
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
          if (user.paymentStep === 0 && p.disable) {
            haveParentNotPayEnough = true;
          }
          let rePayForPoolRef = false;
          if (
            user.paymentStep === 0 &&
            receiveUser.shortfallAmount > 0 &&
            receiveUser.shortfallAmount >=
              referralCommissionFee + rePaymentForPool
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
      res.json({
        status: "OK",
        message: `You are eligible to advance to Tier 2 through the Pre-Tier2 program. All required payments for the transactions below will be covered from the Pre-Tier2 Pool`,
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

const onDoneTier2Payment = asyncHandler(async (req, res) => {
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
        if (user.paymentStep === 0 && trans.type.includes("POOLREPAYMENT")) {
          const newPreTier2Pool = new PreTier2Pool({
            userId: trans.userId_to,
            amount: trans.amount,
            status: "IN",
          });
          await newPreTier2Pool.save();

          let userReceive = await User.findOne({ _id: trans.userId_to });
          userReceive.shortfallAmount =
            userReceive.shortfallAmount - trans.amount;
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
          (parseInt(process.env[`HEWE_AMOUNT_TIER${user.tier + 1}`]) + 25) /
            hewePrice
        );

        user.availableHewe = user.totalHewe + user.availableHewe + totalHewe;
        user.totalHewe = 0;
        user.countPay = 13;
        user.currentLayer = [...user.currentLayer, 0];
        user[`tier${user.tier + 1}Time`] = new Date();
        user.adminChangeTier = true;
        // if (user.currentLayer[0] === 5) {
        //   user.tryToTier2 = "YES";
        //   user.timeToTry = new Date();
        // }

        const newChildParent = await Tree.findById(childId);
        const mainTree = await Tree.findOne({
          tier: 1,
          userId: user._id,
          isSubId: false,
        });
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

        const highestIndexOfLevel = await findHighestIndexOfLevel(
          user.tier + 1
        );
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
        user.shortfallAmount = 402;
        message = "Payment successful";

        const preTier2User = await PreTier2.findOne({
          userId: user._id,
          status: "ACHIEVED",
        });
        preTier2User.status = "PASSED";
        preTier2User.passedTime = new Date();
        await preTier2User.save();

        const newPreTier2Pool = new PreTier2Pool({
          userId: user._id,
          amount: 603,
          status: "OUT",
        });

        await newPreTier2Pool.save();
      }

      const updatedUser = await user.save();

      if (updatedUser) {
        res.json({ message });

        setImmediate(async () => {
          try {
            await reorderPreTier2Orders();
          } catch (err) {
            console.error("Error in reorderPreTier2Orders function:", err);
          }
        });
      }
    }
  } else {
    throw new Error("No transaction found");
  }
});

const getInfoPreTier2Pool = asyncHandler(async (req, res) => {
  let { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};

  const keywordRegex = keyword
    ? { $regex: removeAccents(keyword), $options: "i" }
    : null;

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
  const countAggregation = await PreTier2Pool.aggregate([
    ...aggregationPipeline,
    { $count: "total" },
  ]);
  const count = countAggregation[0]?.total || 0;

  // Thêm phân trang và sắp xếp
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        status: 1,
        amount: 1,
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

  const results = await PreTier2Pool.aggregate(aggregationPipeline);

  res.json({
    results,
    pages: Math.ceil(count / pageSize),
    totalAmount: await getBalanceOfPreTier2Pool(),
  });
});

export const getBalanceOfPreTier2Pool = async () => {
  const totalAggregation = await PreTier2Pool.aggregate([
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $cond: [
              { $eq: ["$status", "IN"] },
              "$amount",
              { $multiply: ["$amount", -1] },
            ],
          },
        },
      },
    },
  ]);
  return totalAggregation[0]?.total || 0;
};

export {
  getAllPreTier2Users,
  approveUserPreTier2,
  getPaymentInfo,
  onDonePayment,
  changeOrderByAdmin,
  getPaymentTier2Info,
  onDoneTier2Payment,
  getInfoPreTier2Pool,
  getPreTier2UsersForUser,
  achievedUserTier2,
};
