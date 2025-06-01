import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import DeleteUser from "../models/deleteUserModel.js";
import ChangeUser from "../models/changeUserModel.js";
import NextUserTier from "../models/nextUserTierModel.js";
import sendMail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Tree from "../models/treeModel.js";
import { getActivePackages } from "./packageControllers.js";
import {
  checkSerepayWallet,
  findNextUser,
  findNextUserNotIncludeNextUserTier,
  findRootLayer,
  findHighestIndexOfLevel,
  mergeIntoThreeGroups,
  updateValueAtIndex,
} from "../utils/methods.js";
import { areArraysEqual } from "../cronJob/index.js";
import {
  sendMailChangeWalletToAdmin,
  sendMailReject,
  sendMailUserCanInceaseTierToAdmin,
} from "../utils/sendMailCustom.js";
import Permission from "../models/permissionModel.js";
import Withdraw from "../models/withdrawModel.js";
import Config from "../models/configModel.js";
import UserHistory from "../models/userHistoryModel.js";
import { Types } from "mongoose";

dotenv.config();

const getAllUsers = asyncHandler(async (req, res) => {
  const { pageNumber, keyword, status } = req.query;
  const page = Number(pageNumber) || 1;
  const searchStatus = status === "all" ? "" : status;

  const pageSize = 20;

  const count = await User.countDocuments({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
          { email: { $regex: keyword, $options: "i" } }, // Tìm theo email
          { walletAddress: { $regex: keyword, $options: "i" } }, // Tìm theo email
        ],
      },
      {
        role: "user",
      },
      {
        status: { $regex: searchStatus, $options: "i" },
      },
    ],
  });
  const allUsers = await User.find({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
          { email: { $regex: keyword, $options: "i" } }, // Tìm theo email
          { walletAddress: { $regex: keyword, $options: "i" } }, // Tìm theo email
        ],
      },
      {
        role: "user",
      },
      {
        status: { $regex: searchStatus, $options: "i" },
      },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt")
    .select("-password");

  res.json({
    users: allUsers,
    pages: Math.ceil(count / pageSize),
  });
});

const getAllUsersWithKeyword = asyncHandler(async (req, res) => {
  const { keyword } = req.body;

  const allUsers = await User.find({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
          { email: { $regex: keyword, $options: "i" } }, // Tìm theo email
        ],
      },
      {
        isAdmin: false,
      },
      {
        status: "APPROVED",
      },
    ],
  })
    .sort("-createdAt")
    .select("-password");

  res.json({
    users: allUsers,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    const tree = await Tree.findOne({ userId: user._id, tier: 1 });

    const listDirectUser = [];
    const listRefIdOfUser = await Tree.find({ refId: tree._id, tier: 1 });
    if (listRefIdOfUser && listRefIdOfUser.length > 0) {
      for (let refId of listRefIdOfUser) {
        const refedUser = await User.findById(refId.userId).select(
          "userId email walletAddress status countPay tier errLahCode buyPackage countChild"
        );
        listDirectUser.push({
          userId: refedUser.userId,
          isGray: refedUser.status === "LOCKED" ? (req.user.isAdmin ? true : false) : false,
          isRed:
            refedUser.tier === 1 && refedUser.countPay === 0
              ? true
              : refedUser.tier === 1 && refedUser.buyPackage === "A" && refedUser.countPay < 13
              ? true
              : false,
          isYellow: refedUser.errLahCode === "OVER35",
          isBlue: refedUser.errLahCode === "OVER45",
        });
      }
    }
    const listOldParent = [];
    if (user.oldParents && user.oldParents.length > 0) {
      for (let parentId of user.oldParents) {
        const oldParent = await User.findById(parentId).select("userId email walletAddress");
        listOldParent.push(oldParent);
      }
    }
    const changeUser = await ChangeUser.findOne({
      oldUserId: user._id,
      status: "APPROVED",
    }).select("oldUserName oldEmail updatedAt");

    let refUser;
    if (tree && tree.refId) {
      const refTree = await Tree.findById(tree.refId);
      refUser = await User.findById(refTree.userId);
    }

    const withdraws = await Withdraw.find({
      userId: user._id,
    });
    const totalWithdraws = withdraws.reduce((sum, withdraw) => sum + withdraw.amount, 0);
    const withdrawPending = withdraws
      .filter((ele) => ele.status === "PENDING")
      .reduce((sum, withdraw) => sum + withdraw.amount, 0);

    const listTransHold = await Transaction.find({
      userId_to: user.id,
      type: { $regex: "HOLD", $options: "i" },
      status: "SUCCESS",
      isHoldRefund: false,
    });

    const totalHold = listTransHold.reduce((sum, ele) => sum + ele.amount, 0);

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      userId: user.userId,
      isAdmin: user.isAdmin,
      isConfirmed: user.isConfirmed,
      avatar: user.avatar,
      walletAddress: user.walletAddress,
      tier: user.tier,
      createdAt: user.createdAt,
      fine: user.fine,
      status: user.status,
      imgFront: user.imgFront,
      imgBack: user.imgBack,
      countPay: user.countPay,
      phone: user.phone,
      idCode: user.idCode,
      buyPackage: user.buyPackage,
      continueWithBuyPackageB: user.continueWithBuyPackageB,
      oldLayer: user.oldLayer,
      currentLayer: user.currentLayer.length > 0 ? user.currentLayer : [0],
      listDirectUser: listDirectUser,
      openLah: user.openLah,
      closeLah: user.closeLah,
      tierDate: user.tierDate,
      note: user.note,
      lockedTime: user.lockedTime,
      deletedTime: user.deletedTime,
      tier1Time: user.tier1Time,
      tier2Time: user.tier2Time,
      tier3Time: user.tier3Time,
      tier4Time: user.tier4Time,
      tier5Time: user.tier5Time,
      hold: user.hold,
      holdLevel: user.holdLevel,
      changeUser,
      refUserName: refUser ? refUser.userId : "",
      refUserEmail: refUser ? refUser.email : "",
      role: user.role,
      listOldParent,
      // isSerepayWallet: await checkSerepayWallet(user.walletAddress1),
      isSerepayWallet: true,
      totalHewe: user.totalHewe,
      hewePerDay: user.hewePerDay,
      availableHewe: user.availableHewe,
      availableUsdt: user.availableUsdt,
      claimedHewe: user.claimedHewe,
      claimedUsdt: user.claimedUsdt,
      heweWallet: user.heweWallet,
      ranking: user.ranking,
      totalEarning: user.availableUsdt + user.claimedUsdt + totalWithdraws,
      withdrawPending: withdrawPending,
      chartData: mergeIntoThreeGroups(listDirectUser),
      targetSales: process.env[`LEVEL_${user.ranking + 1}`],
      bonusRef: user.bonusRef,
      walletAddressChange: user.walletAddressChange,
      totalHold,
      totalChild: tree.countChild,
      income: tree.income,
      facetecTid: user.facetecTid,
      kycFee: user.kycFee,
      errLahCode: user.errLahCode
    });
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

