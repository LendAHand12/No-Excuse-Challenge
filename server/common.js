import Transaction from "./models/transactionModel.js";
import Tree from "./models/treeModel.js";
import User from "./models/userModel.js";
import UserOld from "./models/userOldModel.js";
import WildCard from "./models/wildCardModel.js";
import Claim from "./models/claimModel.js";
import { getParentWithCountPay } from "./utils/getParentWithCountPay.js";
import {
  findNextUser,
  findLevelById,
  findUsersAtLevel,
  findNextUserByIndex,
  calculateDieTimeForTier1,
  calculateDieTimeForTier2,
  countAliveIdsInBranch,
  hasTwoBranches,
} from "./utils/methods.js";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const transferUserToTree = async () => {
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    await Tree.create({
      userName: user.userId,
      userId: user._id,
      parentId: user.parentId,
      refId: user.refId,
      children: user.children,
      tier: user.tier,
    });
  }

  console.log("transfer done");
};

export const getParentWithCount = async (id) => {
  const user = await User.findById(id);

  const parentWithCount = await getParentWithCountPay(id, user.countPay, user.tier);

  console.log({ parentWithCount });
};

export const transferLayerToArray = async () => {
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    user.currentLayer = [0];
    user.oldLayer = [0];
    await user.save();
  }

  console.log("transfer layer to array done");
};

export const getUnknowChild = async () => {
  const listTrees = await Tree.find();

  const result = [];
  for (let tree of listTrees) {
    if (tree.children.length !== 0) {
      for (let childId of tree.children) {
        const u = await User.findById(childId);
        if (!u) {
          result.push({ treeId: tree._id, childIdß });
        }
      }
    }
  }
};

export const addBuyPackage = async () => {
  console.log("starting");
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    if (user.countPay === 0) {
      user.buyPackage = "";
    } else if (user.countPay >= 13) {
      user.buyPackage = "A";
    } else if (user.countPay < 13 && user.countPay >= 7) {
      user.buyPackage = "B";
    } else {
      user.buyPackage = "C";
    }
    await user.save();
  }

  console.log("addBuyPackage done");
};

export const changeDefaultContinue = async () => {
  console.log("starting");
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    if (user.buyPackage === "B") {
      if (user.countPay === 7) {
        user.continueWithBuyPackageB = true;
      }
      if (user.countPay === 13 && user.continueWithBuyPackageB === true) {
        user.buyPackage = "A";
      }
      if (user.countPay === 13 && user.continueWithBuyPackageB === false) {
        user.buyPackage = "C";
      }
    } else {
      user.continueWithBuyPackageB = true;
    }
    await user.save();
  }

  console.log("changeDefaultContinue done");
};

export const transferCountChildToArray = async () => {
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    user.countChild = [...user.countChild[0]];
    await user.save();
  }

  console.log("transfer layer to array done");
};

export const addBuyPackageToTree = async () => {
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    await Tree.updateMany({ userName: user.userId }, { $set: { buyPackage: user.buyPackage } });
  }

  console.log("addBuyPackageToTree done");
};

export const listTier = async (tier) => {
  const allTrees = await Tree.find({ tier }).sort({ createdAt: 1 });

  for (let tree of allTrees) {
    console.log({
      name: tree.userName,
      date: tree.createdAt,
      length: tree.children.length,
    });
  }
};

export const nextUserWithTier = async (tier) => {
  const nextId = await findNextUser(tier);
  console.log({ nextId });
};

export const changeTree12 = async (tier) => {
  const listPackageA = await User.find({ countPay: 13, tier: 1 });
  for (let u of listPackageA) {
    const tree = await Tree.findOne({ userId: u._id, tier: 1 });
    if (tree.buyPackage !== u.buyPackage) {
      console.log({ name: tree.userName });
      tree.buyPackage = u.buyPackage;
      await tree.save();
    }
  }
};

export const addLockTime = async () => {
  const listUser = await User.find({
    isAdmin: false,
    status: "LOCKED",
    lockedTime: null,
  });

  for (let user of listUser) {
    console.log({ user: user.userId });
    user.lockedTime = new Date("2023-12-07T07:04:46.909+00:00");
    await user.save();
  }

  console.log("addLockTime done");
};

export const syncStatusToTree = async () => {
  const listUser = await User.find({ isAdmin: false });

  for (let user of listUser) {
    const tree = await Tree.findOne({
      userName: user.userId,
      tier: 1,
    });
    if (tree) {
      tree.status = user.status;
      await tree.save();
    }
  }

  console.log("syncStatusToTree done");
};

export const addTierTime = async () => {
  const listUser = await User.find({ isAdmin: false, countPay: 13 });

  for (let user of listUser) {
    console.log({ user: user.userId });
    const trans1 = await Transaction.findOne({
      userId: user._id,
      userCountPay: 12,
      tier: 1,
      status: "SUCCESS",
    });
    if (trans1) {
      user.tier1Time = trans1.updatedAt;
    }
    const trans2 = await Transaction.findOne({
      userId: user._id,
      userCountPay: 12,
      tier: 2,
      status: "SUCCESS",
    });
    if (trans2) {
      user.tier2Time = trans2.updatedAt;
    }
    await user.save();
  }

  console.log("addTierTime done");
};

export const countIndexTree = async () => {
  const listTree = await Tree.find({ tier: 2, userName: { $ne: "Admin2" } });

  for (let treeOfUser of listTree) {
    if (treeOfUser.children.length > 0) {
      console.log({ name: treeOfUser.userName });
      let level, listUserOfLevel;
      level = await findLevelById(treeOfUser.userId, 2);
      listUserOfLevel = await findUsersAtLevel("6494e9101e2f152a593b66f2", level + 1, 2);
      listUserOfLevel.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      for (let childId of treeOfUser.children) {
        const childTree = await Tree.findOneAndUpdate(
          { userId: childId, tier: 2 },
          {
            $set: {
              indexOnLevel: listUserOfLevel.findIndex((ele) => ele.userId === childId) + 1,
            },
          }
        );
      }
    }
  }

  console.log("countIndexTree done");
};

export const changeWalletAddress = async () => {
  const listUser = await User.find();

  for (let user of listUser) {
    user.walletAddress1 = user.walletAddress[0];
    user.walletAddress2 = user.walletAddress[0];
    user.walletAddress3 = user.walletAddress[0];
    user.walletAddress4 = user.walletAddress[0];
    user.walletAddress5 = user.walletAddress[0];
    await user.save();
  }

  console.log("changeWalletAddress done");
};

export const convertOldData = async () => {
  const listUser = await User.find({
    isAdmin: false,
    status: { $ne: "DELETED" },
  });

  for (let user of listUser) {
    const treeOfUser = await Tree.findOne({ userId: user._id });
    if (treeOfUser && treeOfUser.parentId !== "" && treeOfUser.refId !== "") {
      const treeOfParent = await Tree.findOne({ userId: treeOfUser.parentId });
      if (!treeOfParent) {
        console.log({ parentNull: user.userId });
        return;
      }
      const treeOfRef = await Tree.findOne({ userId: treeOfUser.refId });
      if (!treeOfRef) {
        console.log({ refNull: user.userId });
        return;
      }

      let childs = treeOfParent.children;
      let newChilds = childs.filter((item) => {
        if (item.toString() !== user._id.toString()) return item;
      });
      treeOfParent.children = [...newChilds, treeOfUser._id];
      await treeOfParent.save();

      treeOfUser.parentId = treeOfParent._id;
      treeOfUser.refId = treeOfRef._id;
      await treeOfUser.save();
    } else {
      console.log({ userId: user.userId });
    }
  }

  console.log("convertOldData done");
};

export const getNextUserTier2 = async () => {
  const nextUserId = await findNextUser(2);
  const user = await User.findById(nextUserId);
  console.log({ name: user.userId });
};

export const checkUserErrLahCodeDuoi45Ngay = async () => {
  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 30);

  const listTreeUser = await Tree.find({
    $and: [{ isSubId: false }, { tier: 1 }, { createdAt: { $gte: fortyFiveDaysAgo } }],
  });

  for (let tree of listTreeUser) {
    const user = await User.findById(tree.userId);
    console.log({
      name: tree.userName,
      create: tree.createdAt,
      errLahCode: user.errLahCode,
    });
    if (user.errLahCode !== "") {
      user.errLahCode = "";
    }
    if (user.timeRetryOver45) {
      user.timeRetryOver45 = null;
    }
    await user.save();
  }
};

export const resetPass = async () => {
  const listUser = await UserOld.find();

  for (let u of listUser) {
    console.log({ u: u.userId });
    await User.findOneAndUpdate(
      { _id: u._id },
      { $set: { errLahCode: u.errLahCode, dieTime: u.dieTime } }
    );
  }
  console.log("doneeeeeeeeeeeeee");
};

export const resetErrLahCode = async () => {
  const listUser = await User.find();

  for (let u of listUser) {
    console.log({ u: u.userId });
    const oldUser = await UserOld.findById(u._id);
    if (oldUser) {
      u.errLahCode = oldUser.errLahCode;
      u.dieTime = oldUser.dieTime;
      u.timeRetryOver45 = oldUser.timeRetryOver45;
      u.timeToTry = oldUser.timeToTry;
      await u.save();
    }
  }
  console.log("doneeeeeeeeeeeeee");
};

export const fixParentChildLinks = async () => {
  const allTrees = await Tree.find({}).lean();
  let fixedCount = 0;

  for (const parent of allTrees) {
    if (!parent.children || parent.children.length === 0) continue;

    for (const childId of parent.children) {
      const child = allTrees.find((t) => t._id.toString() === childId);
      if (!child) continue;

      // Nếu parentId của con khác với id của cha → sửa lại
      if (child.parentId !== parent._id.toString()) {
        await Tree.updateOne({ _id: child._id }, { $set: { parentId: parent._id.toString() } });
        fixedCount++;
      }
    }
  }

  console.log(`✅ Đã đồng bộ xong ${fixedCount} parentId bị sai.`);
  return fixedCount;
};

