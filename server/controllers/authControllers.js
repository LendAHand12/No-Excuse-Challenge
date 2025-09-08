import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Tree from "../models/treeModel.js";
import MoveSystem from "../models/moveSystemModel.js";
import { getActivePackages } from "./packageControllers.js";
import Permission from "../models/permissionModel.js";
import {
  checkSerepayWallet,
  checkUserCanNextTier,
  findNextReferrer,
  mergeIntoThreeGroups,
} from "../utils/methods.js";
import axios from "axios";
import Honor from "../models/honorModel.js";
import mongoose from "mongoose";

const checkLinkRef = asyncHandler(async (req, res) => {
  const { ref, receiveId } = req.body;
  let message = "invalidUrl";

  try {
    const treeUserReceive = await Tree.findById(receiveId);
    const treeUserRef = await Tree.findById(ref);

    if (treeUserReceive && treeUserRef) {
      const userReceive = await User.findById(treeUserReceive.userId);
      const userRef = await User.findById(treeUserRef.userId);

      if (userRef.errLahCode === "OVER45") {
        return res.status(400).json({ error: "invalidUrl" });
      }

      if (!treeUserReceive.parentId || treeUserReceive.userName === "NoExcuse 9") {
        message = "validUrl";
        return res.status(200).json({ message });
      }

      if (treeUserReceive.children.length < 2) {
        message = "validUrl";
        return res.status(200).json({
          message,
          city: userReceive.city,
        });
      }

      return res.status(400).json({ error: "full5child" });
    } else {
      return res.status(400).json({ error: message });
    }
  } catch (err) {
    return res.status(400).json({ error: message });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const {
    userId,
    email,
    password,
    ref,
    receiveId,
    phone,
    idCode,
    walletAddress,
    accountName,
    accountNumber,
  } = req.body;

  const userExistsUserId = await User.findOne({
    userId: userId,
    status: { $ne: "DELETED" },
  });
  const userExistsEmail = await User.findOne({
    email: email,
    status: { $ne: "DELETED" },
  });
  const userExistsPhone = await User.findOne({
    $and: [{ phone: { $ne: "" } }, { phone }],
    status: { $ne: "DELETED" },
  });
  const userExistsIdCode = await User.findOne({
    $and: [{ idCode: { $ne: "" } }, { idCode }],
    status: { $ne: "DELETED" },
  });
  const userExistsWalletAddress = await User.findOne({
    walletAddress,
    status: { $ne: "DELETED" },
  });
  const userExistsAccountNumber = await User.findOne({
    accountNumber,
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
    let message = "duplicateWalletAddress";
    res.status(400);
    throw new Error(message);
  } else if (accountNumber && userExistsAccountNumber) {
    let message = "Duplicate account number";
    res.status(400);
    throw new Error(message);
  } else {
    const treeReceiveUser = await Tree.findById(receiveId);

    if (treeReceiveUser.userName === "NoExcuse 9" || treeReceiveUser.children.length < 2) {
      const parent = await User.findById(treeReceiveUser.userId);

      const user = await User.create({
        userId,
        email: email.toLowerCase(),
        phone,
        password,
        walletAddress,
        idCode,
        buyPackage: "A",
        role: "user",
        kycFee: true,
        changeCreatedAt: new Date(),
        city: parent.city,
        accountName,
        accountNumber,
      });

      const tree = await Tree.create({
        userName: user.userId,
        userId: user._id,
        parentId: receiveId,
        refId: ref,
        children: [],
      });

      await sendMail(user._id, email, "email verification");

      treeReceiveUser.children.push(tree._id);
      await treeReceiveUser.save();

      let message = "registerSuccessful";

      res.status(201).json({
        message,
      });
    } else {
      res.status(400);
      throw new Error("Internal error");
    }
  }
});

const mailForEmailVerification = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      // send a verification email, if this user is not a confirmed email
      if (!user.isConfirmed) {
        // send the mail
        await sendMail(user._id, email, "email verification");
        res.status(201).json({
          id: user._id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
          isConfirmed: user.isConfirmed,
        });
      } else {
        res.status(400).json({ message: "userAlreadyConfirmed" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Could not send the mail. Please retry." });
  }
});

const mailForPasswordReset = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user && user.isConfirmed) {
      await sendMail(user._id, email, "forgot password");

      res.status(200).json({
        message: "Recovery mail sended.Please check your mail",
      });
    } else {
      res.status(404).json({ error: "Not found user" });
    }
  } catch (error) {
    res.status(401).json({ error: "Could not send the mail. Please retry." });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { code, password } = req.body;

  let user = await User.findOne({
    $and: [
      { $or: [{ email: code }, { userId: code }] },
      { isConfirmed: true },
      { status: { $nin: ["LOCKED", "DELETED"] } },
    ],
  });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateToken(user._id, "access");
    const refreshToken = generateToken(user._id, "refresh");

    const existingToken = await Token.findOne({ email: user.email });
    if (!existingToken) {
      await Token.create({
        email: user.email,
        token: refreshToken,
      });
    } else {
      existingToken.token = refreshToken;
      existingToken.save();
    }

    const tree = await Tree.findOne({ userId: user._id, tier: 1, isSubId: false });
    const listDirectUser = [];
    if (tree) {
      const listRefIdOfUser = await Tree.find({ refId: tree._id, tier: 1 });
      if (listRefIdOfUser && listRefIdOfUser.length > 0) {
        for (let refId of listRefIdOfUser) {
          const refedUser = await User.findById(refId.userId).select("userId email countChild");
          listDirectUser.push({
            ...refedUser,
          });
        }
      }
    }

    const packages = await getActivePackages();

    const permissions = await Permission.findOne({ role: user.role }).populate(
      "pagePermissions.page"
    );

    const isMoveSystem = await MoveSystem.find({
      userId: user._id,
    });

    let subUser = null;
    if (user.tier === 2) {
      subUser = await Tree.findOne({ userId: user._id, isSubId: true, tier: 1 });
    }

    const checkCanNextTier =
      user.currentLayer.slice(-1) >= 3 ? await checkUserCanNextTier(tree) : false;

    res.status(200).json({
      userInfo: {
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
        oldLayer: user.oldLayer,
        currentLayer: user.currentLayer,
        idCode: user.idCode,
        buyPackage: user.buyPackage,
        continueWithBuyPackageB: user.continueWithBuyPackageB,
        listDirectUser: listDirectUser,
        packages,
        openLah: user.openLah,
        closeLah: user.closeLah,
        tierDate: user.tierDate,
        role: user.role,
        // isSerepayWallet: await checkSerepayWallet(user.walletAddress1),
        isSerepayWallet: true,
        permissions: permissions ? permissions.pagePermissions : [],
        totalHewe: user.totalHewe,
        hewePerDay: user.hewePerDay,
        availableHewe: user.availableHewe,
        availableUsdt: user.availableUsdt,
        claimedHewe: user.claimedHewe,
        claimedUsdt: user.claimedUsdt,
        heweWallet: user.heweWallet,
        ranking: user.ranking,
        chartData: mergeIntoThreeGroups(listDirectUser),
        targetSales: process.env[`LEVEL_${user.ranking + 1}`],
        bonusRef: user.bonusRef,
        totalChild: tree ? tree.countChild : 0,
        income: tree ? tree.income : 0,
        facetecTid: user.facetecTid,
        kycFee: user.kycFee,
        errLahCode: user.errLahCode,
        isMoveSystem: isMoveSystem.length > 0 ? true : false,
        changeCreatedAt: user.changeCreatedAt,
        lockKyc: user.lockKyc,
        city: user.city,
        paymentMethod: user.paymentMethod,
        paymentProcessed: user.paymentProcessed,
        accountName: user.accountName,
        accountNumber: user.accountNumber,
        availableAmc: user.availableAmc,
        claimedAmc: user.claimedAmc,
        subUser,
        checkCanNextTier,
        preTier2Status: user.preTier2Status,
      },
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json({ error: "Login information is incorrect" });
  }
});