const getUserInfo = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user) {
    const tree = await Tree.findOne({ userId: user._id, tier: 1 });
    const listDirectUser = [];
    const listRefIdOfUser = await Tree.find({ refId: tree._id, tier: 1 });
    if (listRefIdOfUser && listRefIdOfUser.length > 0) {
      for (let refId of listRefIdOfUser) {
        const refedUser = await User.findById(refId.userId).select(
          "userId email walletAddress status countPay countChild tier errLahCode buyPackage"
        );
        listDirectUser.push({
          userId: refedUser.userId,
          isGray: refedUser.status === "LOCKED" ? (req.user.isAdmin ? true : false) : false,
          isRed:
            refedUser.tier === 1 && refedUser.countPay === 0
              ? true
              : refedUser.tier === 1 && refedUser.countPay < 13
              ? true
              : false,
          isYellow: refedUser.errLahCode === "OVER35",
          isBlue: refedUser.errLahCode === "OVER45",
        });
      }
    }
    const listOldParent = [];
    if (user.oldParents && user.oldParents.length > 0) {
      for (let parentId of user.oldParents) {
        const oldParent = await User.findById(parentId).select("userId email walletAddress");
        listOldParent.push(oldParent);
      }
    }
    const changeUser = await ChangeUser.findOne({
      oldUserId: user._id,
      status: "APPROVED",
    }).select("oldUserName oldEmail updatedAt");

    const withdraws = await Withdraw.find({
      userId: user._id,
    });
    const totalWithdraws = withdraws.reduce((sum, withdraw) => sum + withdraw.amount, 0);
    const withdrawPending = withdraws
      .filter((ele) => ele.status === "PENDING")
      .reduce((sum, withdraw) => sum + withdraw.amount, 0);

    let refUser;
    if (tree && tree.refId) {
      const refTree = await Tree.findById(tree.refId);
      refUser = await User.findById(refTree.userId);
    }

    const listTransHold = await Transaction.find({
      userId_to: user.id,
      type: { $regex: "HOLD", $options: "i" },
      status: "SUCCESS",
      isHoldRefund: false,
    });

    const totalHold = listTransHold.reduce((sum, ele) => sum + ele.amount, 0);

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      userId: user.userId,
      isAdmin: user.isAdmin,
      isConfirmed: user.isConfirmed,
      avatar: user.avatar,
      walletAddress: user.walletAddress,
      tier: user.tier,
      createdAt: user.createdAt,
      fine: user.fine,
      status: user.status,
      imgFront: user.imgFront,
      imgBack: user.imgBack,
      countPay: user.countPay,
      phone: user.phone,
      idCode: user.idCode,
      buyPackage: user.buyPackage,
      continueWithBuyPackageB: user.continueWithBuyPackageB,
      oldLayer: user.oldLayer,
      currentLayer: user.currentLayer,
      listDirectUser: listDirectUser,
      openLah: user.openLah,
      closeLah: user.closeLah,
      tierDate: user.tierDate,
      note: user.note,
      lockedTime: user.lockedTime,
      deletedTime: user.deletedTime,
      tier1Time: user.tier1Time,
      tier2Time: user.tier2Time,
      tier3Time: user.tier3Time,
      tier4Time: user.tier4Time,
      tier5Time: user.tier5Time,
      hold: user.hold,
      holdLevel: user.holdLevel,
      changeUser,
      refUserName: refUser ? refUser.userId : "",
      refUserEmail: refUser ? refUser.email : "",
      role: user.role,
      listOldParent,
      // isSerepayWallet: await checkSerepayWallet(user.walletAddress1),
      isSerepayWallet: true,
      totalHewe: user.totalHewe,
      hewePerDay: user.hewePerDay,
      availableHewe: user.availableHewe,
      availableUsdt: user.availableUsdt,
      claimedHewe: user.claimedHewe,
      claimedUsdt: user.claimedUsdt,
      heweWallet: user.heweWallet,
      ranking: user.ranking,
      totalEarning: user.availableUsdt + user.claimedUsdt + totalWithdraws,
      withdrawPending: withdrawPending,
      chartData: mergeIntoThreeGroups(listDirectUser),
      targetSales: process.env[`LEVEL_${user.ranking + 1}`],
      bonusRef: user.bonusRef,
      walletAddressChange: user.walletAddressChange,
      totalHold,
      totalChild: tree.countChild,
      income: tree.income,
      facetecTid: user.facetecTid,
      kycFee: user.kycFee,
      errLahCode: user.errLahCode,
    });
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { phone, walletAddress, email } = req.body;

  const user = await User.findOne({ _id: req.params.id }).select("-password");
  const userHavePhone = await User.find({
    $and: [{ phone }, { userId: { $ne: user.userId } }, { isAdmin: false }],
  });
  const userHaveWalletAddress = await User.find({
    $and: [{ walletAddress }, { userId: { $ne: user.userId } }, { isAdmin: false }],
  });
  const userHaveEmail = await User.find({
    $and: [{ email }, { userId: { $ne: user.userId } }, { isAdmin: false }],
  });

  if (userHavePhone.length >= 1 || userHaveWalletAddress.length >= 1 || userHaveEmail.length >= 1) {
    res.status(400).json({ error: "duplicateInfo" });
  }
  if (user) {
    const kycConfig = await Config.findOne({ label: "AUTO_KYC_USER_INFO" });

    const changes = [];
    for (const field of ["email", "phone", "walletAddress"]) {
      if (req.body[field] && user[field] !== req.body[field]) {
        changes.push({
          userId: user._id,
          field,
          oldValue: user[field],
          newValue: req.body[field],
          status: kycConfig.value === true ? "approved" : "pending",
          reviewedBy: kycConfig.value === true ? "AUTO" : "",
        });

        if (kycConfig.value) {
          user[field] = req.body[field];
        }

        await UserHistory.deleteMany({ userId: user._id, field, status: "pending" });
      }
    }

    if (changes.length > 0) {
      await UserHistory.insertMany(changes);
    }

    if (kycConfig.value === false) {
      await sendMailChangeWalletToAdmin({
        userId: user._id,
        userName: user.userId,
        phone: user.phone,
        email: user.email,
      });
    }

    const updatedUser = await user.save();
    if (updatedUser) {
      const listDirectUser = [];
      const listRefIdOfUser = await Tree.find({ refId: user._id, tier: 1 });
      if (listRefIdOfUser && listRefIdOfUser.length > 0) {
        for (let refId of listRefIdOfUser) {
          const refedUser = await User.findById(refId.userId).select(
            "userId email walletAddress status countPay countChild tier errLahCode buyPackage"
          );
          listDirectUser.push({
            userId: refedUser.userId,
            isGray: refedUser.status === "LOCKED" ? (req.user.isAdmin ? true : false) : false,
            isRed: refedUser.tier === 1 && refedUser.countPay === 0 ? true : false,
            isYellow: refedUser.errLahCode === "OVER30",
            countChild: refedUser.countChild[0] + 1,
          });
        }
      }

      const withdraws = await Withdraw.find({
        userId: user._id,
      });
      const totalWithdraws = withdraws.reduce((sum, withdraw) => sum + withdraw.amount, 0);
      const withdrawPending = withdraws
        .filter((ele) => ele.status === "PENDING")
        .reduce((sum, withdraw) => sum + withdraw.amount, 0);

      const listTransHold = await Transaction.find({
        userId_to: user.id,
        type: { $regex: "HOLD", $options: "i" },
        status: "SUCCESS",
        isHoldRefund: false,
      });

      const totalHold = listTransHold.reduce((sum, ele) => sum + ele.amount, 0);

      const packages = await getActivePackages();
      const permissions = await Permission.findOne({
        role: user.role,
      }).populate("pagePermissions.page");
      res.status(200).json({
        message: kycConfig.value ? "Updated successfully" : "Change request submitted for approval",
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          userId: updatedUser.userId,
          isAdmin: updatedUser.isAdmin,
          isConfirmed: updatedUser.isConfirmed,
          avatar: updatedUser.avatar,
          walletAddress: updatedUser.walletAddress,
          walletAddress1: updatedUser.walletAddress1,
          walletAddress2: updatedUser.walletAddress2,
          walletAddress3: updatedUser.walletAddress3,
          walletAddress4: updatedUser.walletAddress4,
          walletAddress5: updatedUser.walletAddress5,
          tier: updatedUser.tier,
          createdAt: updatedUser.createdAt,
          fine: updatedUser.fine,
          status: updatedUser.status,
          imgFront: updatedUser.imgFront,
          imgBack: updatedUser.imgBack,
          countPay: updatedUser.countPay,
          phone: updatedUser.phone,
          idCode: updatedUser.idCode,
          oldLayer: updatedUser.oldLayer,
          currentLayer: updatedUser.currentLayer,
          buyPackage: updatedUser.buyPackage,
          continueWithBuyPackageB: updatedUser.continueWithBuyPackageB,
          listDirectUser,
          packages,
          permissions: permissions ? permissions.pagePermissions : [],
          role: updatedUser.role,
          totalHewe: updatedUser.totalHewe,
          hewePerDay: updatedUser.hewePerDay,
          availableHewe: updatedUser.availableHewe,
          availableUsdt: updatedUser.availableUsdt,
          claimedHewe: updatedUser.claimedHewe,
          claimedUsdt: updatedUser.claimedUsdt,
          heweWallet: updatedUser.heweWallet,
          ranking: updatedUser.ranking,
          totalEarning: user.availableUsdt + user.claimedUsdt + totalWithdraws,
          withdrawPending: withdrawPending,
          chartData: mergeIntoThreeGroups(listDirectUser),
          targetSales: process.env[`LEVEL_${updatedUser.ranking + 1}`],
          bonusRef: updatedUser.bonusRef,
          walletAddressChange: updatedUser.walletAddressChange,
          totalHold,
          facetecTid: updatedUser.facetecTid,
          kycFee: updatedUser.kycFee,
          errLahCode: updatedUser.errLahCode,
        },
      });
    }
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