/**
 * Migration: Tính lại dieTime cho tất cả tree data cũ dựa trên createdAt
 * Logic:
 * - Tier 1: 30 ngày từ createdAt để có ít nhất 2 tree con sống
 * - Tier 2: 45 ngày từ createdAt để có đủ 62 id sống (tổng >= 62, mỗi nhánh >= 20)
 *
 * Hàm này sẽ tính lại dieTime cho tất cả tree dựa trên:
 * 1. createdAt của tree
 * 2. Điều kiện hiện tại (số tree con sống, số id sống)
 * 3. Nếu đã quá hạn thì không thể hồi sinh
 */
export const recalculateTreeDieTimeForOldData = async () => {
  console.log("Start recalculating dieTime for old tree data...");

  try {
    // Bước 1: Tính dieTime cho tất cả tree tier 2 trước (không phụ thuộc tree con)
    // Sắp xếp từ mới đến cũ (createdAt DESC) để tính tree mới nhất trước
    const treesTier2 = await Tree.find({ tier: 2 }).sort({ createdAt: -1 });
    console.log(`Found ${treesTier2.length} trees tier 2`);

    let updatedTier2 = 0;
    let errorTier2 = 0;

    for (const tree of treesTier2) {
      try {
        // Tính dieTime dựa trên createdAt và điều kiện hiện tại
        const newDieTime = await calculateDieTimeForTier2(tree);

        // Cập nhật dieTime
        tree.dieTime = newDieTime;
        await tree.save();
        updatedTier2++;

        if (updatedTier2 % 100 === 0) {
          console.log(`Processed ${updatedTier2}/${treesTier2.length} trees tier 2...`);
        }
      } catch (err) {
        errorTier2++;
        console.error(
          `Error calculating dieTime for tree tier 2 ${tree._id} (${tree.userName}):`,
          err.message
        );
      }
    }

    console.log(`Updated ${updatedTier2} trees tier 2, ${errorTier2} errors`);

    // Bước 2: Tính dieTime cho tất cả tree tier 1 (sau khi đã tính tier 2)
    // Sắp xếp từ mới đến cũ (createdAt DESC) để tính tree mới nhất trước
    // Vì tree con phụ thuộc vào dieTime của tree cha, nên cần tính tree mới (con) trước, sau đó mới tính tree cũ (cha)
    const treesTier1 = await Tree.find({ tier: 1 }).sort({ createdAt: -1 });
    console.log(`Found ${treesTier1.length} trees tier 1`);

    // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
    const today = moment.tz("Asia/Ho_Chi_Minh").startOf("day");

    let updatedTier1 = 0;
    let errorTier1 = 0;
    let updatedErrLahCode = 0;

    for (const tree of treesTier1) {
      try {
        // Tính dieTime dựa trên createdAt và điều kiện hiện tại
        const newDieTime = await calculateDieTimeForTier1(tree);

        // Cập nhật dieTime
        tree.dieTime = newDieTime;
        await tree.save();
        updatedTier1++;

        // Cập nhật errLahCode cho User dựa trên dieTime của tree tier 1 (chỉ tree isSubId = false)
        if (!tree.isSubId) {
          try {
            const user = await User.findById(tree.userId);
            if (user) {
              // Chuyển đổi dieTime sang giờ Việt Nam để so sánh
              const treeDieTime = tree.dieTime
                ? moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day")
                : null;

              // Nếu dieTime đã quá hạn (today > dieTime) thì errLahCode = "OVER45"
              // Nếu dieTime = null hoặc chưa quá hạn thì errLahCode = ""
              const newErrLahCode = treeDieTime && today.isAfter(treeDieTime) ? "OVER45" : "";

              // Chỉ cập nhật nếu thay đổi
              if (user.errLahCode !== newErrLahCode) {
                user.errLahCode = newErrLahCode;
                await user.save();
                updatedErrLahCode++;
              }
            }
          } catch (userErr) {
            console.error(
              `Error updating errLahCode for user ${tree.userId} (tree ${tree._id}):`,
              userErr.message
            );
          }
        }

        if (updatedTier1 % 100 === 0) {
          console.log(
            `Processed ${updatedTier1}/${treesTier1.length} trees tier 1, updated ${updatedErrLahCode} users errLahCode...`
          );
        }
      } catch (err) {
        errorTier1++;
        console.error(
          `Error calculating dieTime for tree tier 1 ${tree._id} (${tree.userName}):`,
          err.message
        );
      }
    }

    console.log(
      `Updated ${updatedTier1} trees tier 1, ${errorTier1} errors, ${updatedErrLahCode} users errLahCode updated`
    );
    console.log("Recalculating dieTime for old tree data done!");
    console.log(
      `Summary: Tier 2 - ${updatedTier2} updated, ${errorTier2} errors | Tier 1 - ${updatedTier1} updated, ${errorTier1} errors`
    );

    return {
      tier2: { updated: updatedTier2, errors: errorTier2 },
      tier1: { updated: updatedTier1, errors: errorTier1 },
    };
  } catch (err) {
    console.error("Error in recalculateTreeDieTimeForOldData:", err);
    throw err;
  }
};

/**
 * Test hàm: Kiểm tra tính dieTime cho một tree cụ thể
 * @param {String} treeId - ID của tree cần test
 * @returns {Object} - Kết quả chi tiết với các bước tính toán và logs
 */
