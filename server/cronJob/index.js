import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
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
  calculateDieTimeForTier1,
  calculateDieTimeForTier2,
  isUserExpired,
} from "../utils/methods.js";
import Tree from "../models/treeModel.js";
import Transaction from "../models/transactionModel.js";
import Honor from "../models/honorModel.js";
import { getPriceHewe } from "../utils/getPriceHewe.js";
import Config from "../models/configModel.js";
import Income from "../models/incomeModel.js";
import WildCard from "../models/wildCardModel.js";
import Claim from "../models/claimModel.js";

// Fetch VN rates from phobitcoin.com
export const fetchVnUsdRates = asyncHandler(async () => {
  const url = "https://phobitcoin.com/api/update";
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  const vn = json && json.vn ? json.vn : {};

  const rates = {
    usdtAsk: vn.usdt_ask ? Number(vn.usdt_ask) : null,
    usdtBid: vn.usdt_bid ? Number(vn.usdt_bid) : null,
    pmVoucherAsk: vn.pm_voucher_ask ? Number(vn.pm_voucher_ask) : null,
    pmVoucherBid: vn.pm_voucher_bid ? Number(vn.pm_voucher_bid) : null,
    pmAsk: vn.pm_ask ? Number(vn.pm_ask) : null,
    pmBid: vn.pm_bid ? Number(vn.pm_bid) : null,
    fetchedAt: new Date(),
  };

  // Update ConfigModel values if available; keep old values on missing fields
  try {
    // BUY = usdt_ask
    if (rates.usdtAsk !== null) {
      let buyCfg = await Config.findOne({ label: "USD_TO_VND_SELL" });
      if (!buyCfg) {
        buyCfg = new Config({ label: "USD_TO_VND_SELL", value: rates.usdtAsk });
      } else {
        buyCfg.value = rates.usdtAsk;
      }
      await buyCfg.save();
    }

    // SELL = usdt_bid
    if (rates.usdtBid !== null) {
      let sellCfg = await Config.findOne({ label: "USD_TO_VND_BUY" });
      if (!sellCfg) {
        sellCfg = new Config({ label: "USD_TO_VND_BUY", value: rates.usdtBid });
      } else {
        sellCfg.value = rates.usdtBid;
      }
      await sellCfg.save();
    }
  } catch (e) {
    // Keep old values: swallow update errors but log
    console.error("Failed to update USD_TO_VND configs:", e?.message || e);
  }

  console.log("Fetched VN USD rates from phobitcoin:", rates);
  return rates;
});

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
      if (treeOfUser) {
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
      } else {
        u.status = "DELETED";
        u.deletedTime = new Date();
        await u.save();
      }
    }
  }
});