const adminUpdateUser = asyncHandler(async (req, res) => {
  const {
    newStatus,
    newFine,
    isRegistered,
    buyPackage,
    openLah,
    closeLah,
    idCode,
    userId,
    phone,
    email,
    tier,
    walletAddress,
    note,
    hold,
    holdLevel,
    availableHewe,
    availableUsdt,
    rewardHewe,
    hewePerDay,
    level,
    removeErrLahCode
  } = req.body;

  if (userId) {
    const userExistsUserId = await User.findOne({
      userId: { $regex: userId, $options: "i" },
    });
    if (userExistsUserId) {
      let message = "duplicateInfoUserId";
      res.status(400);
      throw new Error(message);
    }
  }

  if (email) {
    const userExistsEmail = await User.findOne({
      email: { $regex: email, $options: "i" },
    });
    if (userExistsEmail) {
      let message = "duplicateInfoEmail";
      res.status(400);
      throw new Error(message);
    }
  }

  if (phone) {
    const userExistsPhone = await User.findOne({
      $and: [{ phone: { $ne: "" } }, { phone }],
    });
    if (userExistsPhone) {
      let message = "Dupplicate phone";
      res.status(400);
      throw new Error(message);
    }
  }

  if (walletAddress) {
    const userExistsWalletAddress = await User.findOne({
      $and: [
        {
          walletAddress,
        },
        { status: { $ne: "DELETED" } },
      ],
    });

    if (userExistsWalletAddress) {
      let message = "Dupplicate wallet address";
      res.status(400);
      throw new Error(message);
    }
  }

  if (idCode) {
    const userExistsIdCode = await User.findOne({
      $and: [{ idCode: { $ne: "" } }, { idCode }],
    });
    if (userExistsIdCode) {
      let message = "duplicateInfoIdCode";
      res.status(400);
      throw new Error(message);
    }
  }

  const user = await User.findOne({ _id: req.params.id }).select("-password");

  if (user) {
    if (userId && user.userId !== userId) {
      user.userId = userId;
      await Tree.updateMany({ userId: user._id }, { userName: userId });
    }
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.idCode = idCode || user.idCode;
    user.hold = hold || user.hold;
    user.holdLevel = holdLevel || user.holdLevel;
    user.availableHewe = availableHewe || user.availableHewe;
    user.availableUsdt = availableUsdt || user.availableUsdt;
    user.walletAddress = walletAddress || user.walletAddress;
    user.hewePerDay = hewePerDay || user.hewePerDay;
    user.totalHewe = rewardHewe || user.totalHewe;
    if (level) {
      const newLevel = user.currentLayer.length > 0 ? [...user.currentLayer] : [0];
      updateValueAtIndex(newLevel, user.tier - 1, level);
      user.currentLayer = [...newLevel];
    }
    if (user.status === "LOCKED" && newStatus !== "LOCKED") {
      user.lockedTime = null;
    }
    user.status = newStatus || user.status;
    if (newStatus === "LOCKED") {
      user.lockedTime = new Date();
    }
    user.fine = newFine || user.fine;
    user.note = note || user.note;
    user.openLah = openLah;
    user.closeLah = closeLah;

    if (req.files && req.files.imgFront && req.files.imgFront[0]) {
      user.imgFront = req.files.imgFront[0].filename || user.imgFront;
    }

    if (req.files && req.files.imgBack && req.files?.imgBack[0]) {
      user.imgBack = req.files.imgBack[0].filename || user.imgBack;
    }

    const listTransSuccess = await Transaction.find({
      $and: [{ userId: user._id }, { status: "SUCCESS" }, { type: { $ne: "REGISTER" } }],
    });
    if (buyPackage && buyPackage !== user.buyPackage) {
      if (listTransSuccess.length === 0) {
        user.buyPackage = buyPackage || user.buyPackage;
        await Tree.updateMany({ $and: [{ userId: user._id }, { tier: 1 }] }, { buyPackage });
      } else {
        res.status(400).json({ error: "User has generated a transaction" });
      }
    }
    if (isRegistered && isRegistered === "on" && user.countPay === 0) {
      user.countPay = 13;
    }
    if (removeErrLahCode && removeErrLahCode === "on" && user.errLahCode !== "") {
      user.errLahCode = "";
    }
    if (tier && user.tier !== tier && tier >= 2) {
      user.countPay = 0;
      user.tier = tier;
      user.countChild = [...user.countChild, 0];
      user.currentLayer = [...user.currentLayer, 0];
      user.tierDate = new Date();
      user.adminChangeTier = true;

      const newParentId = await findNextUser(tier);
      const newParent = await Tree.findOne({
        userId: newParentId,
        tier,
      });
      let childs = [...newParent.children];
      newParent.children = [...childs, user._id];
      await newParent.save();

      await Tree.create({
        userName: user.userId,
        userId: user._id,
        parentId: newParentId,
        refId: newParentId,
        tier,
        buyPackage: "A",
        children: [],
      });
    }

    const updatedUser = await user.save();
    if (updatedUser) {
      res.status(200).json({
        message: "Update successful",
      });
    }
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

const changeStatusUser = asyncHandler(async (req, res) => {
  const { id, status, reason } = req.body;
  const user = await User.findOne({ _id: id }).select("-password");
  if (user) {
    user.status = status || user.status;
    if (status === "REJECTED") {
      user.status = "UNVERIFY";
      user.facetecTid = "";
      await sendMailReject({
        senderName: user.userId,
        email: user.email,
        reason,
      });
    }
    const updatedUser = await user.save();
    if (updatedUser) {
      res.status(200).json({
        message: `${status.toLowerCase()} successful`,
      });
    }
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

const getChildrenList = asyncHandler(async (req, res) => {
  const { id } = req.user;

  let result = await getAllChildren(id);

  res.status(200).json(result);
});

const getTree = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findOne({ _id: id }).select("userId children");

  const tree = { _id: user._id, name: user.userId, children: [] };

  for (const childId of user.children) {
    const childNode = await buildUserTree(childId);
    tree.children.push(childNode);
  }

  res.status(200).json(tree);
});

const getTreeOfUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("userId children");
  if (user) {
    const tree = { _id: user._id, name: user.userId, children: [] };

    for (const childId of user.children) {
      const childNode = await buildUserTree(childId);
      tree.children.push(childNode);
    }

    res.status(200).json(tree);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getChildsOfUserForTree = asyncHandler(async (req, res) => {
  const { id, currentTier } = req.body;
  const userRequest = req.user;
  let treeOfUser;
  let user;
  treeOfUser = await Tree.findById(id).select(
    "userId tier userName children countChild createdAt countChild income"
  );
  if (!treeOfUser) {
    user = await User.findOne({ _id: id }).select("userId createdAt");
    treeOfUser = await Tree.findOne({
      userId: user._id,
      tier: currentTier,
    }).select("userId tier userName children countChild createdAt income");
  } else {
    user = await User.findOne({ _id: treeOfUser.userId }).select("userId createdAt");
  }

  if (treeOfUser.children.length === 0) {
    res.status(404);
    throw new Error("User not have child");
  } else {
    const tree = {
      key: treeOfUser._id,
      label: treeOfUser.userName,
      income: treeOfUser.income,
      totalChild: treeOfUser.countChild,
      nodes: [],
    };
    for (const childId of treeOfUser.children) {
      const childTree = await Tree.findOne({
        _id: childId,
        tier: currentTier,
      });

      const child = await User.findById(childTree.userId).select(
        "tier userId buyPackage countPay fine status errLahCode"
      );

      tree.nodes.push({
        key: childTree._id,
        label: `${childTree.userName}`,
        totalChild: childTree.countChild,
        income: childTree.income,
        isGray:
          child.status === "LOCKED"
            ? currentTier === 1 || userRequest.isAdmin
              ? true
              : false
            : false,
        isRed: child.tier === 1 && child.countPay === 0 ? true : false,
        isYellow: child.errLahCode === "OVER35",
        isBlue: child.errLahCode === "OVER45",
        indexOnLevel: childTree.indexOnLevel,
        isSubId: childTree.isSubId,
      });
    }
    res.status(200).json(tree);
  }
});

const buildUserTree = async (userId) => {
  const user = await User.findOne({ _id: userId }).select("userId children");
  const tree = { _id: user._id, name: user.userId, children: [] };
  for (const childId of user.children) {
    const childTree = await buildUserTree(childId);
    if (childTree) {
      tree.children.push(childTree);
    }
  }

  return tree;
};

const getAllChildren = async (userId) => {
  const user = await User.findById(userId).select("userId children");

  if (!user) {
    return [];
  }

  let children = [];
  for (const childId of user.children) {
    const child = await getAllChildren(childId);
    children = children.concat(child);
  }

  return [user.userId, ...children];
};

const getCountAllChildren = async (treeId, tier) => {
  const tree = await Tree.findById(treeId).select("userId children createdAt");

  if (!tree) {
    return 0;
  }

  let result = tree.children.length;
  for (const childId of tree.children) {
    const treeOfChild = await Tree.findById(childId);
    const count = await getCountAllChildren(treeOfChild._id, tier);
    result += count;
  }

  return result;
};

const getCountIncome = async (treeId, tier) => {
  const tree = await Tree.findById(treeId).select("userId children createdAt");

  if (!tree) {
    return 0;
  }

  let result = tree.children.length;
  for (const childId of tree.children) {
    const treeOfChild = await Tree.findById(childId);
    const child = await User.findById(treeOfChild.userId);
    if (child.countPay === 0) {
      result = result - 1;
    }
    const count = await getCountIncome(treeOfChild._id, tier);
    result += count;
  }

  return result;
};

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (user) {
    const listDirectUser = [];
    const listRefIdOfUser = await Tree.find({ refId: user._id });
    if (listRefIdOfUser && listRefIdOfUser.length > 0) {
      for (let refId of listRefIdOfUser) {
        const refedUser = await User.findById(refId.userId).select(
          "userId email status countPay tier errLahCode buyPackage"
        );
        listDirectUser.push({
          userId: refedUser.userId,
          isGray: refedUser.status === "LOCKED" ? (req.user.isAdmin ? true : false) : false,
          isRed:
            refedUser.tier === 1 && refedUser.countPay === 0
              ? true
              : refedUser.tier === 1 && refedUser.buyPackage === "B" && refedUser.countPay < 7
              ? true
              : refedUser.tier === 1 && refedUser.buyPackage === "A" && refedUser.countPay < 13
              ? true
              : false,
          isYellow: refedUser.errLahCode === "OVER30",
        });
      }
    }
    const packages = await getActivePackages();

    const permissions = await Permission.findOne({ role: user.role }).populate(
      "pagePermissions.page"
    );

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      userId: user.userId,
      isAdmin: user.isAdmin,
      isConfirmed: user.isConfirmed,
      avatar: user.avatar,
      walletAddress1: user.walletAddress1,
      walletAddress2: user.walletAddress2,
      walletAddress3: user.walletAddress3,
      walletAddress4: user.walletAddress4,
      walletAddress5: user.walletAddress5,
      tier: user.tier,
      createdAt: user.createdAt,
      fine: user.fine,
      status: user.status,
      imgFront: user.imgFront,
      imgBack: user.imgBack,
      countPay: user.countPay,
      phone: user.phone,
      idCode: user.idCode,
      buyPackage: user.buyPackage,
      continueWithBuyPackageB:
        packages.includes("B") && packages.includes("C")
          ? user.continueWithBuyPackageB
          : packages.includes("B")
          ? true
          : packages.includes("C")
          ? false
          : user.continueWithBuyPackageB,
      oldLayer: user.oldLayer,
      currentLayer: user.currentLayer,
      listDirectUser: listDirectUser,
      packages,
      openLah: user.openLah,
      closeLah: user.closeLah,
      tierDate: user.tierDate,
      tier1Time: user.tier1Time,
      tier2Time: user.tier2Time,
      tier3Time: user.tier3Time,
      tier4Time: user.tier4Time,
      tier5Time: user.tier5Time,
      hold: user.hold,
      isSerepayWallet: await checkSerepayWallet(user.walletAddress1),
      role: user.role,
      permissions: permissions ? permissions.pagePermissions : [],
      bonusRef: user.bonusRef,
      errLahCode: user.errLahCode
    });
  } else {
    res.status(400);
    throw new Error("User not authorised to view this page");
  }
});

const getListChildOfUser = asyncHandler(async (req, res) => {
  let result = [];

  const parent = await Tree.findOne({
    userId: req.user.id,
    tier: 1,
    isSubId: false,
  }).lean();
  const listRef = await Tree.find({ refId: parent._id });
  if (parent.children.length === 2 && listRef.length === 1) {
    const branchFirstChildId = await findParentTreePath(listRef[0]._id, parent._id);
    const firstChildId =
      parent.children[0] === branchFirstChildId.toString()
        ? parent.children[1]
        : parent.children[0];
    result = await getAllDescendants(firstChildId, 1);
    const firstChild = await Tree.findById(firstChildId);
    if (firstChild.children.length < 2) {
      result.unshift({
        id: firstChild._id,
        userId: firstChild.userId,
        userName: firstChild.userName,
      });
    }
  } else {
    result = await getAllDescendants(parent._id, 1);
  }

  res.json({ userTreeId: parent._id, result });
});

async function findParentTreePath(treeId, targetTreeId) {
  const startTree = await Tree.findById(treeId);

  if (!startTree) return undefined;

  let previousTree = null;
  let currentTree = startTree;

  while (currentTree) {
    if (currentTree._id.equals(targetTreeId)) {
      return previousTree?._id;
    }

    previousTree = currentTree;

    const parent = await Tree.findById(currentTree.parentId);
    if (!parent) break;

    currentTree = parent;
  }

  return undefined;
}

const getListChildNotEnoughBranchOfUser = asyncHandler(async (req, res) => {
  let result = [];

  const parent = await Tree.findOne({
    userId: req.user.id,
    tier: 1,
  }).lean();
  if (!parent) {
    result = [];
  } else {
    result = await getAllDescendants(parent._id, 1);
  }

  res.json(result);
});

async function getAllDescendants(targetUserTreeId, currentTier) {
  try {
    const visited = new Set();
    const results = [];

    async function recurse(nodeId) {
      if (visited.has(nodeId.toString())) return;
      visited.add(nodeId.toString());

      const node = await Tree.findById(nodeId).lean();
      if (!node || !Array.isArray(node.children)) return;

      for (const childId of node.children) {
        const child = await Tree.findById(childId).lean();
        if (child) {
          const childCount = Array.isArray(child.children) ? child.children.length : 0;

          // ✅ Chỉ push nếu số lượng con < 2 và tier === currentTier
          if (childCount < 2 && child.tier === currentTier) {
            results.push({
              id: child._id,
              userId: child.userId,
              userName: child.userName,
            });
          }

          await recurse(child._id); // vẫn tiếp tục tìm sâu xuống
        }
      }
    }

    await recurse(new Types.ObjectId(targetUserTreeId));

    return results;
  } catch (error) {
    console.error("Lỗi khi lấy cấp dưới của người dùng:", error);
    return [];
  }
}

const changeSystem = asyncHandler(async (req, res) => {
  const { moveId, receiveId, withChild } = req.body;

  const movePerson = await User.findById(moveId);
  const receivePerson = await User.findById(receiveId);

  // if (!movePerson || !receiveId) {
  //   res.status(400);
  //   throw new Error("User not found");
  // } else if (receivePerson.children.length === 3) {
  //   res.status(400);
  //   throw new Error("Receive user have full children");
  // } else {
  //   const newMovePerson = { ...movePerson };
  //   const newReceivePerson = { ...receivePerson };

  //   const parentOfMoveChild = await User.findById(newMovePerson.parentId);

  //   if (!withChild) {
  //     if (
  //       newMovePerson.children.length + parentOfMoveChild.children.length - 1 >
  //       3
  //     ) {
  //       res.status(400);
  //       throw new Error(
  //         `Parent of move user have ${parentOfMoveChild.children.length} child and move user have ${newMovePerson.children.length} child > 3`
  //       );
  //     } else {
  //       movePerson.parentId = newReceivePerson._id;
  //       movePerson.children = [];
  //       await movePerson.save();

  //       receivePerson.child.push(movePerson._id);
  //       await receivePerson.save();

  //       const newParentOfMoveChild = parentOfMoveChild.children.filter(
  //         (ele) => ele.toString() !== newMovePerson._id.toString()
  //       );
  //       for (let childId of newMovePerson.children) {
  //         const child = await User.findById(childId);
  //         child.parentId = parentOfMoveChild._id;
  //         parentOfMoveChild.children.push(childId);
  //       }
  //       parentOfMoveChild.children = newParentOfMoveChild;
  //       await parentOfMoveChild.save();
  //     }
  //   } else {
  //     movePerson.parentId = newReceivePerson._id;
  //     await movePerson.save();

  //     receivePerson.child.push(movePerson._id);
  //     await receivePerson.save();

  //     const newParentOfMoveChild = parentOfMoveChild.children.filter(
  //       (ele) => ele.toString() !== newMovePerson._id.toString()
  //     );

  //     parentOfMoveChild.children = newParentOfMoveChild;
  //     await parentOfMoveChild.save();
  //   }

  //   res.json({
  //     message: "Update successful",
  //   });
  // }
});

const getAllDeletedUsers = asyncHandler(async (req, res) => {
  const { pageNumber, keyword } = req.query;
  console.log({ pageNumber, keyword });
  const page = Number(pageNumber) || 1;

  const pageSize = 10;

  const count = await DeleteUser.countDocuments({
    $or: [
      { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
      { email: { $regex: keyword, $options: "i" } }, // Tìm theo email
    ],
  });
  const allUsers = await DeleteUser.find({
    $or: [
      { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
      { email: { $regex: keyword, $options: "i" } }, // Tìm theo email
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt")
    .select("-password");

  res.json({
    users: allUsers,
    pages: Math.ceil(count / pageSize),
  });
});

const getAllUsersForExport = asyncHandler(async (req, res) => {
  let fromDate, toDate;
  const { limit, page } = req.body;
  let match = { role: "user" };

  if (req.body.fromDate) {
    fromDate = req.body.fromDate.split("T")[0];
    match.createdAt = {
      $gte: new Date(new Date(fromDate).valueOf() + 1000 * 3600 * 24),
    };
  }
  if (req.body.toDate) {
    toDate = req.body.toDate.split("T")[0];
    let endDate = new Date(new Date(toDate).valueOf() + 1000 * 3600 * 24);
    endDate.setUTCHours(23, 59, 59, 999);
    match.createdAt = {
      ...match.createdAt,
      $lte: endDate,
    };
  }

  const offset = (page - 1) * limit;

  const users = await User.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "trees",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$userId", { $toString: "$$userId" }] }, { $eq: ["$tier", 1] }],
              },
            },
          },
        ],
        as: "treeData",
      },
    },
    {
      $unwind: { path: "$treeData", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "trees",
        let: { parentId: "$treeData.refId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$userId", { $toString: "$$parentId" }] }, { $eq: ["$tier", 1] }],
              },
            },
          },
        ],
        as: "parent",
      },
    },
    {
      $unwind: { path: "$parent", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "users",
        let: { parentUserId: { $toObjectId: "$parent.userId" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$parentUserId"],
              },
            },
          },
        ],
        as: "parentUser",
      },
    },
    {
      $unwind: { path: "$parentUser", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        walletAddress: 1,
        email: 1,
        fine: 1,
        countPay: 1,
        status: 1,
        countChild: 1,
        tier: 1,
        phone: 1,
        createdAt: 1,
        note: 1,
        treeData: "$treeData",
        parent: "$parent",
        parentUser: "$parentUser",
      },
    },
    { $skip: offset },
    { $limit: limit },
    { $sort: { createdAt: -1 } },
  ]);

  const totalCount = await User.countDocuments(match);

  const result = [];
  for (let u of users) {
    result.push({
      name: u.userId,
      email: u.email,
      phone: u.phone,
      walletAddress: u.walletAddress,
      memberSince: u.createdAt,
      tier: u.tier,
      "count pay": u.countPay,
      fine: u.fine,
      status: u.status,
      refUserName: u.parent ? u.parent.userName : "",
      refUserEmail: u.parentUser ? u.parentUser.email : "",
      note: u.note ? u.note : "",
    });
  }

  res.json({ totalCount, result });
});