export const testCalculateDieTimeForTree = async (treeId) => {
  const logs = [];
  const log = (message) => {
    logs.push(message);
    console.log(message);
  };

  log("=".repeat(80));
  log(`🔍 TESTING DIE TIME CALCULATION FOR TREE ID: ${treeId}`);
  log("=".repeat(80));

  try {
    const tree = await Tree.findById(treeId);
    if (!tree) {
      log("❌ Tree not found!");
      return { error: "Tree not found", logs };
    }

    log("\n📋 TREE INFO:");
    log(`  - Tree ID: ${tree._id}`);
    log(`  - User Name: ${tree.userName}`);
    log(`  - User ID: ${tree.userId}`);
    log(`  - Tier: ${tree.tier}`);
    log(`  - Created At: ${tree.createdAt}`);
    log(`  - Current dieTime: ${tree.dieTime || "null"}`);
    log(`  - isSubId: ${tree.isSubId}`);
    log(`  - Children count: ${tree.children?.length || 0}`);

    // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
    const todayMoment = moment.tz("Asia/Ho_Chi_Minh").startOf("day");
    const todayStart = todayMoment.toDate();
    log(`\n📅 TODAY (Vietnam time, 00:00:00): ${todayStart.toISOString()}`);

    if (tree.tier === 1) {
      log("\n" + "=".repeat(80));
      log("🌳 TIER 1 CALCULATION");
      log("=".repeat(80));

      log(`\n⏰ STEP 1: Find children trees (refId = ${tree._id}, isSubId = false)`);
      log(`  - Created At: ${tree.createdAt}`);

      // Tìm tất cả tree con (refId = tree._id, isSubId = false)
      const children = await Tree.find({
        refId: tree._id.toString(),
        isSubId: false,
      })
        .lean()
        .sort({ createdAt: 1 });

      log(`  - Found ${children.length} children`);

      // Logic mới:
      // - Nếu có từ 2 refId trở lên (không quan tâm sống hay chết) → dieTime = null
      // - Nếu có 1 refId:
      //   - Nếu refId này chết → dieTime = ngày chết của refId + 30 ngày
      //   - Nếu refId này còn sống → dieTime = createdAt + 30 ngày
      // - Nếu có 0 refId → dieTime = createdAt + 30 ngày

      log(`\n📊 STEP 2: Analyze children and calculate dieTime`);

      let finalDieTime;
      let calculationReason = "";

      if (children.length >= 2) {
        // Nếu có từ 2 refId trở lên → dieTime = null (không quan tâm sống hay chết)
        log(`  - Children count: ${children.length} >= 2`);
        log(`  - Logic: Có từ 2 refId trở lên (không quan tâm sống hay chết) → dieTime = null`);
        finalDieTime = null;
        calculationReason = `Có từ 2 refId trở lên (${children.length} refId) → dieTime = null`;
      } else if (children.length === 1) {
        // Nếu có 1 refId
        const child = children[0];
        log(`  - Children count: 1`);
        log(`  - Child Tree ID: ${child._id}`);
        log(`  - Child User Name: ${child.userName}`);

        if (child.dieTime) {
          const childDieTimeMoment = moment.tz(child.dieTime, "Asia/Ho_Chi_Minh").startOf("day");
          const childDieTimeStart = childDieTimeMoment.toDate();
          log(`  - Child dieTime: ${childDieTimeStart}`);

          // Kiểm tra xem refId này có chết không (dieTime <= today)
          if (childDieTimeStart <= todayStart) {
            // Nếu refId này chết → dieTime = ngày chết của refId + 30 ngày
            const deadlineMoment = moment
              .tz(childDieTimeStart, "Asia/Ho_Chi_Minh")
              .add(30, "days")
              .startOf("day");
            finalDieTime = deadlineMoment.toDate();
            calculationReason = `Có 1 refId và refId này đã chết (dieTime: ${childDieTimeStart}) → dieTime = ngày chết của refId + 30 ngày`;
            log(`  - Child is DEAD (dieTime <= today)`);
            log(`  - Logic: Nếu refId này chết → dieTime = ngày chết của refId + 30 ngày`);
            log(`  - Calculated dieTime: ${finalDieTime}`);
          } else {
            // Nếu refId này còn sống → dieTime = createdAt + 30 ngày
            const deadlineMoment = moment
              .tz(tree.createdAt, "Asia/Ho_Chi_Minh")
              .add(30, "days")
              .startOf("day");
            finalDieTime = deadlineMoment.toDate();
            calculationReason = `Có 1 refId và refId này còn sống (dieTime: ${childDieTimeStart} > today) → dieTime = createdAt + 30 ngày`;
            log(`  - Child is ALIVE (dieTime > today)`);
            log(`  - Logic: Nếu refId này còn sống → dieTime = createdAt + 30 ngày`);
            log(`  - Calculated dieTime: ${finalDieTime}`);
          }
        } else {
          // Nếu refId này không có dieTime (còn sống) → dieTime = createdAt + 30 ngày
          const deadlineMoment = moment
            .tz(tree.createdAt, "Asia/Ho_Chi_Minh")
            .add(30, "days")
            .startOf("day");
          finalDieTime = deadlineMoment.toDate();
          calculationReason = `Có 1 refId và refId này không có dieTime (còn sống) → dieTime = createdAt + 30 ngày`;
          log(`  - Child has no dieTime (ALIVE)`);
          log(`  - Logic: Nếu refId này còn sống → dieTime = createdAt + 30 ngày`);
          log(`  - Calculated dieTime: ${finalDieTime}`);
        }
      } else {
        // Nếu có 0 refId → dieTime = createdAt + 30 ngày
        log(`  - Children count: 0`);
        log(`  - Logic: Nếu có 0 refId → dieTime = createdAt + 30 ngày`);
        const deadlineMoment = moment
          .tz(tree.createdAt, "Asia/Ho_Chi_Minh")
          .add(30, "days")
          .startOf("day");
        finalDieTime = deadlineMoment.toDate();
        calculationReason = `Có 0 refId → dieTime = createdAt + 30 ngày`;
        log(`  - Calculated dieTime: ${finalDieTime}`);
      }

      log(`\n🎯 STEP 3: Final result`);
      log(`  - Reason: ${calculationReason}`);
      log(`  - Final dieTime: ${finalDieTime ? finalDieTime.toISOString() : "null"}`);

      log("\n" + "=".repeat(80));
      log("✅ RESULT:");
      log("=".repeat(80));
      log(`  Current dieTime: ${tree.dieTime ? new Date(tree.dieTime).toISOString() : "null"}`);
      log(`  Calculated dieTime: ${finalDieTime ? finalDieTime.toISOString() : "null"}`);
      log(
        `  Match: ${
          (tree.dieTime ? new Date(tree.dieTime).getTime() : null) ===
          (finalDieTime ? finalDieTime.getTime() : null)
            ? "✅ YES"
            : "❌ NO"
        }`
      );

      return {
        logs,
        treeId: tree._id.toString(),
        tier: 1,
        createdAt: tree.createdAt,
        currentDieTime: tree.dieTime,
        calculatedDieTime: finalDieTime,
        childrenCount: children.length,
        calculationReason: calculationReason,
      };
    } else if (tree.tier === 2) {
      log("\n" + "=".repeat(80));
      log("🌳 TIER 2 CALCULATION");
      log("=".repeat(80));

      log(`\n⏰ STEP 1: Calculate deadline`);
      log(`  - Created At: ${tree.createdAt.toISOString()}`);

      log(`\n🔍 STEP 2: Find tree tier 1 of the same user`);
      const treeTier1 = await Tree.findOne({
        userId: tree.userId,
        tier: 1,
        isSubId: false,
      });

      if (!treeTier1) {
        log(`  ❌ Tree tier 1 not found for userId: ${tree.userId}`);
        log(`  - Will use deadline as dieTime`);
        // Tính theo giờ Việt Nam và set về 00:00:00
        const deadlineMoment = moment
          .tz(tree.createdAt, "Asia/Ho_Chi_Minh")
          .add(45, "days")
          .startOf("day");
        const deadlineStart = deadlineMoment.toDate();
        return {
          logs,
          treeId: tree._id.toString(),
          tier: 2,
          error: "Tree tier 1 not found",
          calculatedDieTime: deadlineStart,
        };
      }

      log(`  ✅ Found tree tier 1:`);
      log(`    - Tree ID: ${treeTier1._id}`);
      log(`    - User Name: ${treeTier1.userName}`);
      log(`    - Children count: ${treeTier1.children?.length || 0}`);

      log(`\n🔍 STEP 3: Count alive IDs in branches of tree tier 1`);
      const branch1RootId = treeTier1.children[0];
      const branch2RootId = treeTier1.children[1];

      log(`  - Branch 1 root: ${branch1RootId || "null"}`);
      log(`  - Branch 2 root: ${branch2RootId || "null"}`);

      let branch1Count = 0;
      let branch2Count = 0;

      if (branch1RootId) {
        log(`\n  📊 Counting Branch 1...`);
        branch1Count = await countAliveIdsInBranch(branch1RootId);
        log(`  - Branch 1 alive count: ${branch1Count}`);
      } else {
        log(`  - Branch 1: No root (count = 0)`);
      }

      if (branch2RootId) {
        log(`\n  📊 Counting Branch 2...`);
        branch2Count = await countAliveIdsInBranch(branch2RootId);
        log(`  - Branch 2 alive count: ${branch2Count}`);
      } else {
        log(`  - Branch 2: No root (count = 0)`);
      }

      const totalCount = branch1Count + branch2Count;

      log(`\n📊 STEP 4: Summary`);
      log(`  - Branch 1 count: ${branch1Count} (required: >= 20)`);
      log(`  - Branch 2 count: ${branch2Count} (required: >= 20)`);
      log(`  - Total count: ${totalCount} (required: >= 62)`);
      log(`  - Branch 1 status: ${branch1Count >= 20 ? "✅ ENOUGH" : "❌ NOT ENOUGH"}`);
      log(`  - Branch 2 status: ${branch2Count >= 20 ? "✅ ENOUGH" : "❌ NOT ENOUGH"}`);
      log(`  - Total status: ${totalCount >= 62 ? "✅ ENOUGH" : "❌ NOT ENOUGH"}`);
      const hasEnough = totalCount >= 62 && branch1Count >= 20 && branch2Count >= 20;
      log(`  - Overall: ${hasEnough ? "✅ ENOUGH" : "❌ NOT ENOUGH"}`);

      log(`\n🎯 STEP 5: Calculate final dieTime`);
      let finalDieTime;

      if (hasEnough) {
        log(`  - Enough IDs → dieTime = null`);
        finalDieTime = null;
        log(`  - Final dieTime: null (alive)`);
      } else {
        // Chưa đủ -> dieTime = today + 45 ngày (45 ngày kể từ ngày phát hiện thiếu)
        // Tất cả đều tính theo giờ Việt Nam và set về 00:00:00
        const newDeadlineMoment = moment.tz("Asia/Ho_Chi_Minh").add(45, "days").startOf("day");
        const newDeadlineStart = newDeadlineMoment.toDate();

        if (tree.dieTime) {
          const currentDieTimeMoment = moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day");
          const currentDieTimeStart = currentDieTimeMoment.toDate();

          if (todayStart > currentDieTimeStart) {
            log(`  - Current dieTime has passed → Cannot revive (no resurrection)`);
            finalDieTime = currentDieTimeStart;
            log(
              `  - Final dieTime: ${finalDieTime.toISOString()} (keep old deadline, Vietnam time, 00:00:00)`
            );
          } else {
            log(`  - Not enough IDs → dieTime = today + 45 days`);
            finalDieTime = newDeadlineStart;
            log(
              `  - Final dieTime: ${finalDieTime.toISOString()} (today + 45 days, Vietnam time, 00:00:00)`
            );
          }
        } else {
          log(`  - Not enough IDs → dieTime = today + 45 days`);
          finalDieTime = newDeadlineStart;
          log(
            `  - Final dieTime: ${finalDieTime.toISOString()} (today + 45 days, Vietnam time, 00:00:00)`
          );
        }
      }

      log("\n" + "=".repeat(80));
      log("✅ RESULT:");
      log("=".repeat(80));
      log(`  Current dieTime: ${tree.dieTime ? new Date(tree.dieTime).toISOString() : "null"}`);
      log(`  Calculated dieTime: ${finalDieTime ? finalDieTime.toISOString() : "null"}`);
      log(
        `  Match: ${
          (tree.dieTime ? new Date(tree.dieTime).getTime() : null) ===
          (finalDieTime ? finalDieTime.getTime() : null)
            ? "✅ YES"
            : "❌ NO"
        }`
      );

      return {
        logs,
        treeId: tree._id.toString(),
        tier: 2,
        createdAt: tree.createdAt,
        currentDieTime: tree.dieTime,
        calculatedDieTime: finalDieTime,
        branch1Count,
        branch2Count,
        totalCount,
        hasEnough: hasEnough,
        isDeadlinePassed: finalDieTime ? todayStart > finalDieTime : false,
      };
    } else {
      log(`\n❌ Tree tier ${tree.tier} is not supported (only tier 1 and 2)`);
      return { logs, error: `Tier ${tree.tier} not supported` };
    }
  } catch (err) {
    log(`\n❌ ERROR: ${err.message}`);
    return { logs, error: err.message };
  } finally {
    log("\n" + "=".repeat(80));
  }
};

/**
 * Kiểm tra xem có tree nào đang sống trong danh sách con cháu của XUYEN116 hay không
 * @returns {boolean} - true nếu có tree đang sống, false nếu không
 */
