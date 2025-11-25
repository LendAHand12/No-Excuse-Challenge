import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import WildCard from "../models/wildCardModel.js";
import User from "../models/userModel.js";
import Tree from "../models/treeModel.js";

// Logic tự động tạo thẻ đã được bỏ - Admin sẽ tự tạo thẻ cho user

/**
 * Get all wild cards for a user
 */
const getUserWildCards = asyncHandler(async (req, res) => {
  const user = req.user;

  const wildCards = await WildCard.find({
    userId: user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    wildCards,
  });
});

/**
 * Use a wild card (add days to Tree.dieTime of target tier)
 */
const useWildCard = asyncHandler(async (req, res) => {
  const user = req.user;
  const { cardId, targetUserId } = req.body; // targetUserId for admin to use on behalf of user

  const card = await WildCard.findById(cardId);

  if (!card) {
    res.status(404);
    throw new Error("Wild card not found");
  }

  // Check if card belongs to user (or admin can use any card)
  if (card.userId.toString() !== user._id.toString() && !user.isAdmin) {
    res.status(403);
    throw new Error("You don't have permission to use this card");
  }

  if (card.status !== "ACTIVE") {
    res.status(400);
    throw new Error("Card is not active");
  }

  // Determine target user
  let targetUser;
  if (user.isAdmin && targetUserId) {
    // Admin using card for another user
    targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404);
      throw new Error("Target user not found");
    }
  } else {
    // User using card for themselves
    targetUser = user;
  }

  // Get target tier from card
  const targetTier = card.targetTier || 1;
  const daysToAdd = card.days || 15;

  // Find the tree of target user with target tier
  const targetTree = await Tree.findOne({
    userId: targetUser._id,
    tier: targetTier,
    isSubId: false,
  });

  if (!targetTree) {
    res.status(404);
    throw new Error(`Tree not found for user ${targetUser.userId} at tier ${targetTier}`);
  }

  // Kiểm tra dieTime phải khác null mới cho phép sử dụng wild card
  if (!targetTree.dieTime || targetTree.dieTime === null) {
    res.status(400);
    throw new Error("userProfile.wildCard.cannotUse");
  }

  // Calculate new dieTime: add days to current dieTime
  const todayStart = moment.tz("Asia/Ho_Chi_Minh").startOf("day");
  // Nếu đã có dieTime, sử dụng nó
  const currentDieTime = moment.tz(targetTree.dieTime, "Asia/Ho_Chi_Minh").startOf("day");

  // Add days to dieTime
  const newDieTime = currentDieTime.add(daysToAdd, "days").startOf("day").toDate();

  // Update tree dieTime
  targetTree.dieTime = newDieTime;
  await targetTree.save();

  // Update User.errLahCode if tier 1
  if (targetTier === 1) {
    const newDieTimeMoment = moment.tz(newDieTime, "Asia/Ho_Chi_Minh").startOf("day");
    const diffDays = newDieTimeMoment.diff(todayStart, "days");

    if (diffDays <= 0) {
      // User has died
      targetUser.errLahCode = "OVER45";
    } else if (diffDays >= 1 && diffDays <= 10) {
      // User has 1-10 days remaining
      targetUser.errLahCode = "OVER35";
    } else {
      // User has more than 10 days
      targetUser.errLahCode = "";
    }
    await targetUser.save();
  }

  // Update disable status for tier 2 tree
  if (targetTier === 2) {
    const newDieTimeMoment = moment.tz(newDieTime, "Asia/Ho_Chi_Minh").startOf("day");
    const diffDays = newDieTimeMoment.diff(todayStart, "days");

    if (diffDays <= 0) {
      targetTree.disable = true;
    } else {
      targetTree.disable = false;
    }
    await targetTree.save();
  }

  // Mark card as used
  card.status = "USED";
  card.usedAt = new Date();
  card.usedBy = user.isAdmin ? "ADMIN" : "USER";
  if (user.isAdmin && targetUserId) {
    card.appliedToUserId = targetUserId;
  }
  await card.save();

  res.json({
    success: true,
    message: "Wild card used successfully",
    newDieTime: newDieTime,
    targetTier: targetTier,
    daysAdded: daysToAdd,
    card: card,
  });
});

/**
 * Admin: Get all wild cards for a specific user
 */
const adminGetUserWildCards = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const wildCards = await WildCard.find({
    userId: userId,
  }).sort({ createdAt: -1 });

  const user = await User.findById(userId).select("userId email");

  res.json({
    success: true,
    user: user,
    wildCards,
  });
});

/**
 * Create wild card for admin (admin can create cards for themselves or others)
 */
const adminCreateWildCard = asyncHandler(async (req, res) => {
  const admin = req.user;
  const { userId, sourceInfo, days, targetTier } = req.body;

  if (!admin.isAdmin) {
    res.status(403);
    throw new Error("Only admins can create wild cards");
  }

  // If userId is provided, create for that user, otherwise create for admin
  const targetUserId = userId || admin._id;

  if (!days || days <= 0) {
    res.status(400);
    throw new Error("days is required and must be greater than 0");
  }

  if (!targetTier || (targetTier !== 1 && targetTier !== 2)) {
    res.status(400);
    throw new Error("targetTier is required and must be 1 or 2");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    res.status(404);
    throw new Error("Target user not found");
  }

  const card = await WildCard.create({
    userId: targetUserId,
    cardType: "ADMIN_CREATED", // Mặc định là ADMIN_CREATED khi admin tạo
    status: "ACTIVE",
    sourceInfo: sourceInfo || `Created by admin ${admin.userId}`,
    days: days,
    targetTier: targetTier,
  });

  res.json({
    success: true,
    card,
    message: `Wild card created for user ${targetUser.userId}`,
  });
});

export { getUserWildCards, useWildCard, adminGetUserWildCards, adminCreateWildCard };