const mailForChangeWallet = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (user && user.isConfirmed) {
      await sendMail(user._id, user.email, "change wallet");

      res.status(200).json({
        message: "Change wallet mail sended.Please check your mail",
      });
    } else {
      res.status(404);
      throw new Error("Not found user");
    }
  } catch (error) {
    console.log(error);
    res.status(401);
    throw new Error("Could not send the mail. Please retry.");
  }
});

const changeWallet = asyncHandler(async (req, res) => {
  const { token, newWallet1, newWallet2, newWallet3, newWallet4, newWallet5 } = req.body;
  const decodedToken = jwt.verify(token, process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET);
  if (decodedToken) {
    const user = await User.findById(decodedToken.id);

    if (user) {
      const existWallet1 = await User.findOne({
        userId: { $ne: user.userId },
        walletAddress1: newWallet1,
      });
      if (existWallet1) {
        res.status(400);
        throw new Error("Unable to update wallet");
      }

      const existWallet2 = await User.findOne({
        userId: { $ne: user.userId },
        walletAddress2: newWallet2,
      });
      if (existWallet2) {
        res.status(400);
        throw new Error("Unable to update wallet");
      }

      const existWallet3 = await User.findOne({
        userId: { $ne: user.userId },
        walletAddress3: newWallet3,
      });
      if (existWallet3) {
        res.status(400);
        throw new Error("Unable to update wallet");
      }

      const existWallet4 = await User.findOne({
        userId: { $ne: user.userId },
        walletAddress4: newWallet4,
      });
      if (existWallet4) {
        res.status(400);
        throw new Error("Unable to update wallet");
      }

      const existWallet5 = await User.findOne({
        userId: { $ne: user.userId },
        walletAddress5: newWallet5,
      });
      if (existWallet5) {
        res.status(400);
        throw new Error("Unable to update wallet");
      }

      if (newWallet1) {
        user.walletAddress1 = newWallet1;
      }
      if (newWallet2) {
        user.walletAddress2 = newWallet2;
      }
      if (newWallet3) {
        user.walletAddress3 = newWallet3;
      }
      if (newWallet4) {
        user.walletAddress4 = newWallet4;
      }
      if (newWallet5) {
        user.walletAddress5 = newWallet5;
      }
      const updatedUser = await user.save();

      if (updatedUser) {
        res.status(200).json({
          message: "Your wallet address updated",
        });
      } else {
        res.status(400);
        throw new Error("Unable to update wallet");
      }
    } else {
      res.status(401);
      throw new Error("User not found");
    }
  } else {
    res.status(401);
    throw new Error("token expired");
  }
});

const adminDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  } else {
    for (let tierIndex = 1; tierIndex <= user.tier; tierIndex++) {
      const treeUser = await Tree.findOne({
        userId: user._id,
        tier: tierIndex,
      });
      if (treeUser.children.length > 1) {
        res.status(404);
        throw new Error("This account have child");
      }
    }
    let oldParents = [];
    for (let tierIndex = 1; tierIndex <= user.tier; tierIndex++) {
      const treeUser = await Tree.findOne({
        userId: user._id,
        tier: tierIndex,
      });
      const parentTree = await Tree.findById(treeUser.parentId);
      oldParents.push(treeUser.parentId);
      if (treeUser.children.length === 0) {
        await removeIdFromChildrenOfParent(treeUser, parentTree);
        await deleteTreeOfUserWithTier(user, tierIndex);
      } else if (treeUser.children.length === 1) {
        await removeIdFromChildrenOfParent(treeUser, parentTree);
        await deleteTreeOfUserWithTier(user, tierIndex);
        await pushChildrent1ToUp(treeUser, parentTree, tierIndex);
      }
      await replaceRefId(treeUser._id);
    }

    await addDeleteUserToData(user, oldParents);
    res.json({
      message: "Delete user successfull",
    });
  }
});

const addDeleteUserToData = async (user, parentIds) => {
  user.status = "DELETED";
  user.deletedTime = new Date();
  user.oldParents = [...parentIds, ...user.oldParents];
  await user.save();
  await Tree.deleteOne({ userId: user._id, tier: 1 });
};

