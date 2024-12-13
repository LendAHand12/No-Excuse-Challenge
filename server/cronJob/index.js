import asyncHandler from "express-async-handler";
import moment from "moment";

import DeleteUser from "../models/deleteUserModel.js";
import User from "../models/userModel.js";
import sendMail from "../utils/sendMail.js";
import { sendMailUpdateLayerForAdmin } from "../utils/sendMailCustom.js";
import { getCountAllChildren } from "../controllers/userControllers.js";
import { findRootLayer, getUserClosestToNow } from "../utils/methods.js";
import Tree from "../models/treeModel.js";
import Transaction from "../models/transactionModel.js";

export const deleteUser24hUnPay = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [
      { tier: 1 },
      { countPay: 0 },
      { isAdmin: false },
      { status: { $ne: "DELETED" } },
    ],
  });
  const currentDay = moment();
  for (let u of listUser) {
    const listRefId = await Tree.find({ refId: u._id });
    const tree = await Tree.findOne({ userId: u._id });
    const diffDays = currentDay.diff(u.createdAt, "days");
    if (listRefId.length === 0 && diffDays >= 1 && tree) {
      let parent = await Tree.findOne({ userId: tree.parentId, tier: 1 });
      if (parent && tree) {
        let childs = parent.children;
        let newChilds = childs.filter((item) => {
          if (item.toString() !== u._id.toString()) return item;
        });
        parent.children = [...newChilds];
        await parent.save();

        u.status = "DELETED";
        u.deletedTime = new Date();
        u.oldParents = [parent.userId, ...u.oldParents];
        await u.save();

        await Tree.deleteOne({ userId: u._id });
      }
    }
  }
});

export const checkAPackage = asyncHandler(async () => {
  const currentDay = moment();
  const listUser = await User.find({
    $and: [{ status: "APPROVED" }, { buyPackage: "A" }, { tier: 1 }],
  });

  for (let u of listUser) {
    const diffDays = currentDay.diff(u.createdAt, "days");

    if (diffDays >= 1 && u.countPay < 13) {
      u.status = "LOCKED";
      u.lockedTime = new Date();
    }

    if (diffDays > 30) {
      const listRefId = await Tree.find({ refId: u._id });
      if (listRefId.length < 3) {
        u.errLahCode = "OVER30";
      } else {
        u.errLahCode = "";
      }
    }

    if (u.errLahCode === "OVER30" && diffDays > 60) {
      const listRefId = await Tree.find({ refId: u._id });
      if (listRefId.length < 3) {
        u.errLahCode = "OVER60";
        u.status = "LOCKED";
        u.lockedTime = new Date();
      } else {
        u.errLahCode = "";
      }
    }
    await u.save();
  }
});

export const checkBPackage = asyncHandler(async () => {
  const currentDay = moment();
  const listUser = await User.find({
    $and: [{ status: "APPROVED" }, { buyPackage: "B" }],
  });

  for (let u of listUser) {
    const diffDays = currentDay.diff(u.createdAt, "days");

    if (u.countPay >= 8 && u.countPay <= 12) {
      console.log({ name: u.userId, countPay: u.countPay, tier: u.tier });
      u.countPay = 7;
      if (u.tier === 2) {
        await Transaction.deleteMany({
          $and: [
            { userId: u._id },
            { tier: 2 },
            {
              $or: [
                { userCountPay: 7 },
                { userCountPay: 8 },
                { userCountPay: 9 },
                { userCountPay: 10 },
                { userCountPay: 11 },
                { userCountPay: 12 },
              ],
            },
          ],
        });
      } else {
        await Transaction.deleteMany({
          $and: [
            { userId: u._id },
            { tier: 1 },
            {
              $or: [
                { userCountPay: 7 },
                { userCountPay: 8 },
                { userCountPay: 9 },
                { userCountPay: 10 },
                { userCountPay: 11 },
                { userCountPay: 12 },
              ],
            },
          ],
        });
      }
    }

    if (diffDays >= 1 && u.countPay < 7) {
      u.status = "LOCKED";
      u.lockedTime = new Date();
    }

    if (diffDays > 30) {
      const weekFine = Math.floor((diffDays - 30) / 7) * 2;
      u.fine = weekFine;

      const listRefId = await Tree.find({ refId: u._id });
      if (listRefId.length < 3) {
        u.errLahCode = "OVER30";
      } else {
        u.errLahCode = "";
      }
    }

    if (u.errLahCode === "OVER30" && diffDays > 60) {
      const listRefId = await Tree.find({ refId: u._id });
      if (listRefId.length < 3) {
        u.errLahCode = "OVER60";
        u.status = "LOCKED";
        u.lockedTime = new Date();
      } else {
        u.errLahCode = "";
      }
    }
    await u.save();
  }
});