export const countChildToData = asyncHandler(async () => {
  const listTrees = await Tree.find({}).select("tier countChild userId userName dieTime");

  for (let t of listTrees) {
    // const t = await Tree.findById("68176977299e3ad047c0368e").select(
    //   "tier countChild userId userName"
    // );
    try {
      console.log({ name: t.userName });

      const countChild = await getCountAllChildren(t._id, t.tier);
      const income = await getCountIncome(t._id, t.tier);
      // if (t.userName === "DINHLIEU" && t.tier === 2) {
      //   console.log({ countChild, income });
      // }
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
  // Lấy giá hewe từ config
  const hewePriceConfig = await Config.findOne({ label: "HEWE_PRICE" });
  const hewePrice = hewePriceConfig ? Number(hewePriceConfig.value) : 0;

  const listUser = await User.find({
    $and: [{ isAdmin: false }, { userId: { $ne: "Admin2" } }, { countPay: 13 }],
  }).select("userId totalHewe availableHewe hewePerDay claimedHewe currentLayer");

  for (let u of listUser) {
    try {
      // Tính tổng claimedHewe từ model Claim
      const claimedHeweResult = await Claim.aggregate([
        { $match: { userId: u._id, coin: "HEWE" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const claimedHewe = claimedHeweResult[0]?.total || 0;

      // Tính số hewe còn lại user sẽ được nhận
      const remainingHewe = u.totalHewe - claimedHewe - u.availableHewe;

      // Nếu không còn hewe để nhận thì bỏ qua
      if (remainingHewe <= 0) {
        continue;
      }

      let heweToAdd = 0;
      let incomeFrom = "";

      if (u.currentLayer[0] === 4) {
        // Nếu currentLayer[0] = 4: nhận số hewe = 100 / giá của hewe (làm tròn thành số nguyên)
        heweToAdd = hewePrice > 0 ? Math.round(100 / hewePrice) : 0;
        incomeFrom = "Daily HEWE level 4";
      } else if (u.currentLayer[0] === 8) {
        // Nếu currentLayer[0] = 8: nhận toàn bộ hewe còn lại (làm tròn thành số nguyên)
        heweToAdd = Math.round(remainingHewe);
        incomeFrom = "Daily HEWE all";
      } else {
        // Các trường hợp khác: nhận hewePerDay mỗi ngày (làm tròn thành số nguyên)
        // Chỉ nhận khi remainingHewe > 0
        if (remainingHewe > 0) {
          heweToAdd = Math.round(u.hewePerDay);
          incomeFrom = "Daily HEWE";
        }
      }

      // Chỉ cộng vào availableHewe nếu heweToAdd > 0
      if (heweToAdd > 0) {
        // Đảm bảo không vượt quá số hewe còn lại và làm tròn thành số nguyên
        const actualHeweToAdd = Math.round(Math.min(heweToAdd, remainingHewe));
        u.availableHewe = u.availableHewe + actualHeweToAdd;

        const newIncome = new Income({
          userId: u._id,
          amount: actualHeweToAdd,
          coin: "HEWE",
          from: incomeFrom,
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

/**
 * Tính lại dieTime cho tất cả tree mỗi ngày
 * Logic:
 * - Tier 1: 30 ngày từ createdAt để có ít nhất 2 tree con sống
 * - Tier 2: 45 ngày từ createdAt để có đủ 62 id sống (tổng >= 62, mỗi nhánh >= 20)
 */
export const calculateTreeDieTime = asyncHandler(async () => {
  try {
    console.log("Calculate tree dieTime start");

    // Bước 1: Tính dieTime cho tất cả tree tier 2 trước (không phụ thuộc tree con)
    const treesTier2 = await Tree.find({ tier: 2 });
    console.log(`Found ${treesTier2.length} trees tier 2`);

    let updatedTier2 = 0;
    for (const tree of treesTier2) {
      try {
        const newDieTime = await calculateDieTimeForTier2(tree);
        if (
          (!tree.dieTime && newDieTime) ||
          (tree.dieTime && newDieTime && tree.dieTime.getTime() !== newDieTime.getTime()) ||
          (tree.dieTime && !newDieTime)
        ) {
          tree.dieTime = newDieTime;
          await tree.save();
          updatedTier2++;
        }
      } catch (err) {
        console.error(`Error calculating dieTime for tree tier 2 ${tree._id}:`, err);
      }
    }

    console.log(`Updated ${updatedTier2} trees tier 2`);

    // Bước 2: Tính dieTime cho tất cả tree tier 1 (sau khi đã tính tier 2)
    const treesTier1 = await Tree.find({ tier: 1 });
    console.log(`Found ${treesTier1.length} trees tier 1`);

    // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
    const today = moment.tz("Asia/Ho_Chi_Minh").startOf("day");

    let updatedTier1 = 0;
    let updatedErrLahCode = 0;
    for (const tree of treesTier1) {
      try {
        const newDieTime = await calculateDieTimeForTier1(tree);
        const dieTimeChanged =
          (!tree.dieTime && newDieTime) ||
          (tree.dieTime && newDieTime && tree.dieTime.getTime() !== newDieTime.getTime()) ||
          (tree.dieTime && !newDieTime);

        if (dieTimeChanged) {
          tree.dieTime = newDieTime;
          await tree.save();
          updatedTier1++;
        }

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
              userErr
            );
          }
        }
      } catch (err) {
        console.error(`Error calculating dieTime for tree tier 1 ${tree._id}:`, err);
      }
    }

    console.log(`Updated ${updatedTier1} trees tier 1`);
    console.log(`Updated ${updatedErrLahCode} users errLahCode`);
    console.log("Calculate tree dieTime done");
  } catch (err) {
    console.error("Error in calculateTreeDieTime:", err);
  }
});

/**
 * Cronjob: Tự động tạo wild card cho user tier 2 khi có 5 refId mới
 * Logic:
 * - Quét tất cả user có tier = 2
 * - Tìm tree tier 1 của user đó
 * - Đếm số refId mới (có createdAt > lastWildCardRewardAt hoặc chưa có wild card nào)
 * - Nếu >= 5 refId mới, tạo wild card (target tier 1, 15 ngày) và cập nhật lastWildCardRewardAt
 */
export const createWildCardForTier2Users = asyncHandler(async () => {
  try {
    console.log("Create wild card for tier 2 users start");

    // Lấy tất cả user có tier = 2
    const tier2Users = await User.find({
      tier: 2,
      isAdmin: false,
      status: { $ne: "DELETED" },
    });

    console.log(`Found ${tier2Users.length} tier 2 users`);

    let createdCards = 0;
    let processedUsers = 0;

    for (const user of tier2Users) {
      try {
        // Tìm tree tier 1 của user (isSubId = false)
        const treeTier1 = await Tree.findOne({
          userId: user._id,
          tier: 1,
          isSubId: false,
        });

        if (!treeTier1) {
          continue; // Bỏ qua nếu không có tree tier 1
        }

        // Xác định thời điểm bắt đầu đếm refId mới
        // Nếu chưa có lastWildCardRewardAt, đếm từ khi user lên tier 2 (tier2Time)
        // Nếu có lastWildCardRewardAt, đếm từ thời điểm đó
        const startDate = user.lastWildCardRewardAt || user.createdAt;

        // Lấy tất cả refId mới (có createdAt > startDate)
        const allNewRefIds = await Tree.find({
          refId: treeTier1._id,
          tier: 1,
          isSubId: false,
          createdAt: { $gt: startDate },
        }).sort({ createdAt: 1 }); // Sắp xếp theo createdAt tăng dần

        // Lọc các refId thỏa mãn điều kiện: status = APPROVED, countPay = 13, dieTime của tier 1 chưa quá hạn
        const validRefIds = [];
        for (const refIdTree of allNewRefIds) {
          // const refIdUser = await User.findById(refIdTree.userId).select("status countPay");
          // const isExpired = await isUserExpired(refIdTree._id);

          // if (
          //   refIdUser &&
          //   refIdUser.status === "APPROVED" &&
          //   refIdUser.countPay === 13 &&
          //   !isExpired
          // ) {
          //   console.log({ refIdTree });
          //   validRefIds.push(refIdTree);
          // }
          validRefIds.push(refIdTree);
        }

        const newRefIdCount = validRefIds.length;

        // Nếu có >= 5 refId mới hợp lệ, tạo wild card
        // Tính số wild card cần tạo: mỗi 5 refId mới = 1 card
        if (newRefIdCount >= 5) {
          // Tính số wild card cần tạo (mỗi 5 refId = 1 card)
          const cardsToCreate = Math.floor(newRefIdCount / 5);

          // Tạo tất cả các wild card cần thiết
          for (let i = 0; i < cardsToCreate; i++) {
            await WildCard.create({
              userId: user._id,
              cardType: "REFERRAL_REWARD",
              status: "ACTIVE",
              sourceInfo: `Auto created: ${(i + 1) * 5} new referrals`,
              days: 15,
              targetTier: 1, // Target tier 1 như user yêu cầu
              usedBy: null,
            });
            createdCards++;
          }

          // Cập nhật lastWildCardRewardAt = createdAt của refId thứ (cardsToCreate * 5)
          // Ví dụ: 24 refId → 4 cards → cập nhật = refId thứ 20
          // Điều này đảm bảo lần chạy tiếp theo chỉ tính các refId sau refId đã được tính
          const lastRefIdIndex = cardsToCreate * 5 - 1; // Index của refId cuối cùng được tính (0-based)
          if (lastRefIdIndex < validRefIds.length) {
            const lastRefId = validRefIds[lastRefIdIndex];
            user.lastWildCardRewardAt = lastRefId.createdAt;
            await user.save();

            console.log({
              user: user.userId,
              newRefIdCount,
              cardsToCreate,
              lastRefIdAt: lastRefId.createdAt,
            });
          }

          processedUsers++;
        }
      } catch (err) {
        console.error(`Error processing user ${user.userId}:`, err);
      }
    }

    console.log(`Processed ${processedUsers} users`);
    console.log(`Created ${createdCards} wild cards`);
    console.log("Create wild card for tier 2 users done");
  } catch (err) {
    console.error("Error in createWildCardForTier2Users:", err);
  }
});
