import asyncHandler from "express-async-handler";
import moment from "moment";

import User from "../models/userModel.js";
import sendMail from "../utils/sendMail.js";
import { sendMailGetHewePrice, sendMailUpdateLayerForAdmin } from "../utils/sendMailCustom.js";
import { getCountAllChildren, getCountIncome } from "../controllers/userControllers.js";
import { findRootLayer, getUserClosestToNow } from "../utils/methods.js";
import Tree from "../models/treeModel.js";
import Transaction from "../models/transactionModel.js";
import Honor from "../models/honorModel.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import Config from "../models/configModel.js";

export const deleteUser24hUnPay = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ tier: 1 }, { countPay: 0 }, { isAdmin: false }, { status: { $ne: "DELETED" } }],
  });
  for (let u of listUser) {
    console.log({ userId: u.userId });
    const treeOfUser = await Tree.findOne({ userId: u._id });
    const listRefId = await Tree.find({ refId: treeOfUser._id });
    if (listRefId.length === 0 && treeOfUser.children.length === 0) {
      let parent = await Tree.findById(treeOfUser.parentId);
      if (parent) {
        let childs = parent.children;
        let newChilds = childs.filter((item) => {
          if (item.toString() !== treeOfUser._id.toString()) return item;
        });
        parent.children = [...newChilds];
        await parent.save();

        u.status = "DELETED";
        u.deletedTime = new Date();
        u.oldParents = [parent.userId, ...u.oldParents];
        await u.save();

        await Tree.deleteOne({ userId: u._id });
      } else {
        u.status = "DELETED";
        u.deletedTime = new Date();
        u.oldParents = [parent.userId, ...u.oldParents];
        await u.save();

        await Tree.deleteOne({ userId: u._id });
      }
    }
  }
});

export const countChildToData = asyncHandler(async () => {
  const listTrees = await Tree.find({}).select("tier countChild userId");

  for (let t of listTrees) {
    try {
      console.log({ name: t.userName });
      const countChild = await getCountAllChildren(t._id, t.tier);
      const income = await getCountIncome(t._id, t.tier);
      t.countChild = countChild;
      t.income = income;
      await t.save();
    } catch (error) {
      console.log({ error });
    }
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

export const distributionHewe = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }, { userId: { $ne: "Admin2" } }, { countPay: 13 }],
  }).select("userId totalHewe availableHewe hewePerDay claimedHewe currentLayer");

  for (let u of listUser) {
    try {
      if (u.currentLayer[0] >= 4 && u.totalHewe > 0) {
        u.availableHewe = u.availableHewe + u.totalHewe;
        u.totalHewe = 0;
      } else if (u.totalHewe > u.claimedHewe) {
        u.availableHewe = u.availableHewe + u.hewePerDay;
      }
      await u.save();
    } catch (error) {
      console.log({ error });
    }
  }
});

export const rankingCalc = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [
      { isAdmin: false },
      { userId: { $ne: "Admin2" } },
      { countPay: 13 },
      { status: "APPROVED" },
    ],
  }).exec();

  for (let u of listUser) {
    try {
      const treeOfUser = await Tree.findOne({ userId: u._id, tier: 1 });
      let refChild = await Tree.find({ refId: treeOfUser._id, tier: 1 });
      let refLength = 0;
      for (let child of refChild) {
        let childData = await User.findById(child.userId);
        if (childData.status === "APPROVED" && childData.countPay === 13) {
          refLength += 1;
        }
      }

      if (refLength >= 2) {
        const checkInHonor = await Honor.findOne({ userId: u._id });
        if (!checkInHonor) {
          let currentDay = moment();
          const diffDays = currentDay.diff(u.createdAt, "days");
          if (diffDays < 15) {
            u.availableUsdt = u.availableUsdt + 10;
            u.bonusRef = true;
            await Honor.create({
              userId: u._id,
            });
          }
        }
        u.ranking = 1;
        u.tier1Time = new Date();
      }

      await u.save();
    } catch (error) {
      console.log({ error });
    }
  }
});

export const checkRefWithTime = asyncHandler(async () => {
  const currentDay = moment();
  const listTreeUser = await Tree.find({
    $and: [{ isSubId: false }, { tier: 1 }],
  });

  for (let tree of listTreeUser) {
    const diffDays = currentDay.diff(tree.createdAt, "days");
    const u = await User.findById(tree.userId);

    const listRefId = await Tree.find({ refId: tree._id });
    if (listRefId.length < 2) {
      if (diffDays > 90) {
        u.errLahCode = "OVER90";
      } else if (diffDays > 45) {
        u.errLahCode = "OVER45";
      } else if (diffDays > 35) {
        u.errLahCode = "OVER35";
      }
    } else {
      u.errLahCode = "";
    }

    await u.save();
  }
});

export const blockUserNotKYC = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }, { status: "UNVERIFY" }],
  });

  const currentDay = moment("2025-05-23 00:00:00");
  const fromDate = moment("2025-05-20");
  for (let u of listUser) {
    if (u.createdAt >= fromDate) {
      if (u.facetecTid === "") {
        const diffHours = currentDay.diff(u.createdAt, "hours", true);
        // console.log({ name: u.userId, diffHours });
        if (diffHours > 48) {
          u.status = "LOCKED";
          u.lockedTime = new Date();
        }
      }
    } else {
      if (u.facetecTid === "") {
        const diffDays = currentDay.diff(fromDate, "days");
        // console.log({ name: u.userId, diffDays });
        if (diffDays > 20) {
          u.status = "LOCKED";
          u.lockedTime = new Date();
        }
      }
    }
    await u.save();
  }
});

export const updateHewePrice = asyncHandler(async () => {
  console.log("Update hewe price start");
  let responseHewe = await getPriceHewe();
  if (responseHewe.data.result === "false") {
    await sendMailGetHewePrice();
  } else {
    const hewePrice = responseHewe.data.ticker.latest;
    const hewePriceConfig = await Config.findOne({ label: "HEWE_PRICE" });
    hewePriceConfig.value = hewePrice;
    await hewePriceConfig.save();
  }
  console.log("Update hewe price done");
});

export const test1 = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }, { countPay: 13 }],
  });

  for (let u of listUser) {
    const trans = await Transaction.find({ userId: u._id });
    if (trans.length === 0) {
      console.log({ name: u.userId });
      u.countPay = 0;
      await u.save();
    }
  }
});
