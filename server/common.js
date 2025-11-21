import Transaction from "./models/transactionModel.js";
import Tree from "./models/treeModel.js";
import User from "./models/userModel.js";
import UserOld from "./models/userOldModel.js";
import { getParentWithCountPay } from "./utils/getParentWithCountPay.js";
import {
  findNextUser,
  findLevelById,
  findUsersAtLevel,
  findNextUserByIndex,
  calculateDieTimeForTier1,
  calculateDieTimeForTier2,
  countAliveIdsInBranch,
} from "./utils/methods.js";
import moment from "moment-timezone";

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
    console.log({ name: tree.userName, create: tree.createdAt, errLahCode: user.errLahCode });
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
