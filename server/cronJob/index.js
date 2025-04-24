import asyncHandler from "express-async-handler";
import moment from "moment";

import User from "../models/userModel.js";
import sendMail from "../utils/sendMail.js";
import { sendMailUpdateLayerForAdmin } from "../utils/sendMailCustom.js";
import { getCountAllChildren, getCountIncome } from "../controllers/userControllers.js";
import { findRootLayer, getUserClosestToNow } from "../utils/methods.js";
import Tree from "../models/treeModel.js";
import Transaction from "../models/transactionModel.js";
import Honor from "../models/honorModel.js";

export const deleteUser24hUnPay = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ tier: 1 }, { countPay: 0 }, { isAdmin: false }, { status: { $ne: "DELETED" } }],
  });
  for (let u of listUser) {
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
  // await sendMailUpdateLayerForAdmin(result);
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
  }).select("userId totalHewe availableHewe hewePerDay claimedHewe");

  for (let u of listUser) {
    try {
      if(u.level >= 4) {
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
      if (u.ranking === 0) {
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
      } else if (u.ranking === 1) {
        if (u.countChild > 30) {
          u.ranking = 2;
          u.tier2Time = new Date();
        }
      } else if (u.ranking === 2) {
        if (u.countChild > 155) {
          u.ranking = 3;
          u.tier3Time = new Date();
        }
      } else if (u.ranking === 3) {
        if (u.countChild > 780) {
          u.ranking = 4;
          u.tier4Time = new Date();
        }
      } else if (u.ranking === 4) {
        if (u.countChild > 3905) {
          u.ranking = 5;
          u.tier5Time = new Date();
        }
      } else if (u.ranking === 5) {
        if (u.countChild > 19530) {
          u.ranking = 6;
          u.tier6Time = new Date();
        }
      } else if (u.ranking === 6) {
        if (u.countChild > 89843) {
          u.ranking = 7;
          u.tier7Time = new Date();
        }
      } else if (u.ranking === 7) {
        if (u.countChild > 441406) {
          u.ranking = 8;
          u.tier8Time = new Date();
        }
      } else if (u.ranking === 8) {
        if (u.countChild > 2199219) {
          u.ranking = 9;
          u.tier9Time = new Date();
        }
      }

      await u.save();
    } catch (error) {
      console.log({ error });
    }
  }
});