export const checkCPackage = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }, { status: "APPROVED" }, { buyPackage: "C" }],
  }).select("createdAt countPay fine status email");
  for (let u of listUser) {
    const currentDay = moment(new Date());
    const userCreatedDay = moment(u.createdAt);
    const diffDays = currentDay.diff(userCreatedDay, "days") + 1; // ngày đăng ký đến hôm nay
    const { countPay } = u;
    const countPayWithDays = 7 * (countPay + 1); // số ngày thanh toán theo lần thanh toán
    if (countPayWithDays - diffDays < -7) {
      const listRefId = await Tree.find({ refId: u._id });
      if (u.fine === 2) {
        u.fine = 4;
      } else if (u.fine === 4) {
        // if (listRefId.length === 0) {
        //   let parent = await User.findById(u.parentId);
        //   if (parent) {
        //     let childs = parent.children;
        //     let newChilds = childs.filter((item) => {
        //       if (item.toString() !== u._id.toString()) return item;
        //     });
        //     parent.children = [...newChilds];
        //     await parent.save();

        //     const userDelete = await DeleteUser.create({
        //       userId: u.userId,
        //       oldId: u._id,
        //       email: u.email,
        //       phone: u.phone,
        //       password: u.password,
        //       walletAddress: u.walletAddress,
        //       parentId: u.parentId,
        //       refId: u.refId,
        //     });

        //     await User.deleteOne({ _id: u._id });
        //     await Tree.deleteOne({ userId: u._id });
        //   }
        // } else {
        u.status = "LOCKED";
        u.lockedTime = new Date();
        // }
      }
      await u.save();
    } else if (countPayWithDays - diffDays < 0) {
      if (u.fine === 0) {
        u.fine = 2;
      }
      await u.save();
    } else if (countPayWithDays - diffDays === 0) {
      // send mail payment
      sendMail(u._id, u.email, "Payment to not fine");
    }
  }
});

export const countChildToData = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }],
  }).select("tier countChild");

  for (let u of listUser) {
    const newCountChild = [...u.countChild];
    for (let i = 1; i <= u.tier; i++) {
      const countChild = await getCountAllChildren(u._id, i);
      newCountChild[i - 1] = countChild;
    }
    u.countChild = newCountChild;
    await u.save();
  }

  console.log("updated count Child");
});

export const countLayerToData = asyncHandler(async () => {
  const listUser = await User.find({
    isAdmin: false,
  });

  const result = [];

  for (let u of listUser) {
    let newLayer = [];
    for (let i = 1; i <= u.tier; i++) {
      const layer = await findRootLayer(u._id, i);
      newLayer.push(layer);
    }

    if (areArraysEqual(newLayer, u.currentLayer)) {
      u.oldLayer = u.currentLayer;
      await u.save();
    } else {
      let isChange = false;
      if (u.oldLayer.length === newLayer.length) {
        isChange = true;
      }
      u.oldLayer = u.currentLayer;
      u.currentLayer = newLayer;
      let updatedUser = await u.save();
      if (isChange) {
        result.push(updatedUser);
      }
    }
  }
  await sendMailUpdateLayerForAdmin(result);
  console.log("updated layer");
});

export const resetTransTierUnPay = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ tier: { $gt: 1 } }, { countPay: { $lt: 13 } }],
  });

  for (let u of listUser) {
    console.log({ name: u.userId });
    const listTrans = await Transaction.find({
      userId: u._id,
      tier: u.tier,
      status: "SUCCESS",
    });
    if (listTrans.length > 0) {
      await Transaction.deleteMany({ userId: u._id, tier: u.tier });
      u.countPay = 0;
      u.havePaid = true;
      await u.save();
    }
  }

  console.log(`resetTransTierUnPay done!!!`);
});

export const areArraysEqual = (arr1, arr2) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export const checkBlockChildren = asyncHandler(async () => {
  const currentDay = moment();
  const listUser = await User.find({
    isAdmin: false,
    status: "APPROVED",
  });

  for (let user of listUser) {
    const listRefChild = await Tree.find({
      tier: 1,
      refId: user._id,
    })
      .select("userId userName")
      .populate({
        path: "userId",
        model: "User",
        select: "userId status lockedTime",
      });

    if (listRefChild.length >= 3) {
      const listLockedChild = listRefChild.filter(
        (ele) => ele.userId.status === "LOCKED"
      );
      const countChildLocked = listRefChild.length - listLockedChild.length;
      if (countChildLocked < 2) {
        if (user.lockedTime === null) {
          user.lockedTime = new Date();
          await user.save();
        }
        if (countChildLocked === 1) {
          const closedChild = getUserClosestToNow(listLockedChild);
          const diffDays = currentDay.diff(
            closedChild.userId.lockedTime,
            "days"
          );
          if (diffDays >= 30) {
            user.lockedTime = new Date();
            user.status = "LOCKED";
            await user.save();
          }
        }
        if (countChildLocked === 0) {
          const closedChild = getUserClosestToNow(listLockedChild);
          const diffDays = currentDay.diff(
            closedChild.userId.lockedTime,
            "days"
          );
          if (diffDays >= 45) {
            user.lockedTime = new Date();
            user.status = "LOCKED";
            await user.save();
          }
        }
      }
    }
  }
});