export const checkAliveTreesInXuyen116Branch = async () => {
  try {
    // Tìm tree của XUYEN116
    const xuyen116Tree = await Tree.findOne({ userName: "XUYEN116" });
    if (!xuyen116Tree) {
      console.log(`❌ Tree XUYEN116 not found`);
      return false;
    }

    console.log(
      `\n📌 ROOT TREE: ${xuyen116Tree.userName} (ID: ${xuyen116Tree._id}, Tier: ${xuyen116Tree.tier})`
    );

    // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
    const todayStart = moment.tz("Asia/Ho_Chi_Minh").startOf("day").toDate();

    // Danh sách tất cả descendants
    const allDescendants = [];
    const visited = new Set(); // Để tránh vòng lặp vô hạn

    // Hàm đệ quy để lấy tất cả children từ field children
    const getChildrenRecursive = async (parentId) => {
      if (visited.has(parentId.toString())) {
        return;
      }
      visited.add(parentId.toString());

      // Lấy tree node để lấy field children
      const tree = await Tree.findById(parentId).select("children");
      if (!tree || !tree.children || tree.children.length === 0) {
        return;
      }

      // Lấy tất cả children từ field children
      const children = await Tree.find({
        _id: { $in: tree.children },
      }).lean();

      for (const child of children) {
        allDescendants.push(child);
        // Đệ quy để lấy children của child này
        await getChildrenRecursive(child._id);
      }
    };

    await getChildrenRecursive(xuyen116Tree._id);

    // Kiểm tra xem có tree nào đang sống không
    let hasAliveTree = false;
    const aliveTrees = [];

    for (const tree of allDescendants) {
      const dieTime = tree.dieTime
        ? moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate()
        : null;
      const isAlive = !dieTime || dieTime > todayStart;

      if (isAlive) {
        hasAliveTree = true;
        aliveTrees.push({
          treeId: tree._id.toString(),
          userName: tree.userName,
          dieTime: tree.dieTime,
        });
      }
    }

    if (hasAliveTree) {
      console.log(`\n✅ Có ${aliveTrees.length} tree đang sống trong nhánh của XUYEN116:`);
      aliveTrees.forEach((tree) => {
        console.log(
          `  - ${tree.userName} (ID: ${tree.treeId}, dieTime: ${tree.dieTime || "null"})`
        );
      });

      // Cập nhật dieTime của các tree đang sống thành ngày hôm nay
      console.log(`\n🔄 Đang cập nhật dieTime cho ${aliveTrees.length} tree...`);
      let updatedCount = 0;

      for (const aliveTree of aliveTrees) {
        try {
          const treeToUpdate = await Tree.findById(aliveTree.treeId);
          if (treeToUpdate) {
            treeToUpdate.dieTime = todayStart;
            await treeToUpdate.save();
            updatedCount++;
            console.log(
              `  ✅ Đã cập nhật dieTime cho ${aliveTree.userName} (ID: ${
                aliveTree.treeId
              }) → ${todayStart.toISOString()}`
            );
          }
        } catch (err) {
          console.log(
            `  ❌ Lỗi khi cập nhật dieTime cho ${aliveTree.userName} (ID: ${aliveTree.treeId}): ${err.message}`
          );
        }
      }

      console.log(`\n✅ Đã cập nhật dieTime cho ${updatedCount}/${aliveTrees.length} tree`);
    } else {
      console.log(`\n❌ Không có tree nào đang sống trong nhánh của XUYEN116`);
      console.log(`  - Tổng số descendants: ${allDescendants.length}`);
    }

    return hasAliveTree;
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
    return false;
  }
};

/**
 * Lấy danh sách con cháu của treeId và tặng 7 ngày cho những tree có dieTime !== null
 * @param {string} treeId - ID của tree node gốc
 */
export const getDescendantsAndGive7DaysBonus = async (treeId) => {
  try {
    // Tìm tree node gốc
    const rootTree = await Tree.findById(treeId);
    if (!rootTree) {
      console.log(`❌ Tree not found with _id: ${treeId}`);
      return;
    }

    console.log(
      `\n📌 ROOT TREE: ${rootTree.userName} (ID: ${rootTree._id}, Tier: ${rootTree.tier})`
    );

    // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
    const todayStart = moment.tz("Asia/Ho_Chi_Minh").startOf("day").toDate();
    // Ngày bắt đầu: 5/11/2025 (theo giờ Việt Nam, 00:00:00)
    const startDate = moment.tz("2025-11-05", "Asia/Ho_Chi_Minh").startOf("day").toDate();

    console.log(`\n📅 Khoảng thời gian kiểm tra:`);
    console.log(`  - Từ: ${startDate.toISOString()} (5/11/2025)`);
    console.log(`  - Đến: ${todayStart.toISOString()} (hiện tại)`);

    // Danh sách tất cả descendants
    const allDescendants = [];
    const visited = new Set(); // Để tránh vòng lặp vô hạn

    // Hàm đệ quy để lấy tất cả children từ field children
    const getChildrenRecursive = async (parentId) => {
      if (visited.has(parentId.toString())) {
        return;
      }
      visited.add(parentId.toString());

      // Lấy tree node để lấy field children
      const tree = await Tree.findById(parentId).select("children");
      if (!tree || !tree.children || tree.children.length === 0) {
        return;
      }

      // Lấy tất cả children từ field children
      const children = await Tree.find({
        _id: { $in: tree.children },
      }).lean();

      for (const child of children) {
        allDescendants.push(child);
        // Đệ quy để lấy children của child này
        await getChildrenRecursive(child._id);
      }
    };

    await getChildrenRecursive(rootTree._id);

    console.log(`\n📊 Tổng số descendants: ${allDescendants.length}`);

    // Lọc các tree có dieTime từ 5/11/2025 đến hiện tại
    const treesEligibleForBonus = [];
    const treesNotEligible = [];

    for (const tree of allDescendants) {
      if (!tree.dieTime) {
        treesNotEligible.push(tree);
        continue;
      }

      const treeDieTime = moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate();

      // Kiểm tra xem dieTime có trong khoảng từ 5/11/2025 đến hiện tại không
      if (treeDieTime >= startDate && treeDieTime <= todayStart) {
        treesEligibleForBonus.push(tree);
      } else {
        treesNotEligible.push(tree);
      }
    }

    console.log(
      `\n🎯 Số tree có dieTime từ 5/11/2025 đến hiện tại: ${treesEligibleForBonus.length}`
    );
    console.log(`\n⏭️  Số tree không đủ điều kiện (giữ nguyên): ${treesNotEligible.length}`);

    if (treesEligibleForBonus.length === 0) {
      console.log(`\n✅ Không có tree nào đủ điều kiện để tặng 7 ngày bonus`);
      return;
    }

    // Tặng 7 ngày bonus cho các tree có dieTime từ 5/11/2025 đến hiện tại
    console.log(
      `\n🎁 Đang tặng 7 ngày bonus cho ${treesEligibleForBonus.length} tree đủ điều kiện...`
    );
    let successCount = 0;
    let failCount = 0;

    for (const tree of treesEligibleForBonus) {
      try {
        // Kiểm tra xem tree có userId không
        if (!tree.userId) {
          console.log(`  ⚠️  Tree ${tree.userName} (ID: ${tree._id}) không có userId, bỏ qua`);
          failCount++;
          continue;
        }

        // Kiểm tra xem user có tồn tại không
        const user = await User.findById(tree.userId);
        if (!user) {
          console.log(
            `  ⚠️  User không tồn tại cho tree ${tree.userName} (ID: ${tree._id}), bỏ qua`
          );
          failCount++;
          continue;
        }

        // Kiểm tra xem đã nhận 7 ngày bonus chưa (tránh tặng trùng)
        if (user.received7DaysBonus) {
          console.log(
            `  ⚠️  User ${user.userId} (Tree ${tree.userName}, ID: ${tree._id}) đã nhận 7 ngày bonus, bỏ qua`
          );
          continue;
        }

        // Lấy dieTime của tree và convert sang giờ Việt Nam
        const treeDieTime = tree.dieTime
          ? moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate()
          : null;

        if (!treeDieTime) {
          console.log(`  ⚠️  Tree ${tree.userName} (ID: ${tree._id}) không có dieTime, bỏ qua`);
          failCount++;
          continue;
        }

        // Tính dieTime mới
        let newDieTime;
        if (treeDieTime <= todayStart) {
          // Trường hợp 1: dieTime quá hạn (đã chết) → lấy ngày hôm nay + 7 ngày
          newDieTime = moment
            .tz(todayStart, "Asia/Ho_Chi_Minh")
            .add(7, "days")
            .startOf("day")
            .toDate();
          console.log(
            `  📅 Tree ${tree.userName} (ID: ${
              tree._id
            }) - dieTime quá hạn: ${treeDieTime.toISOString()} → mới: ${newDieTime.toISOString()}`
          );
        } else {
          // Trường hợp 2: dieTime chưa quá hạn (chưa chết) → lấy dieTime hiện tại + 7 ngày
          newDieTime = moment
            .tz(treeDieTime, "Asia/Ho_Chi_Minh")
            .add(7, "days")
            .startOf("day")
            .toDate();
          console.log(
            `  📅 Tree ${tree.userName} (ID: ${
              tree._id
            }) - dieTime chưa quá hạn: ${treeDieTime.toISOString()} → mới: ${newDieTime.toISOString()}`
          );
        }

        // Cập nhật dieTime cho tree
        const treeToUpdate = await Tree.findById(tree._id);
        if (!treeToUpdate) {
          console.log(
            `  ⚠️  Không tìm thấy tree để cập nhật ${tree.userName} (ID: ${tree._id}), bỏ qua`
          );
          failCount++;
          continue;
        }

        treeToUpdate.dieTime = newDieTime;
        await treeToUpdate.save();

        // Chỉ đánh dấu user đã nhận 7 ngày bonus sau khi cập nhật dieTime thành công
        user.received7DaysBonus = true;
        user.received7DaysAt = new Date();
        await user.save();

        successCount++;
        console.log(
          `  ✅ Đã tặng 7 ngày bonus cho ${tree.userName} (User ID: ${tree.userId}, Tree ID: ${tree._id})`
        );
      } catch (err) {
        failCount++;
        console.log(
          `  ❌ Lỗi khi tặng 7 ngày bonus cho ${tree.userName} (ID: ${tree._id}): ${err.message}`
        );
      }
    }

    console.log(`\n✅ Hoàn thành:`);
    console.log(`  - Thành công: ${successCount} user`);
    console.log(`  - Thất bại: ${failCount} user`);
    console.log(
      `  - Tổng số tree đủ điều kiện (dieTime từ 5/11/2025 đến hiện tại): ${treesEligibleForBonus.length}`
    );
    console.log(`  - Tổng số tree không đủ điều kiện (giữ nguyên): ${treesNotEligible.length}`);
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
  }
};

