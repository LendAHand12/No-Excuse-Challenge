import asyncHandler from "express-async-handler";
import ChangeUser from "../models/changeUserModel.js";
import User from "../models/userModel.js";
import Tree from "../models/treeModel.js";

const createChangeUser = asyncHandler(async (req, res) => {
  const {
    newUserId,
    newWalletAddress,
    newEmail,
    newPhone,
    newIdCode,
    newImgFront,
    newImgBack,
    reasonRequest,
  } = req.body;
  const { user } = req;

  const userExistsUserId = await User.findOne({
    userId: { $regex: newUserId, $options: "i" },
  });
  const userExistsEmail = await User.findOne({
    email: { $regex: newEmail, $options: "i" },
  });
  const userExistsPhone = await User.findOne({
    $and: [{ phone: { $ne: "" } }, { phone: newPhone }],
  });
  const userExistsWalletAddress = await User.findOne({
    walletAddress: { $in: [newWalletAddress] },
  });
  const userExistsIdCode = await User.findOne({
    $and: [{ idCode: { $ne: "" } }, { idCode: newIdCode }],
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
    await ChangeUser.create({
      oldUserId: user._id,
      oldUserName: user.userId,
      newUserId,
      newWalletAddress: [newWalletAddress],
      newEmail,
      newPhone,
      newIdCode,
      newImgFront,
      newImgBack,
      reasonRequest,
      status: "PENDING",
    });

    let message = "createChangeUserSuccessful";

    res.status(201).json({
      message,
    });
  }
});

const getAllChangeUsers = asyncHandler(async (req, res) => {
  const { pageNumber, keyword } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 20;

  const count = await ChangeUser.countDocuments({
    $and: [
      {
        $or: [
          { newUserId: { $regex: keyword, $options: "i" } },
          { newEmail: { $regex: keyword, $options: "i" } },
          { oldUserId: { $regex: keyword, $options: "i" } },
          { oldEmail: { $regex: keyword, $options: "i" } },
        ],
      },
    ],
  });
  const allChangeUsers = await ChangeUser.find({
    $and: [
      {
        $or: [
          { newUserId: { $regex: keyword, $options: "i" } },
          { newEmail: { $regex: keyword, $options: "i" } },
          { oldUserId: { $regex: keyword, $options: "i" } },
          { oldEmail: { $regex: keyword, $options: "i" } },
        ],
      },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt");

  res.json({
    users: allChangeUsers,
    pages: Math.ceil(count / pageSize),
  });
});

const getChangeUsersByUserId = asyncHandler(async (req, res) => {
  const { user } = req;
  const changeUser = await ChangeUser.findOne({
    oldUserId: user._id,
    $or: [{ status: "REJECTED" }, { status: "PENDING" }],
  });

  res.json({
    changeUser,
  });
});

const cancleChangeUsersByUserId = asyncHandler(async (req, res) => {
  const { user } = req;
  const changeUser = await ChangeUser.findOne({
    oldUserId: user._id,
    $or: [{ status: "REJECTED" }, { status: "PENDING" }],
  });

  changeUser.status = "CANCELED";

  await changeUser.save();

  res.json({
    status: "200",
  });
});

const getChangeUsersById = asyncHandler(async (req, res) => {
  const changeUser = await ChangeUser.findById(req.params.id);

  res.json({
    changeUser,
  });
});

const rejectChangeUser = asyncHandler(async (req, res) => {
  const { changeUserId, reasonReject } = req.body;
  const changeUser = await ChangeUser.findById(changeUserId);

  changeUser.status = "REJECTED";
  changeUser.reasonReject = reasonReject;

  await changeUser.save();

  res.json({
    message: "rejected",
  });
});

const approveChangeUser = asyncHandler(async (req, res) => {
  const { changeUserId } = req.body;
  const changeUser = await ChangeUser.findById(changeUserId);

  const user = await User.findById(changeUser.oldUserId);

  changeUser.oldWalletAddress = user.walletAddress;
  changeUser.oldEmail = user.email;
  changeUser.status = "APPROVED";

  await changeUser.save();

  await Tree.updateMany(
    { userId: user._id },
    { userName: changeUser.newUserId }
  );

  user.userId = changeUser.newUserId;
  user.email = changeUser.newEmail;
  user.phone = changeUser.newPhone;
  user.idCode = changeUser.newIdCode;
  user.walletAddress = changeUser.newWalletAddress;
  user.imgFront = changeUser.newImgFront;
  user.imgBack = changeUser.newImgBack;

  await user.save();

  res.json({
    message: "approved",
  });
});

export {
  getAllChangeUsers,
  createChangeUser,
  getChangeUsersByUserId,
  cancleChangeUsersByUserId,
  getChangeUsersById,
  rejectChangeUser,
  approveChangeUser,
};
