import asyncHandler from "express-async-handler";
import moment from "moment";
import fs from "fs";

import User from "../models/userModel.js";
import {
  sendMailChangeSystemForUser,
  sendMailGetHewePrice,
  sendMailUpdateLayerForAdmin,
} from "../utils/sendMailCustom.js";
import { getCountAllChildren, getCountIncome } from "../controllers/userControllers.js";
import {
  addDays,
  findRootLayer,
  getTotalLevel1ToLevel10OfUser,
  getTotalLevel6ToLevel10OfUser,
  getUserClosestToNow,
  hasTwoBranches,
} from "../utils/methods.js";
import Tree from "../models/treeModel.js";
import Transaction from "../models/transactionModel.js";
import Honor from "../models/honorModel.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import Config from "../models/configModel.js";
import Income from "../models/incomeModel.js";
import PreTier2 from "../models/preTier2Model.js";
import mongoose from "mongoose";

export const deleteUser24hUnPay = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ tier: 1 }, { countPay: 0 }, { isAdmin: false }, { status: { $ne: "DELETED" } }],
  });
  for (let u of listUser) {
    const currentDay = moment();
    const diffHours = currentDay.diff(u.createdAt, "hours", true);

    if (diffHours >= 24) {
      console.log({ user: u.userId, diffHours });
      const treeOfUser = await Tree.findOne({ userId: u._id });
      if (treeOfUser.children.length === 2) {
        console.log({ userId2: u.userId });
      } else if (treeOfUser.children.length === 1) {
        console.log({ userId1: u.userId });
      } else {
        await Tree.updateMany(
          { refId: treeOfUser._id },
          { $set: { refId: "64cd449ec75ae7bc7ebbab03" } }
        );
        let parent = await Tree.findById(treeOfUser.parentId);
        if (parent) {
          let childs = parent.children;
          let newChilds = childs.filter((item) => {
            if (item.toString() !== treeOfUser._id.toString()) return item;
          });
          parent.children = [...newChilds];
          const updatedParent = await parent.save();
          if (treeOfUser.children.length === 1 && updatedParent.children.length < 2) {
            const firstChild = await Tree.findById(treeOfUser.children[0]);
            firstChild.parentId = updatedParent._id;
            firstChild.refId =
              firstChild.refId === treeOfUser._id ? "64cd449ec75ae7bc7ebbab03" : firstChild.refId;
            await firstChild.save();
            const newUpdatedParentChildren = [...updatedParent.children, firstChild._id];
            updatedParent.children = newUpdatedParentChildren;
            await updatedParent.save();
          }
          if (treeOfUser.children.length === 2 && updatedParent.children.length === 0) {
            const firstChild = await Tree.findById(treeOfUser.children[0]);
            firstChild.parentId = updatedParent._id;
            firstChild.refId === treeOfUser._id ? "64cd449ec75ae7bc7ebbab03" : firstChild.refId;
            await firstChild.save();
            const secondChild = await Tree.findById(treeOfUser.children[1]);
            secondChild.parentId = updatedParent._id;
            secondChild.refId === treeOfUser._id ? "64cd449ec75ae7bc7ebbab03" : secondChild.refId;
            await secondChild.save();
            const newUpdatedParentChildren = [firstChild._id, secondChild._id];
            updatedParent.children = newUpdatedParentChildren;
            await updatedParent.save();
          }
          if (treeOfUser.children.length === 2 && updatedParent.children.length === 1) {
            console.log({ TH333333: u.userId });
            const firstChild = await Tree.findById(treeOfUser.children[0]);
            const secondChild = await Tree.findById(treeOfUser.children[1]);
            const userListString = `${firstChild.userName}, ${secondChild.userName}`;
            await sendMailChangeSystemForUser(userListString);
          }
          u.status = "DELETED";
          u.deletedTime = new Date();
          u.oldParents = [parent.userId, ...u.oldParents];
          await u.save();
          await Tree.deleteOne({ userId: u._id });
        } else {
          u.status = "DELETED";
          u.deletedTime = new Date();
          await u.save();
          await Tree.deleteOne({ userId: u._id });
        }
      }
    }
  }
});

export const countChildToData = asyncHandler(async () => {
  const listTrees = await Tree.find({}).select("tier countChild userId userName");

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
        const newIncome = new Income({
          userId: u._id,
          amount: u.totalHewe,
          coin: "HEWE",
          from: "Daily HEWE all",
          type: "",
        });

        await newIncome.save();
      } else if (u.totalHewe > u.claimedHewe) {
        u.availableHewe = u.availableHewe + u.hewePerDay;
        const newIncome = new Income({
          userId: u._id,
          amount: u.hewePerDay,
          coin: "HEWE",
          from: "Daily HEWE",
          type: "",
        });

        await newIncome.save();
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

export const blockUserNotKYC = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }, { status: "UNVERIFY" }],
  });

  const currentDay = moment();
  for (let u of listUser) {
    if (u.facetecTid === "") {
      const diffHours = currentDay.diff(u.createdAt, "hours", true);
      if (diffHours > 48) {
        u.lockKyc = true;
      }
    }
    await u.save();
  }
});