/**
 * Kiểm tra và cập nhật dieTime của các tree có isSubId = true theo dieTime của tree chính
 */
export const syncDieTimeForSubIds = async () => {
  try {
    console.log(`\n🔄 Bắt đầu đồng bộ dieTime cho các tree có isSubId = true...`);

    // Tìm tất cả tree có isSubId = true
    const subIdTrees = await Tree.find({ isSubId: true }).lean();

    console.log(`\n📊 Tổng số tree có isSubId = true: ${subIdTrees.length}`);

    if (subIdTrees.length === 0) {
      console.log(`\n✅ Không có tree nào có isSubId = true`);
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const subIdTree of subIdTrees) {
      try {
        // Kiểm tra xem subIdTree có userId và tier không
        if (!subIdTree.userId || !subIdTree.tier) {
          console.log(
            `  ⚠️  Tree ${subIdTree.userName} (ID: ${subIdTree._id}) không có userId hoặc tier, bỏ qua`
          );
          skipCount++;
          continue;
        }

        // Tìm tree chính (cùng userId, cùng tier, isSubId = false)
        const mainTree = await Tree.findOne({
          userId: subIdTree.userId,
          tier: subIdTree.tier,
          isSubId: false,
        });

        if (!mainTree) {
          console.log(
            `  ⚠️  Không tìm thấy tree chính cho subId ${subIdTree.userName} (ID: ${subIdTree._id}, userId: ${subIdTree.userId}, tier: ${subIdTree.tier}), bỏ qua`
          );
          skipCount++;
          continue;
        }

        // Kiểm tra xem dieTime có khác nhau không
        const subIdDieTime = subIdTree.dieTime
          ? moment.tz(subIdTree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate()
          : null;
        const mainTreeDieTime = mainTree.dieTime
          ? moment.tz(mainTree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate()
          : null;

        // So sánh dieTime (chuyển về timestamp để so sánh)
        const subIdDieTimeTs = subIdDieTime ? subIdDieTime.getTime() : null;
        const mainTreeDieTimeTs = mainTreeDieTime ? mainTreeDieTime.getTime() : null;

        if (subIdDieTimeTs === mainTreeDieTimeTs) {
          // DieTime đã giống nhau, không cần cập nhật
          console.log(
            `  ✓ Tree ${subIdTree.userName} (ID: ${subIdTree._id}) đã có dieTime giống tree chính, bỏ qua`
          );
          skipCount++;
          continue;
        }

        // Cập nhật dieTime của subId theo dieTime của tree chính
        const subIdTreeToUpdate = await Tree.findById(subIdTree._id);
        if (!subIdTreeToUpdate) {
          console.log(
            `  ⚠️  Không tìm thấy tree để cập nhật ${subIdTree.userName} (ID: ${subIdTree._id}), bỏ qua`
          );
          failCount++;
          continue;
        }

        subIdTreeToUpdate.dieTime = mainTreeDieTime;
        await subIdTreeToUpdate.save();

        successCount++;
        console.log(
          `  ✅ Đã cập nhật dieTime cho subId ${subIdTree.userName} (ID: ${subIdTree._id}) từ ${
            subIdDieTime ? subIdDieTime.toISOString() : "null"
          } → ${mainTreeDieTime ? mainTreeDieTime.toISOString() : "null"}`
        );
      } catch (err) {
        failCount++;
        console.log(
          `  ❌ Lỗi khi cập nhật dieTime cho subId ${subIdTree.userName} (ID: ${subIdTree._id}): ${err.message}`
        );
      }
    }

    console.log(`\n✅ Hoàn thành đồng bộ dieTime:`);
    console.log(`  - Thành công: ${successCount} tree`);
    console.log(`  - Thất bại: ${failCount} tree`);
    console.log(`  - Bỏ qua: ${skipCount} tree`);
    console.log(`  - Tổng số tree có isSubId = true: ${subIdTrees.length}`);
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
  }
};

/**
 * Tính lại dieTime cho tất cả tree tier 2
 * Sử dụng hàm calculateDieTimeForTier2 để tính dieTime dựa trên điều kiện hiện tại
 * @returns {Object} - Kết quả với số lượng tree đã cập nhật và lỗi
 */
export const calculateDieTimeForAllTier2 = async () => {
  try {
    console.log(`\n🔄 Bắt đầu tính dieTime cho tất cả tree tier 2...`);

    // Tìm tất cả tree tier 2
    const treesTier2 = await Tree.find({ tier: 2 }).sort({ createdAt: -1 });
    console.log(`\n📊 Tổng số tree tier 2: ${treesTier2.length}`);

    if (treesTier2.length === 0) {
      console.log(`\n✅ Không có tree tier 2 nào`);
      return {
        total: 0,
        updated: 0,
        errors: 0,
      };
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const tree of treesTier2) {
      try {
        // Tính dieTime mới
        const newDieTime = await calculateDieTimeForTier2(tree);

        // Kiểm tra xem dieTime có thay đổi không
        const currentDieTime = tree.dieTime
          ? moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate()
          : null;
        const newDieTimeFormatted = newDieTime
          ? moment.tz(newDieTime, "Asia/Ho_Chi_Minh").startOf("day").toDate()
          : null;

        const currentDieTimeTs = currentDieTime ? currentDieTime.getTime() : null;
        const newDieTimeTs = newDieTimeFormatted ? newDieTimeFormatted.getTime() : null;

        // Chỉ cập nhật nếu dieTime thay đổi
        if (currentDieTimeTs !== newDieTimeTs) {
          tree.dieTime = newDieTime;
          await tree.save();
          updatedCount++;
        }

        // Log tiến độ mỗi 100 tree
        if ((updatedCount + errorCount) % 100 === 0) {
          console.log(
            `  📈 Đã xử lý ${updatedCount + errorCount}/${treesTier2.length} tree tier 2...`
          );
        }
      } catch (err) {
        errorCount++;
        console.error(
          `  ❌ Lỗi khi tính dieTime cho tree tier 2 ${tree._id} (${tree.userName}): ${err.message}`
        );
      }
    }

    console.log(`\n✅ Hoàn thành tính dieTime cho tree tier 2:`);
    console.log(`  - Tổng số: ${treesTier2.length} tree`);
    console.log(`  - Đã cập nhật: ${updatedCount} tree`);
    console.log(`  - Lỗi: ${errorCount} tree`);

    return {
      total: treesTier2.length,
      updated: updatedCount,
      errors: errorCount,
    };
  } catch (err) {
    console.error(`\n❌ ERROR trong calculateDieTimeForAllTier2: ${err.message}`);
    throw err;
  }
};

/**
 * Lấy danh sách user có trên 2 refId và errLahCode = "OVER45", xuất ra file .txt
 */
export const exportOver45UsersToTxt = async () => {
  try {
    console.log(
      `\n📋 Bắt đầu xuất danh sách user có từ 2 refId trở lên và errLahCode = "OVER45"...`
    );

    // Lấy tất cả user có errLahCode = "OVER45"
    const allOver45Users = await User.find({
      errLahCode: "OVER45",
    })
      .select("userId createdAt")
      .lean();

    console.log(`\n📊 Tổng số user có errLahCode = "OVER45": ${allOver45Users.length}`);

    // Lọc user có từ 2 refId trở lên (>= 2 refId)
    console.log(`\n🔄 Đang kiểm tra số lượng refId cho từng user...`);
    const usersWithMoreThan2RefIds = [];

    for (const user of allOver45Users) {
      // Tìm tree chính của user (userId = user._id, isSubId = false)
      const mainTree = await Tree.findOne({
        userId: user._id,
        isSubId: false,
      });

      if (!mainTree) {
        // Không có tree chính, bỏ qua
        continue;
      }

      // Đếm số refId (tree có refId = mainTree._id, isSubId = false)
      const refIdCount = await Tree.countDocuments({
        refId: mainTree._id.toString(),
        isSubId: false,
      });

      if (refIdCount >= 2) {
        usersWithMoreThan2RefIds.push({
          ...user,
          refIdCount,
        });
      }
    }

    console.log(
      `\n📊 Số user có trên 2 refId và errLahCode = "OVER45": ${usersWithMoreThan2RefIds.length}`
    );

    // Sắp xếp theo createdAt tăng dần
    const sortedUsers = usersWithMoreThan2RefIds.sort((a, b) => {
      const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdAtA - createdAtB;
    });

    // Tạo nội dung file
    let fileContent = `DANH SÁCH USER CÓ TỪ 2 REFID TRỞ LÊN VÀ errLahCode = "OVER45"\n`;
    fileContent += `Thời gian xuất: ${moment().format("YYYY-MM-DD HH:mm:ss")}\n`;
    fileContent += `${"=".repeat(80)}\n`;
    fileContent += `Tổng số: ${sortedUsers.length} user\n`;
    fileContent += `${"=".repeat(80)}\n\n`;

    if (sortedUsers.length === 0) {
      fileContent += "Không có user nào.\n";
    } else {
      fileContent += `STT\t\tUser ID\t\t\tNgày tạo (createdAt)\n`;
      fileContent += `${"-".repeat(80)}\n`;

      sortedUsers.forEach((user, index) => {
        const createdAtStr = user.createdAt
          ? moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")
          : "N/A";
        fileContent += `${index + 1}\t\t${user.userId}\t\t${createdAtStr}\n`;
      });
    }

    // Tạo thư mục exports nếu chưa có
    const exportsDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Tạo tên file với timestamp
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const filename = `over45_users_${timestamp}.txt`;
    const filepath = path.join(exportsDir, filename);

    // Ghi file
    fs.writeFileSync(filepath, fileContent, "utf8");

    console.log(`\n✅ Đã xuất file thành công:`);
    console.log(`  - File path: ${filepath}`);
    console.log(`  - Tổng số user: ${sortedUsers.length}`);

    // Hiển thị thông tin trong console
    console.log(`\n📋 DANH SÁCH USER CÓ TỪ 2 REFID TRỞ LÊN VÀ errLahCode = "OVER45":`);
    if (sortedUsers.length === 0) {
      console.log(`  Không có user nào.`);
    } else {
      sortedUsers.forEach((user, index) => {
        const createdAtStr = user.createdAt
          ? moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")
          : "N/A";
        console.log(
          `  ${index + 1}. ${user.userId} - Created: ${createdAtStr} - RefId Count: ${
            user.refIdCount
          }`
        );
      });
    }

    return {
      filepath,
      totalCount: sortedUsers.length,
      users: sortedUsers,
    };
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
    throw err;
  }
};

/**
 * Quét tất cả user đã lên tier 2
 * Tặng 2 wild card cho mỗi user (chương trình khuyến mãi lên tier 2)
 * Chỉ tặng 1 lần duy nhất, không tặng lại nếu đã nhận
 */
export const giveTier2PromotionWildCards = async () => {
  try {
    console.log("\n🎁 Bắt đầu phát wild card khuyến mãi lên tier 2...");

    // Tìm tất cả user có tier = 2, không phải admin, status không phải DELETED
    // và chưa nhận wild card khuyến mãi (receivedTier2PromotionWildCard = false)
    const tier2Users = await User.find({
      tier: 2,
      isAdmin: false,
      status: { $ne: "DELETED" },
      receivedTier2PromotionWildCard: false, // Chỉ lấy user chưa nhận
    }).select("userId _id");

    console.log(`📊 Tìm thấy ${tier2Users.length} user tier 2 chưa nhận wild card khuyến mãi`);

    let createdCards = 0;
    let eligibleUsers = 0;
    let skippedUsers = 0;
    const errors = [];

    // Duyệt qua từng user
    for (const user of tier2Users) {
      try {
        // User đạt tier 2, tạo 2 wild card
        await WildCard.create({
          userId: user._id,
          cardType: "PROMO_TIER_2",
          status: "ACTIVE",
          sourceInfo: "Khuyến mãi lên tier 2 - Wild card 1",
          days: 15,
          targetTier: 2,
          usedBy: null,
        });

        await WildCard.create({
          userId: user._id,
          cardType: "PROMO_TIER_2",
          status: "ACTIVE",
          sourceInfo: "Khuyến mãi lên tier 2 - Wild card 2",
          days: 15,
          targetTier: 2,
          usedBy: null,
        });

        // Đánh dấu user đã nhận wild card khuyến mãi để không tặng lại lần 2
        await User.findByIdAndUpdate(user._id, {
          receivedTier2PromotionWildCard: true,
        });

        createdCards += 2; // Tạo 2 thẻ
        eligibleUsers++;
        console.log(`  ✅ Đã tạo 2 wild card cho user: ${user.userId}`);
      } catch (err) {
        skippedUsers++;
        errors.push({
          userId: user.userId,
          error: err.message,
        });
        console.error(`  ❌ Lỗi khi tạo wild card cho user ${user.userId}:`, err.message);
      }
    }

    console.log(`\n📈 KẾT QUẢ:`);
    console.log(`  - Tổng số user tier 2 chưa nhận: ${tier2Users.length}`);
    console.log(`  - User đã nhận wild card: ${eligibleUsers}`);
    console.log(`  - Tổng số wild card đã tạo: ${createdCards}`);
    console.log(`  - User bỏ qua/Lỗi: ${skippedUsers}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Các lỗi xảy ra:`);
      errors.forEach((err) => {
        console.log(`  - ${err.userId}: ${err.error}`);
      });
    }

    return {
      totalUsers: tier2Users.length,
      eligibleUsers,
      createdCards,
      skippedUsers,
      errors,
    };
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
    throw err;
  }
};

/**
 * Tìm branch root của một node trong cây
 * @param {String} nodeId - ID của node
 * @param {String} rootId - ID của root node
 * @param {Object} parentMap - Map của parentId
 * @returns {String|null} - Branch root ID hoặc null
 */
const getBranchRoot = (nodeId, rootId, parentMap) => {
  // Kiểm tra xem nodeId có phải là direct child của rootId không
  if (parentMap[nodeId] && String(parentMap[nodeId]) === String(rootId)) {
    return String(nodeId); // nodeId chính là root của nhánh
  }

  // Nếu không phải direct child, đi ngược lên tìm direct child đầu tiên
  let currentId = nodeId;
  const visited = new Set(); // Track visited nodes to prevent infinite loops

  while (currentId && parentMap[currentId]) {
    // Check for circular reference (infinite loop)
    if (visited.has(currentId)) {
      return null; // Return null to prevent infinite loop
    }

    visited.add(currentId);
    const parentId = parentMap[currentId];

    // Nếu parent là rootId, thì currentId là direct child → trả về currentId
    if (String(parentId) === String(rootId)) {
      return String(currentId);
    }

    currentId = parentId;
  }

  return null;
};

/**
 * Kiểm tra có ít nhất 2 refId còn sống ở 2 nhánh khác nhau
 * @param {String} treeId - ID của tree tier 1
 * @returns {Boolean} - true nếu có ít nhất 2 refId còn sống ở 2 nhánh khác nhau
 */
const hasTwoAliveRefIdInDifferentBranches = async (treeId) => {
  const refTree = await Tree.findById(treeId).lean();
  if (!refTree) {
    return false;
  }

  // Node phải có đúng 2 con (children)
  if (!refTree.children || refTree.children.length < 2) {
    return false;
  }

  // Lấy tất cả F1 (những người do refId giới thiệu)
  const f1s = await Tree.find({ refId: treeId }).lean();
  if (f1s.length < 2) {
    return false; // chưa đủ 2 F1
  }

  // Lấy ngày hiện tại theo giờ Việt Nam
  const today = moment.tz("Asia/Ho_Chi_Minh").startOf("day");

  // Lọc chỉ lấy F1 còn sống (dieTime === null hoặc dieTime > today)
  const aliveF1s = f1s.filter((f1) => {
    if (!f1.dieTime) return true; // dieTime = null → còn sống
    const dieTimeStart = moment.tz(f1.dieTime, "Asia/Ho_Chi_Minh").startOf("day");
    return dieTimeStart.isAfter(today); // dieTime > today → còn sống
  });

  if (aliveF1s.length < 2) {
    return false; // chưa đủ 2 F1 còn sống
  }

  // Lấy parentId cho toàn bộ cây con
  const allNodes = await Tree.find({}).select("_id parentId").lean();
  const parentMap = {};
  for (let n of allNodes) {
    parentMap[n._id.toString()] = n.parentId ? n.parentId.toString() : null;
  }

  // Tìm branch root của mỗi F1 còn sống
  const branches = new Set();
  for (let f1 of aliveF1s) {
    const branchRoot = getBranchRoot(f1._id.toString(), treeId.toString(), parentMap);
    if (branchRoot) branches.add(branchRoot);
    if (branches.size >= 2) return true; // có đủ 2 nhánh thì dừng luôn
  }

  return false;
};

/**
 * Cronjob chạy mỗi ngày để tính lại dieTime của user
 * - Xử lý 2 trường hợp: adminChangeToDie = true và adminChangeToDie != true
 */
export const recalculateDieTimeDaily = async () => {
  try {
    console.log("\n🔄 Bắt đầu tính lại dieTime cho tất cả user...");

    // Lấy tất cả user (bao gồm cả adminChangeToDie = true và != true)
    // Sắp xếp từ mới nhất đến cũ nhất
    const users = await User.find({
      isAdmin: false,
      status: { $ne: "DELETED" },
    })
      .select("_id userId tier adminChangeToDie")
      .sort({ createdAt: -1 }); // -1 = giảm dần (mới nhất trước)

    console.log(`📊 Tìm thấy ${users.length} user cần tính lại dieTime`);

    let processedCount = 0;
    let tier1Updated = 0;
    let tier2Updated = 0;
    let tier1Skipped = 0;
    let tier2Skipped = 0;
    const errors = [];

    // Lấy ngày hiện tại theo giờ Việt Nam
    const todayStart = moment.tz("Asia/Ho_Chi_Minh").startOf("day");

    for (const user of users) {
      try {
        // // Xử lý Tier 1
        const treeTier1 = await Tree.findOne({
          userId: user._id,
          tier: 1,
          isSubId: false,
        });

        if (treeTier1) {
          if (user.adminChangeToDie === true && treeTier1.dieTime !== null) {
            // Trường hợp admin đã thay đổi ngày chết
            if (treeTier1.dieTime) {
              const dieTimeStart = moment
                .tz(treeTier1.dieTime, "Asia/Ho_Chi_Minh")
                .startOf("day")
                .add(1, "day");

              // Kiểm tra dieTime có quá hạn không
              if (todayStart.isBefore(dieTimeStart)) {
                // Chưa quá hạn → kiểm tra có đủ 2 refId còn sống ở 2 nhánh
                const hasTwoAliveRefId = await hasTwoAliveRefIdInDifferentBranches(
                  treeTier1._id.toString()
                );

                if (hasTwoAliveRefId) {
                  // Đủ điều kiện → dieTime = null
                  treeTier1.dieTime = null;
                  await treeTier1.save();
                  tier1Updated++;
                  console.log(
                    `  ✅ User ${user.userId} (Tier 1, admin changed): Đủ 2 refId còn sống → dieTime = null`
                  );
                } else {
                  // Không đủ → giữ nguyên dieTime
                  tier1Skipped++;
                }
              } else {
                // Đã quá hạn → giữ nguyên dieTime
                tier1Skipped++;
              }
            } else {
              // dieTime = null → không cần xử lý
              tier1Skipped++;
            }
          } else {
            // Trường hợp admin không thay đổi ngày chết
            // Kiểm tra có ít nhất 2 refId còn sống ở 2 nhánh khác nhau
            const hasTwoAliveRefId = await hasTwoAliveRefIdInDifferentBranches(
              treeTier1._id.toString()
            );

            if (treeTier1.dieTime !== null) {
              // Nếu dieTime != null
              if (hasTwoAliveRefId) {
                // Đủ điều kiện → dieTime = null
                treeTier1.dieTime = null;
                await treeTier1.save();
                tier1Updated++;
                console.log(
                  `  ✅ User ${user.userId} (Tier 1): Đủ 2 refId còn sống → dieTime = null`
                );
              } else {
                // Không đủ → giữ nguyên dieTime
                tier1Skipped++;
              }
            } else {
              // Nếu dieTime = null
              if (!hasTwoAliveRefId) {
                // Không đủ → dieTime = ngày hiện tại + 45 ngày
                const newDieTime = todayStart.clone().add(45, "days").toDate();
                treeTier1.dieTime = newDieTime;
                await treeTier1.save();
                tier1Updated++;
                console.log(
                  `  ✅ User ${
                    user.userId
                  } (Tier 1): Không đủ 2 refId còn sống → dieTime = ${moment(newDieTime).format(
                    "DD/MM/YYYY"
                  )}`
                );
              } else {
                // Đủ → giữ nguyên dieTime = null
                tier1Skipped++;
              }
            }
          }
        }

        // Xử lý Tier 2 (chỉ nếu user có tier >= 2)
        if (user.tier >= 2) {
          const treeTier2 = await Tree.findOne({
            userId: user._id,
            tier: 2,
            isSubId: false,
          });

          if (treeTier2) {
            // Tìm tree tier 1 của cùng user
            const treeTier1ForTier2 = await Tree.findOne({
              userId: user._id,
              tier: 1,
              isSubId: false,
            });

            if (treeTier1ForTier2 && treeTier1ForTier2.children.length >= 2) {
              // Đếm id sống trong 2 nhánh của tree tier 1
              const branch1Count = await countAliveIdsInBranch(treeTier1ForTier2.children[0]);
              const branch2Count = await countAliveIdsInBranch(treeTier1ForTier2.children[1]);
              const totalCount = branch1Count + branch2Count;

              // Kiểm tra điều kiện: tổng >= 60 và mỗi nhánh >= 19
              const hasEnough = totalCount >= 60 && branch1Count >= 19 && branch2Count >= 19;

              if (user.adminChangeToDie === true) {
                // Trường hợp admin đã thay đổi ngày chết
                if (treeTier2.dieTime) {
                  const dieTimeStart = moment
                    .tz(treeTier2.dieTime, "Asia/Ho_Chi_Minh")
                    .startOf("day");

                  // Kiểm tra dieTime có quá hạn không
                  if (todayStart.isBefore(dieTimeStart)) {
                    // Chưa quá hạn → kiểm tra điều kiện
                    if (hasEnough) {
                      // Đủ điều kiện → dieTime = null
                      treeTier2.dieTime = null;
                      await treeTier2.save();
                      tier2Updated++;
                      console.log(
                        `  ✅ User ${user.userId} (Tier 2, admin changed): Đủ 60 id sống → dieTime = null`
                      );
                    } else {
                      // Không đủ → giữ nguyên dieTime
                      tier2Skipped++;
                    }
                  } else {
                    // Đã quá hạn → giữ nguyên dieTime
                    tier2Skipped++;
                  }
                } else {
                  // dieTime = null → không cần xử lý
                  tier2Skipped++;
                }
              } else {
                // Trường hợp admin không thay đổi ngày chết
                if (treeTier2.dieTime !== null) {
                  // Nếu dieTime != null
                  if (hasEnough) {
                    // Đủ điều kiện → dieTime = null
                    treeTier2.dieTime = null;
                    await treeTier2.save();
                    tier2Updated++;
                    console.log(
                      `  ✅ User ${user.userId} (Tier 2): Đủ 60 id sống → dieTime = null`
                    );
                  } else {
                    // Không đủ → giữ nguyên dieTime
                    tier2Skipped++;
                  }
                } else {
                  // Nếu dieTime = null
                  if (!hasEnough) {
                    // Không đủ → dieTime = ngày hiện tại + 45 ngày
                    const newDieTime = todayStart.clone().add(45, "days").toDate();
                    treeTier2.dieTime = newDieTime;
                    await treeTier2.save();
                    tier2Updated++;
                    console.log(
                      `  ✅ User ${user.userId} (Tier 2): Không đủ 60 id sống → dieTime = ${moment(
                        newDieTime
                      ).format("DD/MM/YYYY")}`
                    );
                  } else {
                    // Đủ → giữ nguyên dieTime = null
                    tier2Skipped++;
                  }
                }
              }
            } else {
              // Không tìm thấy tree tier 1 hoặc chưa có đủ 2 children
              if (user.adminChangeToDie !== true && treeTier2.dieTime === null) {
                // Chỉ xử lý nếu không phải admin changed và dieTime = null
                const newDieTime = todayStart.clone().add(45, "days").toDate();
                treeTier2.dieTime = newDieTime;
                await treeTier2.save();
                tier2Updated++;
                console.log(
                  `  ✅ User ${
                    user.userId
                  } (Tier 2): Chưa có tree tier 1 đủ điều kiện → dieTime = ${moment(
                    newDieTime
                  ).format("DD/MM/YYYY")}`
                );
              } else {
                tier2Skipped++;
              }
            }
          }
        }

        processedCount++;

        // Log tiến độ mỗi 100 user
        if (processedCount % 100 === 0) {
          console.log(`  📈 Đã xử lý ${processedCount}/${users.length} user...`);
        }
      } catch (err) {
        errors.push({
          userId: user.userId,
          error: err.message,
        });
        console.error(`  ❌ Lỗi khi xử lý user ${user.userId}:`, err.message);
      }
    }

    console.log(`\n📈 KẾT QUẢ:`);
    console.log(`  - Tổng số user: ${users.length}`);
    console.log(`  - Đã xử lý: ${processedCount}`);
    console.log(`  - Tier 1 đã cập nhật: ${tier1Updated}`);
    console.log(`  - Tier 1 giữ nguyên: ${tier1Skipped}`);
    console.log(`  - Tier 2 đã cập nhật: ${tier2Updated}`);
    console.log(`  - Tier 2 giữ nguyên: ${tier2Skipped}`);
    console.log(`  - Lỗi: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Các lỗi xảy ra:`);
      errors.forEach((err) => {
        console.log(`  - ${err.userId}: ${err.error}`);
      });
    }

    return {
      totalUsers: users.length,
      processedCount,
      tier1Updated,
      tier1Skipped,
      tier2Updated,
      tier2Skipped,
      errors,
    };
  } catch (err) {
    console.log(`\n❌ ERROR trong recalculateDieTimeDaily: ${err.message}`);
    throw err;
  }
};