const deleteTreeOfUserWithTier = async (user, tier) => {
  await Tree.deleteOne({ userId: user._id, tier });
};

const removeIdFromChildrenOfParent = async (treeUser, parentTree) => {
  let childs = parentTree.children;
  let newChilds = childs.filter((item) => {
    if (item.toString() !== treeUser._id.toString()) return item;
  });
  parentTree.children = [...newChilds];
  await parentTree.save();
};

const pushChildrent1ToUp = async (userTree, parentTree) => {
  const childTree = await Tree.findById(userTree.children[0]);
  const userUp = await User.findById(childTree.userId);
  userUp.oldParents = [childTree.parentId, ...userUp.oldParents];
  await userUp.save();
  childTree.parentId = parentTree._id;
  childTree.refId = childTree.refId === userTree._id ? parentTree._id : childTree.refId;
  await childTree.save();
  parentTree.children.push(childTree._id);
  await parentTree.save();
};

const replaceRefId = async (deleteUserTreeId) => {
  const listTreeHaveRefId = await Tree.find({ refId: deleteUserTreeId });

  for (let treeUser of listTreeHaveRefId) {
    treeUser.refId = treeUser.parentId;
    await treeUser.save();
  }
};

const countChildOfUserById = async (user) => {
  if (user) {
    const newCountChild = [...user.countChild];
    for (let i = 1; i <= user.tier; i++) {
      const countChild = await getCountAllChildren(user._id, i);
      newCountChild[i - 1] = countChild;
    }
    user.countChild = newCountChild;
    const updatedUser = await user.save();
    return updatedUser;
  } else {
    throw new Error("User not found");
  }
};

const onAcceptIncreaseTier = asyncHandler(async (req, res) => {
  const u = req.user;
  const { type } = req.body;

  let nextTier = u.tier + 1;
  const canIncreaseTier = await checkCanIncreaseNextTier(u);
  if (canIncreaseTier) {
    if (type === "ACCEPT") {
      await NextUserTier.deleteMany({ tier: u.tier });
      await sendMailUserCanInceaseTierToAdmin(u);
      await checkUnPayUserOnTierUser(u.tier + 1);
      const newParentId = await findNextUser(nextTier);
      const newParent = await Tree.findOne({
        userId: newParentId,
        tier: nextTier,
      });
      let childs = [...newParent.children];
      newParent.children = [...childs, u._id];
      await newParent.save();

      const highestIndexOfLevel = await findHighestIndexOfLevel(nextTier);
      const tree = await Tree.create({
        userName: u.userId,
        userId: u._id,
        parentId: newParentId,
        refId: newParentId,
        tier: nextTier,
        children: [],
        indexOnLevel: highestIndexOfLevel,
      });

      u.tier = nextTier;
      u.countPay = 0;
      u.countChild = [...u.countChild, 0];
      u.currentLayer = [...u.currentLayer, 0];
      u.tierDate = new Date();
      u[`tier${nextTier}Time`] = new Date();
      await u.save();
    }
    res.json({ canIncrease: true });
  } else {
    res.json({ canIncrease: false });
  }
});