const resetUserPassword = asyncHandler(async (req, res) => {
  try {
    // update the user password if the jwt is verified successfully
    const { token, password } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET);
    const user = await User.findById(decodedToken.id);

    if (user && password) {
      user.password = password;
      const updatedUser = await user.save();

      console.log({ updatedUser });
      if (updatedUser) {
        res.status(200).json({
          message: "Password updated. Please login with new password",
        });
      } else {
        res.status(401).json({ error: "Unable to update password" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: "User not found" });
  }
});

const confirmUser = asyncHandler(async (req, res) => {
  try {
    // set the user to a confirmed status, once the corresponding JWT is verified correctly
    const emailToken = req.params.token;
    const decodedToken = jwt.verify(emailToken, process.env.JWT_EMAIL_TOKEN_SECRET);
    const user = await User.findById(decodedToken.id).select("-password");
    user.isConfirmed = true;
    await user.save();
    res.status(200).json({
      message: "",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Token expired",
    });
  }
});

const getAccessToken = asyncHandler(async (req, res) => {
  const { email, refreshToken } = req.body;

  // search if currently loggedin user has the refreshToken sent
  const currentAccessToken = await Token.findOne({ email });

  if (!refreshToken || refreshToken !== currentAccessToken.token) {
    res.status(400).json({ error: "Refresh token not found, login again" });
  }

  // If the refresh token is valid, create a new accessToken and return it.
  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
    if (!err) {
      const accessToken = generateToken(user.id, "access");
      return res.json({ accessToken });
    } else {
      return res.status(400).json({
        message: "Invalid refresh token",
      });
    }
  });
});