/**
 * Lấy danh sách user có adminChangeToDie = true nhưng dieTime tier 1 = null
 * và không có đủ tối thiểu 2 refId trải đều 2 bên nhánh
 * Xuất ra file .txt
 */
export const exportUsersWithAdminChangeButNoDieTime = async () => {
  try {
    console.log(
      `\n📋 Bắt đầu xuất danh sách user có adminChangeToDie = true nhưng dieTime tier 1 = null và không đủ 2 refId...`
    );

    // Lấy tất cả user có adminChangeToDie = true
    const usersWithAdminChange = await User.find({
      adminChangeToDie: true,
      isAdmin: false,
      status: { $ne: "DELETED" },
    })
      .select("userId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`\n📊 Tổng số user có adminChangeToDie = true: ${usersWithAdminChange.length}`);

    const eligibleUsers = [];

    // Lấy ngày hiện tại theo giờ Việt Nam
    const today = moment.tz("Asia/Ho_Chi_Minh").startOf("day");

    for (const user of usersWithAdminChange) {
      try {
        // Tìm tree tier 1 của user
        const treeTier1 = await Tree.findOne({
          userId: user._id,
          tier: 1,
          isSubId: false,
        });

        if (!treeTier1) {
          // Không có tree tier 1, bỏ qua
          continue;
        }

        // Kiểm tra dieTime tier 1 = null
        if (treeTier1.dieTime !== null) {
          // dieTime không phải null, bỏ qua
          continue;
        }

        // Kiểm tra có đủ 2 refId còn sống ở 2 nhánh khác nhau không
        const hasTwoAliveRefId = await hasTwoAliveRefIdInDifferentBranches(
          treeTier1._id.toString()
        );

        if (!hasTwoAliveRefId) {
          // Không đủ 2 refId còn sống ở 2 nhánh → thêm vào danh sách
          eligibleUsers.push({
            userId: user.userId,
            createdAt: user.createdAt,
          });
        }
      } catch (err) {
        console.error(`  ❌ Lỗi khi xử lý user ${user.userId}:`, err.message);
      }
    }

    console.log(`\n📊 Số user đủ điều kiện: ${eligibleUsers.length}`);

    // Tạo nội dung file
    let fileContent = `DANH SÁCH USER CÓ adminChangeToDie = true NHƯNG dieTime TIER 1 = null VÀ KHÔNG ĐỦ 2 REFID CÒN SỐNG Ở 2 NHÁNH\n`;
    fileContent += `Thời gian xuất: ${moment().format("YYYY-MM-DD HH:mm:ss")}\n`;
    fileContent += `${"=".repeat(80)}\n`;
    fileContent += `Tổng số: ${eligibleUsers.length} user\n`;
    fileContent += `${"=".repeat(80)}\n\n`;

    if (eligibleUsers.length === 0) {
      fileContent += "Không có user nào.\n";
    } else {
      fileContent += `STT\t\tUser ID\t\t\tNgày tạo (createdAt)\n`;
      fileContent += `${"-".repeat(80)}\n`;

      eligibleUsers.forEach((user, index) => {
        const createdAtStr = user.createdAt
          ? moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")
          : "N/A";
        fileContent += `${index + 1}\t\t${user.userId}\t\t${createdAtStr}\n`;
      });
    }

    // Tạo thư mục exports nếu chưa có
    const exportsDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Tạo tên file với timestamp
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const filename = `admin_change_no_die_time_${timestamp}.txt`;
    const filepath = path.join(exportsDir, filename);

    // Ghi file
    fs.writeFileSync(filepath, fileContent, "utf8");

    console.log(`\n✅ Đã xuất file thành công:`);
    console.log(`  - File path: ${filepath}`);
    console.log(`  - Tổng số user: ${eligibleUsers.length}`);

    // Hiển thị thông tin trong console
    console.log(
      `\n📋 DANH SÁCH USER CÓ adminChangeToDie = true NHƯNG dieTime TIER 1 = null VÀ KHÔNG ĐỦ 2 REFID:`
    );
    if (eligibleUsers.length === 0) {
      console.log(`  Không có user nào.`);
    } else {
      eligibleUsers.forEach((user, index) => {
        const createdAtStr = user.createdAt
          ? moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")
          : "N/A";
        console.log(`  ${index + 1}. ${user.userId} - Created: ${createdAtStr}`);
      });
    }

    return {
      filepath,
      totalCount: eligibleUsers.length,
      users: eligibleUsers,
    };
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
    throw err;
  }
};

/**
 * Kiểm tra thu nhập bất thường của user
 * Logic:
 * - Lấy danh sách user từ 01/11/2025 tới nay
 * - Với mỗi user:
 *   - X = tổng amount từ Transaction có userId_to = user._id
 *   - Y = tổng amount từ Claim có userId = user._id
 *   - So sánh: X = Y + user.availableUsdt
 *   - Nếu không bằng nhau thì ghi vào danh sách
 * - Xuất kết quả ra file txt
 */
export const checkAbnormalIncome = async () => {
  try {
    console.log("\n🔍 Bắt đầu kiểm tra thu nhập bất thường...");

    // Lấy danh sách user từ 01/11/2025 tới nay
    const startDate = moment.tz("2025-10-01", "Asia/Ho_Chi_Minh").startOf("day").toDate();
    const endDate = moment.tz("Asia/Ho_Chi_Minh").endOf("day").toDate();

    const users = await User.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      isAdmin: false,
    }).select("_id userId email availableUsdt createdAt");

    console.log(`📊 Tìm thấy ${users.length} user từ 01/10/2025 tới nay`);

    const abnormalUsers = [];

    for (const user of users) {
      try {
        // Tính X = tổng amount từ Transaction có userId_to = user._id
        const transactionResult = await Transaction.aggregate([
          {
            $match: {
              userId_to: user._id.toString(),
              status: "SUCCESS",
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ]);

        const X = transactionResult[0]?.totalAmount || 0;

        // Tính Y = tổng amount từ Claim có userId = user._id
        const claimResult = await Claim.aggregate([
          {
            $match: {
              userId: user._id,
              coin: "USDT",
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ]);

        const Y = claimResult[0]?.totalAmount || 0;

        // So sánh: X = Y + user.availableUsdt
        const expectedTotal = Y + (user.availableUsdt || 0);
        const difference = Math.abs(expectedTotal - X);

        // Tính số tiền đúng cần sửa lại: availableUsdt = Y + availableUsdt + 10 - X
        // const correctAvailableUsdt = Y + (user.availableUsdt || 0) - 10 - X;

        // Nếu không bằng nhau (cho phép sai số nhỏ do làm tròn)
        if (difference > 10 && Y > 0) {
          abnormalUsers.push({
            userId: user.userId,
            email: user.email,
            _id: user._id.toString(),
            createdAt: user.createdAt,
            X: X,
            Y: Y,
            availableUsdt: user.availableUsdt || 0,
            expectedTotal: expectedTotal,
            difference: difference,
            // correctAvailableUsdt: correctAvailableUsdt,
          });
        }
      } catch (err) {
        console.error(`❌ Lỗi khi kiểm tra user ${user.userId}:`, err.message);
      }
    }

    console.log(`\n⚠️  Tìm thấy ${abnormalUsers.length} user có thu nhập bất thường`);

    // Xuất kết quả ra file txt
    if (abnormalUsers.length > 0) {
      const timestamp = moment.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD_HH-mm-ss");
      const filename = `abnormal_income_${timestamp}.txt`;
      const filepath = path.join(process.cwd(), "public", "uploads", filename);

      // Đảm bảo thư mục tồn tại
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let content = `KIỂM TRA THU NHẬP BẤT THƯỜNG\n`;
      content += `Thời gian kiểm tra: ${moment
        .tz("Asia/Ho_Chi_Minh")
        .format("YYYY-MM-DD HH:mm:ss")}\n`;
      content += `Tổng số user kiểm tra: ${users.length}\n`;
      content += `Số user có thu nhập bất thường: ${abnormalUsers.length}\n\n`;
      content += `${"=".repeat(80)}\n\n`;

      abnormalUsers.forEach((user, index) => {
        content += `${index + 1}. User ID: ${user.userId}\n`;
        content += `   Email: ${user.email}\n`;
        content += `   _id: ${user._id}\n`;
        content += `   Created At: ${moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")}\n`;
        content += `   X (Tổng Transaction): ${user.X.toFixed(2)}\n`;
        content += `   Y (Tổng Claim): ${user.Y.toFixed(2)}\n`;
        content += `   Available USDT (hiện tại): ${user.availableUsdt.toFixed(2)}\n`;
        content += `   Expected Total (Y + availableUsdt): ${user.expectedTotal.toFixed(2)}\n`;
        content += `   Difference: ${user.difference.toFixed(2)}\n`;
        // content += `   Available USDT (cần sửa lại): ${user.correctAvailableUsdt.toFixed(2)}\n`;
        content += `\n`;
      });

      fs.writeFileSync(filepath, content, "utf8");

      console.log(`\n✅ Đã xuất kết quả ra file: ${filepath}`);
      console.log(`📄 Tổng số user bất thường: ${abnormalUsers.length}`);

      return {
        filepath,
        totalChecked: users.length,
        abnormalCount: abnormalUsers.length,
        abnormalUsers,
      };
    } else {
      console.log(`\n✅ Không có user nào có thu nhập bất thường`);
      return {
        filepath: null,
        totalChecked: users.length,
        abnormalCount: 0,
        abnormalUsers: [],
      };
    }
  } catch (err) {
    console.error(`\n❌ ERROR: ${err.message}`);
    throw err;
  }
};

/**
 * Tính tổng amount mà user đã nhận được
 * @param {string} userId - ID của user
 * @returns {number} - Tổng amount đã nhận được
 */
export const getTotalReceivedAmount = async (userId) => {
  try {
    const receivedAmount = await Transaction.aggregate([
      {
        $match: {
          userId_to: userId,
          status: "SUCCESS",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const claimAmount = await Claim.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          coin: "USDT",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    console.log({ receivedAmount, claimAmount });
    const totalAmount = receivedAmount[0]?.totalAmount + claimAmount[0]?.totalAmount;
  } catch (err) {
    console.error(`Error calculating total received amount: ${err.message}`);
    throw err;
  }
};

// Kiểm tra và xóa Claims trùng lặp (cùng userId, amount, hash)
// Giữ lại document đầu tiên, xóa các document trùng lặp còn lại
export const checkDuplicateClaims = async () => {
  try {
    console.log("Bắt đầu kiểm tra và xóa Claims trùng lặp...");

    // Tìm các Claims trùng lặp (cùng userId, amount, hash)
    const duplicateGroups = await Claim.aggregate([
      {
        $group: {
          _id: {
            userId: "$userId",
            amount: "$amount",
            hash: "$hash",
          },
          count: { $sum: 1 },
          claims: {
            $push: {
              _id: "$_id",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $match: {
          count: { $gt: 1 }, // Chỉ lấy các nhóm có nhiều hơn 1 claim
        },
      },
    ]);

    console.log(`Tìm thấy ${duplicateGroups.length} nhóm Claims trùng lặp`);

    let totalDeleted = 0;
    let totalKept = 0;

    // Xử lý từng nhóm trùng lặp
    for (const group of duplicateGroups) {
      // Sắp xếp claims theo createdAt tăng dần (document đầu tiên sẽ là claim cũ nhất)
      const sortedClaims = group.claims.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });

      // Giữ lại claim đầu tiên (cũ nhất)
      const keepClaimId = sortedClaims[0]._id;
      const deleteClaimIds = sortedClaims.slice(1).map((c) => c._id);

      // Xóa các claims trùng lặp (trừ claim đầu tiên)
      if (deleteClaimIds.length > 0) {
        const deleteResult = await Claim.deleteMany({
          _id: { $in: deleteClaimIds },
        });

        totalDeleted += deleteResult.deletedCount;
        totalKept += 1;

        console.log(
          `Nhóm trùng lặp: UserId=${group._id.userId}, Amount=${group._id.amount}, Hash=${group._id.hash}`
        );
        console.log(`  - Giữ lại: ${keepClaimId} (createdAt: ${sortedClaims[0].createdAt})`);
        console.log(`  - Đã xóa: ${deleteResult.deletedCount} claims`);
      }
    }

    console.log(`\n✅ Hoàn thành xử lý Claims trùng lặp:`);
    console.log(`  - Tổng số nhóm trùng lặp: ${duplicateGroups.length}`);
    console.log(`  - Tổng số Claims đã giữ lại: ${totalKept}`);
    console.log(`  - Tổng số Claims đã xóa: ${totalDeleted}`);

    return {
      success: true,
      totalGroups: duplicateGroups.length,
      totalKept,
      totalDeleted,
    };
  } catch (err) {
    console.error(`Error checking and deleting duplicate claims: ${err.message}`);
    throw err;
  }
};