const checkCanIncreaseNextTier = async (u) => {
  try {
    if (u.fine > 0) {
      return false;
    }
    if (u.buyPackage === "A" && u.countPay === 13) {
      let updatedUser = { ...u._doc };
      if (updatedUser.currentLayer.slice(-1) < 3) {
        updatedUser = await updateCurrentLayerOfUser(u.id);
      }
      if (updatedUser.currentLayer.slice(-1) >= 3) {
        const haveC = await doesAnyUserInHierarchyHaveBuyPackageC(u.id, 1);
        return !haveC;
      } else {
        const countedUser = await countChildOfUserById(u);
        if (countedUser.countChild.slice(-1) >= 300) {
          const listChildId = await Tree.find({
            parentId: u._id,
            tier: u.tier,
          }).select("userId");

          let highestChildSales = 0;
          let lowestChildSales = Infinity;

          for (const childId of listChildId) {
            const child = await User.findById(childId.userId);

            if (child.countChild > highestChildSales) {
              highestChildSales = child.countChild;
            }

            if (child.countChild < lowestChildSales) {
              lowestChildSales = child.countChild;
            }
          }

          if (highestChildSales >= 0.4 * u.countChild && lowestChildSales >= 0.2 * u.countChild) {
            // const haveC = await doesAnyUserInHierarchyHaveBuyPackageC(u.id, 1);
            return true;
          }
        }
      }
    }
    return false;
  } catch (error) {
    throw new Error("Internal server error");
  }
};

const doesAnyUserInHierarchyHaveBuyPackageC = async (userId) => {
  const recursiveCheck = async (userId, count) => {
    let cnt = count | 0;

    const tree = await Tree.findOne({ userId });

    if (!tree) {
      return false;
    }

    if (tree.buyPackage === "C" && cnt <= 3) {
      return true;
    }

    // if (tree.buyPackage === "C") {
    //   console.log({ tree });
    //   return true;
    // }

    if (tree.children && tree.children.length > 0) {
      for (const childId of tree.children) {
        if (cnt === 3) continue;
        cnt += 1;
        const childHasBuyPackageC = await recursiveCheck(childId, cnt);
        if (childHasBuyPackageC) {
          return true;
        }
      }
    } else {
      cnt = 0;
    }

    return false;
  };

  const hasBuyPackageC = await recursiveCheck(userId);
  return hasBuyPackageC;
};

const adminCreateUser = asyncHandler(async (req, res) => {
  const { userId, walletAddress, email, password, phone, idCode, tier, parentTier1, parentTier2 } =
    req.body;

  const userExistsUserId = await User.findOne({
    userId,
    status: { $ne: "DELETED" },
  });
  const userExistsEmail = await User.findOne({
    email,
    status: { $ne: "DELETED" },
  });
  const userExistsPhone = await User.findOne({
    $and: [{ phone: { $ne: "" } }, { phone }],
    status: { $ne: "DELETED" },
  });
  const userExistsWalletAddress = await User.findOne({
    walletAddress: walletAddress,
    status: { $ne: "DELETED" },
  });
  const userExistsIdCode = await User.findOne({
    $and: [{ idCode: { $ne: "" } }, { idCode }],
    status: { $ne: "DELETED" },
  });

  if (userExistsUserId) {
    let message = "duplicateInfoUserId";
    res.status(400);
    throw new Error(message);
  } else if (userExistsEmail) {
    let message = "duplicateInfoEmail";
    res.status(400);
    throw new Error(message);
  } else if (userExistsPhone) {
    let message = "Dupplicate phone";
    res.status(400);
    throw new Error(message);
  } else if (userExistsIdCode) {
    let message = "duplicateInfoIdCode";
    res.status(400);
    throw new Error(message);
  } else if (userExistsWalletAddress) {
    let message = "Dupplicate wallet address";
    res.status(400);
    throw new Error(message);
  } else {
    const newUser = new User({
      userId,
      email,
      phone,
      password,
      walletAddress,
      idCode,
      tier: 2,
      createBy: "ADMIN",
      currentLayer: Array.from({ length: tier }, () => 0),
      status: "APPROVED",
      isConfirmed: true,
      role: "user",
      countPay: 13,
    });

    if (req.files && req.files.imgFront && req.files.imgFront[0]) {
      newUser.imgFront = req.files.imgFront[0].filename;
    }

    if (req.files && req.files.imgBack && req.files?.imgBack[0]) {
      newUser.imgBack = req.files.imgBack[0].filename;
    }

    await newUser.save();

    const parentTreeTier1 = await Tree.findById(parentTier1);
    const parentTreeTier2 = await Tree.findById(parentTier2);

    const treeOfUserTier1 = await Tree.create({
      userName: newUser.userId,
      userId: newUser._id,
      parentId: parentTier1,
      refId: "64cd449ec75ae7bc7ebbab03",
      tier: 1,
      children: [],
      indexOnLevel: 0,
    });

    const treeOfUserTier2 = await Tree.create({
      userName: newUser.userId,
      userId: newUser._id,
      parentId: parentTier2,
      refId: parentTier2,
      tier: 2,
      children: [],
      indexOnLevel: 0,
    });

    let childs1 = [...parentTreeTier1.children];
    parentTreeTier1.children = [...childs1, treeOfUserTier1._id];
    await parentTreeTier1.save();

    let childs2 = [...parentTreeTier2.children];
    parentTreeTier2.children = [...childs2, treeOfUserTier2._id];
    await parentTreeTier2.save();

    let message = "createUserSuccessful";

    res.status(201).json({
      message,
    });
  }
});

const updateCurrentLayerOfUser = async (id) => {
  const u = await User.findById(id);
  let newLayer = [];
  for (let i = 1; i <= u.tier; i++) {
    const layer = await findRootLayer(u._id, i);
    newLayer.push(layer);
  }

  if (areArraysEqual(newLayer, u.currentLayer)) {
    u.oldLayer = u.currentLayer;
    const updatedUser = await u.save();
    return updatedUser;
  } else {
    u.oldLayer = u.currentLayer;
    u.currentLayer = newLayer;
    const updatedUser = await u.save();
    return updatedUser;
  }
};

const getListNextUserWithTier = asyncHandler(async (req, res) => {
  const listTier = [2, 3, 4, 5];
  const listNextUserTier = [];
  for (let tier of listTier) {
    const nextUserIdTier = await findNextUser(tier);
    const nextUserTier = await User.findById(nextUserIdTier);
    const nextUserInDB = await findNextUserTierInDB(tier);
    if (nextUserInDB) {
      listNextUserTier.push({
        userId: nextUserInDB._id,
        userName: nextUserInDB.userId,
        tier,
      });
    } else {
      listNextUserTier.push({
        userId: nextUserTier._id,
        userName: nextUserTier.userId,
        tier,
      });
    }
  }
  res.json(listNextUserTier);
});

const findNextUserTierInDB = async (tier) => {
  const nextUserDBTier = await NextUserTier.findOne({ tier });
  if (nextUserDBTier) {
    const user = await User.findById(nextUserDBTier.userId);
    return user;
  } else {
    return null;
  }
};