const checkSendMail = asyncHandler(async (req, res) => {
  const { mail } = req.body;
  const mailInfo = await sendMail("6480c10538aa7ded76b631c1", mail, "email verification");
  res.json({
    mailInfo,
  });
});

const getLinkVerify = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ $and: [{ email }, { status: { $ne: "DELETED" } }] });
  if (user) {
    if (user.isConfirmed) {
      throw new Error("User confirmed");
    }
    const emailToken = generateToken(user._id, "email");
    const url = `${process.env.FRONTEND_BASE_URL}/confirm?token=${emailToken}`;
    res.json({
      url,
    });
  } else {
    throw new Error("User not found");
  }
});

const updateData = asyncHandler(async (req, res) => {
  const listUser = await User.find();
  for (let user of listUser) {
    await User.findOneAndUpdate({ _id: user._id }, { refId: user.parentId });
  }
  res.json("updated");
});

const getNewPass = asyncHandler(async (req, res) => {
  res.json(bcrypt.hashSync("abcd1234", 12));
});

const registerSerepayFnc = async (userName, email, password) => {
  return axios
    .post(`${process.env.SEREPAY_HOST}/api/user/signup`, {
      userName,
      email,
      password,
    })
    .then(async (response) => {
      return response.data.data;
    })
    .catch((error) => {
      throw new Error(error.response.data.message);
    });
};

const createSerepayUsdtWallet = async (token) => {
  return axios
    .post(
      `${process.env.SEREPAY_HOST}/api/blockico/createWalletBEP20`,
      {
        symbol: "USDT.BEP20",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(async (response) => {
      return response.data.data.address;
    })
    .catch((error) => {
      throw new Error(error.response.data.message);
    });
};

const createSerepayHeweWallet = async (token) => {
  return axios
    .post(
      `${process.env.SEREPAY_HOST}/api/blockico/createWalletBEP20`,
      {
        symbol: "HEWE",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(async (response) => {
      return response.data.data.address;
    })
    .catch((error) => {
      throw new Error(error.response.data.message);
    });
};

const registerSerepay = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  const wallet = await registerSerepayFnc(userName, email, password);
  console.log({ wallet });
});

export {
  checkSendMail,
  checkLinkRef,
  registerUser,
  authUser,
  confirmUser,
  getAccessToken,
  resetUserPassword,
  mailForEmailVerification,
  mailForPasswordReset,
  getLinkVerify,
  updateData,
  getNewPass,
  registerSerepay,
};