export const updateHewePrice = asyncHandler(async () => {
  console.log("Update hewe price start");
  let responseHewe = await getPriceHewe();
  if (responseHewe.data.result === "false") {
    if (process.env.NODE_ENV === "production") {
      await sendMailGetHewePrice();
    }
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

export const checkUserPreTier2 = asyncHandler(async () => {
  const listUser = await User.find({
    tier: 1,
    preTier2Status: "",
    errLahCode: "",
  });

  for (let u of listUser) {
    try {
      if (u.currentLayer.slice(-1) >= 3) {
        const treeOfUser = await Tree.findOne({
          userId: u._id,
          tier: 1,
          isSubId: false,
        });
        const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(treeOfUser);

        if (countChild1 + countChild2 >= 60 && countChild1 >= 19 && countChild2 >= 19) {
          console.log({ userACHIEVED: u.userId, countChild1, countChild2 });
          u.preTier2Status = "ACHIEVED";
          u.timeOkPreTier2 = new Date();
        } else {
          const countChildLevel4ToLevel10 = await getTotalLevel1ToLevel10OfUser(treeOfUser, true);
          if (
            countChildLevel4ToLevel10.countChild1 + countChildLevel4ToLevel10.countChild2 >= 48 &&
            countChildLevel4ToLevel10.countChild1 >= 14 &&
            countChildLevel4ToLevel10.countChild2 >= 14
          ) {
            console.log({
              userPENDING: u.userId,
              countChild1: countChildLevel4ToLevel10.countChild1,
              countChild2: countChildLevel4ToLevel10.countChild2,
            });
            u.preTier2Status = "PENDING";
          }
        }
        await u.save();
      }
    } catch (error) {
      console.log({ error });
    }
  }
});

export const checkRefAndTotalChildOfUser = asyncHandler(async () => {
  try {
    const listUsers = await User.find({
      isAdmin: false,
      status: { $ne: "DELETED" },
      errLahCode: { $ne: "OVER45" },
      adminChangeToDie: false,
    }).sort({
      createdAt: -1,
    });
    const currentDay = moment();

    // for (let user of listUsers) {
    const user = await User.findById("6840750ca4356e4be0d0aa76");
    console.log({ userName: user.userId });
    const treeOfUser = await Tree.findOne({
      userId: user._id,
      isSubId: false,
      tier: 1,
    });

    if (user.tier === 1) {
      const listRefTrees = await Tree.find({
        refId: treeOfUser._id,
        isSubId: false,
      });
      const diffDateFromCreated = currentDay.diff(user.createdAt, "days");

      const listRefUsers = [];
      for (let tree of listRefTrees) {
        const refUser = await User.findById(tree.userId);
        if (refUser && refUser.errLahCode !== "OVER45") {
          listRefUsers.push(tree);
        }
      }

      const hasTwoRef = await hasTwoBranches(treeOfUser._id);
      console.log({ hasTwoRef, diffDateFromCreated, listRefUsers: listRefUsers.length });
      if (!hasTwoRef) {
        if (diffDateFromCreated > 30) {
          user.errLahCode = "OVER45";
          user.dieTime = new Date();
        } else if (diffDateFromCreated > 20) {
          user.errLahCode = "OVER35";
          user.dieTime = addDays(new Date(), +10);
        }
      } else {
        // cần bổ sung
        if (listRefUsers.length < 2) {
          const missing = 2 - listRefUsers.length; // số người còn thiếu
          const extraDays = missing * 15;

          if (!user.dieTime) {
            // lần đầu bị thiếu → đặt hạn mới
            user.dieTime = moment().add(extraDays, "days").toDate();
          } else {
            const currentDeadline = moment(user.dieTime);

            if (moment().isAfter(currentDeadline)) {
              // đã quá hạn deadline
              user.errLahCode = "OVER45";
              user.dieTime = new Date();
            } else {
              // còn hạn thì không update thêm (tránh cộng dồn)
            }
          }
        } else {
          user.errLahCode = "";
          user.dieTime = null;
        }
      }
    } else if (user.tier === 2) {
      const INGNORE_USERID = ["Olivia", "Jay12", "Noah32", "James87", "Jake2000"];

      if (!INGNORE_USERID.includes(user.userId)) {
        const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(treeOfUser);

        const totalChild = countChild1 + countChild2;

        const diffDateFromTier2Date = currentDay.diff(user.tier2Time, "days");
        if (diffDateFromTier2Date <= 30) {
          if (totalChild < 60 || countChild1 < 19 || countChild2 < 19) {
            user.tryToTier2 = "YES";
            user.dieTime = moment(user.tier2Time).add(30, "days").toDate();
          } else if (totalChild >= 60 && countChild1 >= 19 && countChild2 >= 19) {
            user.dieTime = null;
            user.done62Id = true;
          }
        } else {
          if (user.done62Id) {
            if (totalChild < 60) {
              const missingIds = 60 - totalChild; // số id thiếu

              if (!user.dieTime) {
                // lần đầu tiên phát hiện thiếu → set deadline luôn
                const deadline = moment()
                  .add(missingIds * 15)
                  .toDate();
                user.dieTime = deadline;
                user.currentShortfall = missingIds;
              } else {
                // đã có deadline từ trước → so sánh với số thiếu hôm nay
                const oldShortfall = user.currentShortfall || 0;

                if (missingIds > oldShortfall) {
                  // thiếu nhiều hơn → cộng thêm số ngày tương ứng cho phần chênh lệch
                  const diff = missingIds - oldShortfall;
                  const extraDays = diff * 15;

                  user.dieTime = moment(user.dieTime).add(extraDays, "days").toDate();
                  user.currentShortfall = missingIds;
                }
                // nếu thiếu ít hơn hoặc bằng hôm qua thì không cộng thêm ngày
              }
            } else {
              user.dieTime = null;
              user.done62Id = true;
            }
          } else {
            if (totalChild >= 60 && countChild1 >= 19 && countChild2 >= 19) {
              user.dieTime = null;
              user.done62Id = true;
            } else {
              user.dieTime = null;
              const treeTier2OfUser = await Tree.findOne({
                userId: user._id,
                tier: 2,
              });

              treeTier2OfUser.disable = true;
              await treeTier2OfUser.save();
            }
          }
        }
      }
    }

    await user.save();
    // }
  } catch (err) {
    console.log({ err });
  }
});