const getUsersWithTier = asyncHandler(async (req, res) => {
  const { pageNumber, searchKey, tier } = req.body;
  const nextUserWithTier = await findNextUserNotIncludeNextUserTier(tier);
  const treeOfNextUserWithTier = await Tree.findOne({
    userId: nextUserWithTier,
    tier,
  });
  const page = Number(pageNumber) || 1;

  const pageSize = 10;

  const count = await Tree.countDocuments({
    $and: [
      { userName: { $regex: searchKey, $options: "i" } },
      {
        tier,
      },
      { children: { $not: { $size: 3 } } },
      { createdAt: { $gte: treeOfNextUserWithTier.createdAt } },
    ],
  });
  const allUsers = await Tree.find({
    $and: [
      { userName: { $regex: searchKey, $options: "i" } },
      {
        tier,
      },
      { children: { $not: { $size: 3 } } },
      { createdAt: { $gte: treeOfNextUserWithTier.createdAt } },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: 1 })
    .select("-password");

  res.json({
    users: allUsers,
    pages: Math.ceil(count / pageSize),
  });
});

const changeNextUserTier = asyncHandler(async (req, res) => {
  const { userId, tier } = req.body;

  const tree = await Tree.findOne({ userId, tier });

  if (tree) {
    if (tree.children.length >= 3) {
      res.status(500);
      throw new Error("full3child");
    } else {
      await NextUserTier.deleteMany({ tier });

      await NextUserTier.create({ userId, tier });

      res.status(200).json({
        message: "Update successful",
      });
    }
  } else {
    res.status(500);
    throw new Error("Tree does not exist");
  }
});

const checkUnPayUserOnTierUser = async (tier) => {
  const lastUserInTier = await Tree.findOne({ tier }).sort({ createdAt: -1 });
  const listTrans = await Transaction.find({
    userId: lastUserInTier.userId,
    tier,
    status: "SUCCESS",
  });
  if (listTrans.length === 0) {
    let user = await User.findById(lastUserInTier.userId);
    if (!user.havePaid) {
      // user.countPay = 13;
      user.tier = user.tier - 1;
      const newCountChild = user.countChild.slice(0, -1);
      user.countChild = [...newCountChild];
      const newCurrentLayer = user.currentLayer.slice(0, -1);
      user.currentLayer = [...newCurrentLayer];
      await user.save();

      let parent = await Tree.findOne({
        userId: lastUserInTier.parentId,
        tier,
      });
      if (parent) {
        let childs = parent.children;
        let newChilds = childs.filter((item) => {
          if (item !== lastUserInTier.userId) return item;
        });
        parent.children = [...newChilds];
        await parent.save();

        await Tree.deleteOne({
          userId: lastUserInTier.userId,
          tier,
        });
      }
    }
  }

  return;
};

const getLastUserInTier = asyncHandler(async (req, res) => {
  const { tier } = req.body;
  const lastUser = await Tree.findOne({ tier }).sort({ createdAt: -1 });
  if (lastUser) {
    const listTrans = await Transaction.find({
      userId: lastUser.userId,
      tier,
      status: "SUCCESS",
    });
    let user = await User.findById(lastUser.userId);
    if (user.havePaid) {
      res.json(null);
    }
    if (listTrans.length === 0) {
      res.json(lastUser);
    } else {
      res.json(null);
    }
  } else {
    res.json(null);
  }
});

const removeLastUserInTier = asyncHandler(async (req, res) => {
  const { userId, tier } = req.body;
  console.log({ userId, tier });
  const listTrans = await Transaction.find({
    userId,
    tier,
    status: "SUCCESS",
  });
  const lastUser = await Tree.findOne({ userId, tier });
  if (listTrans.length === 0) {
    let user = await User.findById(userId);
    if (!user.havePaid) {
      // user.countPay = 13;
      user.tier = user.tier - 1;
      const newCountChild = user.countChild.slice(0, -1);
      user.countChild = [...newCountChild];
      const newCurrentLayer = user.currentLayer.slice(0, -1);
      user.currentLayer = [...newCurrentLayer];
      await user.save();

      let parent = await Tree.findOne({
        userId: lastUser.parentId,
        tier,
      });
      if (parent) {
        let childs = parent.children;
        let newChilds = childs.filter((item) => {
          if (item !== lastUser.userId) return item;
        });
        parent.children = [...newChilds];
        await parent.save();

        await Tree.deleteOne({
          userId: lastUser.userId,
          tier,
        });

        res.json({ message: "removeTreeSuccess" });
      }
    } else {
      res.json({ message: "accountHanvePaid" });
    }
  } else {
    res.json({ message: "accountHanvePaid" });
  }
});

const createAdmin = asyncHandler(async (req, res) => {
  const { userId, email, password, role } = req.body;

  const userExistsUserId = await User.findOne({
    userId: { $regex: userId, $options: "i" },
  });
  const userExistsEmail = await User.findOne({
    email: { $regex: email, $options: "i" },
  });

  if (userExistsUserId) {
    let message = "duplicateInfoUserId";
    res.status(400);
    throw new Error(message);
  } else if (userExistsEmail) {
    let message = "duplicateInfoEmail";
    res.status(400);
    throw new Error(message);
  } else {
    await User.create({
      userId,
      email,
      password,
      imgBack: "",
      imgFront: "",
      tier: 5,
      countPay: 13,
      createBy: "ADMIN",
      status: "APPROVED",
      isConfirmed: true,
      role,
      isAdmin: true,
    });

    let message = "createUserSuccessful";

    res.status(201).json({
      message,
    });
  }
});

const getListAdmin = asyncHandler(async (req, res) => {
  const allUsers = await User.find({ role: { $ne: "user" } })
    .sort("-createdAt")
    .select("-password");

  res.json({
    admins: allUsers,
  });
});

const updateAdmin = asyncHandler(async (req, res) => {
  console.log({ data: req.body });
  const { email, role, password } = req.body;
  const user = await User.findOne({ _id: req.params.id }).select("-password");

  if (email) {
    const userHaveEmail = await User.find({
      $and: [{ email }],
    });
    if (userHaveEmail.length > 1) {
      res.status(400).json({ error: "duplicateInfo" });
    }
  }

  if (user) {
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password;
    await user.save();

    res.json({
      message: "Update successful",
    });
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await User.deleteOne({ _id: id });

  res.json({
    message: "delete successful",
  });
});

const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await User.findById(id);

  if (admin) {
    const { userId, email, _id, role } = admin;
    res.json({
      admin: {
        userId,
        email,
        _id,
        role,
      },
    });
  } else {
    res.status(400).json({ error: "Admin not found" });
  }
});

const adminChangeWalletUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findOne({ _id: userId }).select("walletAddress walletAddressChange");
  if (user) {
    user.walletAddress = user.walletAddressChange;
    user.walletAddressChange = "";
    const updatedUser = await user.save();
    if (updatedUser) {
      res.status(200).json({
        message: `Update successful`,
      });
    }
  } else {
    res.status(400).json({ error: "User not found" });
  }
});

const getListUserForCreateAdmin = asyncHandler(async (req, res) => {
  let resultTier1 = [];
  let resultTier2 = [];

  const treeOfUser1 = await Tree.findOne({
    userId: "6494e9101e2f152a593b66f2",
    tier: 1,
  });
  const treeOfUser2 = await Tree.findOne({
    userId: "6494e9101e2f152a593b66f2",
    tier: 2,
  });

  resultTier1 = await getAllDescendants(treeOfUser1._id, 1);
  resultTier2 = await getAllDescendants(treeOfUser2._id, 2);

  res.json({ resultTier1, resultTier2 });
});

export {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  changeStatusUser,
  getTree,
  getListChildOfUser,
  getTreeOfUser,
  getChildsOfUserForTree,
  getAllUsersWithKeyword,
  changeSystem,
  getChildrenList,
  getCountAllChildren,
  getAllDeletedUsers,
  getAllUsersForExport,
  mailForChangeWallet,
  changeWallet,
  adminUpdateUser,
  adminDeleteUser,
  countChildOfUserById,
  onAcceptIncreaseTier,
  checkCanIncreaseNextTier,
  adminCreateUser,
  getListNextUserWithTier,
  getUsersWithTier,
  changeNextUserTier,
  getLastUserInTier,
  removeLastUserInTier,
  createAdmin,
  getListAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminById,
  getUserInfo,
  adminChangeWalletUser,
  getListChildNotEnoughBranchOfUser,
  getListUserForCreateAdmin,
  getCountIncome,
};
