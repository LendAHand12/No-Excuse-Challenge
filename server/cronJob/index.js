import asyncHandler from "express-async-handler";
import moment from "moment";

import User from "../models/userModel.js";
import sendMail from "../utils/sendMail.js";
import { sendMailUpdateLayerForAdmin } from "../utils/sendMailCustom.js";
import { getCountAllChildren } from "../controllers/userControllers.js";
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

export const checkAPackage = asyncHandler(async () => {
  const currentDay = moment();
  const listUser = await User.find({
    $and: [{ status: "APPROVED" }, { buyPackage: "A" }, { tier: 1 }],
  });

  for (let u of listUser) {
    const diffDays = currentDay.diff(u.createdAt, "days");

    if (diffDays >= 1 && u.countPay < 13) {
      // u.status = "LOCKED";
      // u.lockedTime = new Date();
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
        // u.status = "LOCKED";
        // u.lockedTime = new Date();
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

    // if (diffDays >= 1 && u.countPay < 7) {
    //   u.status = "LOCKED";
    //   u.lockedTime = new Date();
    // }

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
        // u.status = "LOCKED";
        // u.lockedTime = new Date();
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
        // u.status = "LOCKED";
        // u.lockedTime = new Date();
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
  const listTrees = await Tree.find({}).select("tier countChild userId");

  for (let t of listTrees) {
    try {
      const countChild = await getCountAllChildren(t._id, t.tier);
      t.countChild = countChild;
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
      const listLockedChild = listRefChild.filter((ele) => ele.userId.status === "LOCKED");
      const countChildLocked = listRefChild.length - listLockedChild.length;
      if (countChildLocked < 2) {
        if (user.lockedTime === null) {
          user.lockedTime = new Date();
          await user.save();
        }
        if (countChildLocked === 1) {
          const closedChild = getUserClosestToNow(listLockedChild);
          const diffDays = currentDay.diff(closedChild.userId.lockedTime, "days");
          if (diffDays >= 30) {
            user.lockedTime = new Date();
            user.status = "LOCKED";
            await user.save();
          }
        }
        if (countChildLocked === 0) {
          const closedChild = getUserClosestToNow(listLockedChild);
          const diffDays = currentDay.diff(closedChild.userId.lockedTime, "days");
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

export const distributionHewe = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [{ isAdmin: false }, { userId: { $ne: "Admin2" } }, { countPay: 13 }],
  }).select("userId totalHewe availableHewe hewePerDay claimedHewe");

  for (let u of listUser) {
    try {
      if (u.totalHewe > u.claimedHewe) {
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
        const treeOfUser = await Tree.findOne({userId: u._id, tier: 1});
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
              console.log({userId: u.userId});
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

export const checkUserRegisteredOver6Month = asyncHandler(async () => {
  const listUser = await User.find({
    $and: [
      { isAdmin: false },
      { userId: { $ne: "Admin2" } },
      { countPay: 13 },
      { status: { $ne: "DELETED" } },
      { status: { $ne: "LOCKED" } },
    ],
  }).exec();

  for (let u of listUser) {
    try {
      const diffMonths = moment().diff(moment(u.createdAt), "months", true);
      if (diffMonths > 6) {
        u.status = "LOCKED";
        await u.save();
      }
    } catch (error) {
      console.log({ error });
    }
  }
});
