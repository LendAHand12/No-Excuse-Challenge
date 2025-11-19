import asyncHandler from "express-async-handler";
import moment from "moment";
import WildCard from "../models/wildCardModel.js";
import User from "../models/userModel.js";
import Tree from "../models/treeModel.js";
import { getTotalLevel1ToLevel10OfUser } from "../utils/methods.js";

/**
 * Count active IDs (not OVER45) for Tier 2 user
 * This function counts only IDs that don't have errLahCode = OVER45
 */
const countActiveIdsForTier2 = async (user) => {
  const treeOfUser = await Tree.findOne({
    userId: user._id,
    isSubId: false,
    tier: 1,
  });

  if (!treeOfUser) return { total: 0, countChild1: 0, countChild2: 0 };

  // Use getTotalLevel1ToLevel10OfUser with includesDieId = false to exclude OVER45 IDs
  const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(treeOfUser, false);
  const total = countChild1 + countChild2;

  return { total, countChild1, countChild2 };
};

/**
 * Check and create Tier 2 reward cards (2 cards after 45 days without 62 active IDs)
 */
const checkAndCreateTier2RewardCards = asyncHandler(async () => {
  try {
    const tier2Users = await User.find({
      tier: 2,
      isAdmin: false,
      status: { $ne: "DELETED" },
    });

    for (const user of tier2Users) {
      if (!user.tier2Time) continue;

      const daysSinceTier2 = moment().diff(moment(user.tier2Time), "days");

      // Check if 45 days have passed
      if (daysSinceTier2 >= 45) {
        const { total } = await countActiveIdsForTier2(user);

        // If still don't have 62 active IDs
        if (total < 62) {
          // Check if user already has 2 TIER2_REWARD cards
          const existingCards = await WildCard.countDocuments({
            userId: user._id,
            cardType: "TIER2_REWARD",
            status: "ACTIVE",
          });

          // Create 2 cards if not already created
          if (existingCards < 2) {
            const cardsToCreate = 2 - existingCards;
            for (let i = 0; i < cardsToCreate; i++) {
              await WildCard.create({
                userId: user._id,
                cardType: "TIER2_REWARD",
                status: "ACTIVE",
                sourceInfo: `Tier 2 reward - After 45 days without 62 active IDs`,
              });
            }
            console.log(`Created ${cardsToCreate} TIER2_REWARD cards for user ${user.userId}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in checkAndCreateTier2RewardCards:", error);
  }
});

/**
 * Check and create referral reward cards (1 card per 5 direct referrals)
 */
const checkAndCreateReferralRewardCards = asyncHandler(async () => {
  try {
    const allUsers = await User.find({
      isAdmin: false,
      status: { $ne: "DELETED" },
    });

    for (const user of allUsers) {
      const treeOfUser = await Tree.findOne({
        userId: user._id,
        isSubId: false,
        tier: 1,
      });

      if (!treeOfUser) continue;

      // Get direct referrals (refId = treeOfUser._id, tier = 1)
      const directReferrals = await Tree.find({
        refId: treeOfUser._id,
        tier: 1,
      });

      // Count active referrals (not OVER45)
      const activeReferralIds = [];
      for (const refTree of directReferrals) {
        const refUser = await User.findById(refTree.userId);
        if (refUser && refUser.errLahCode !== "OVER45") {
          activeReferralIds.push(refTree._id.toString());
        }
      }

      const activeCount = activeReferralIds.length;

      // Calculate how many cards should exist (1 card per 5 referrals)
      const expectedCards = Math.floor(activeCount / 5);

      // Count existing active REFERRAL_REWARD cards
      const existingCards = await WildCard.countDocuments({
        userId: user._id,
        cardType: "REFERRAL_REWARD",
        status: "ACTIVE",
      });

      // Create missing cards
      if (expectedCards > existingCards) {
        const cardsToCreate = expectedCards - existingCards;
        for (let i = 0; i < cardsToCreate; i++) {
          await WildCard.create({
            userId: user._id,
            cardType: "REFERRAL_REWARD",
            status: "ACTIVE",
            sourceInfo: `Referral reward - ${activeCount} direct referrals`,
          });
        }
        console.log(
          `Created ${cardsToCreate} REFERRAL_REWARD cards for user ${user.userId} (${activeCount} referrals)`
        );
      }
    }
  } catch (error) {
    console.error("Error in checkAndCreateReferralRewardCards:", error);
  }
});

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
 * Use a wild card (add 15 days to dieTime)
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

  // Add 15 days to dieTime
  const currentDieTime = targetUser.dieTime ? moment(targetUser.dieTime) : moment();
  const newDieTime = currentDieTime.add(15, "days").toDate();

  targetUser.dieTime = newDieTime;

  // Update errLahCode if needed (if dieTime is in future, clear OVER45)
  if (moment(newDieTime).isAfter(moment())) {
    if (targetUser.errLahCode === "OVER45") {
      targetUser.errLahCode = "";
    }
  }

  await targetUser.save();

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
    newDieTime: targetUser.dieTime,
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
  const { userId, cardType, sourceInfo } = req.body;

  if (!admin.isAdmin) {
    res.status(403);
    throw new Error("Only admins can create wild cards");
  }

  // If userId is provided, create for that user, otherwise create for admin
  const targetUserId = userId || admin._id;

  if (!cardType) {
    res.status(400);
    throw new Error("cardType is required");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    res.status(404);
    throw new Error("Target user not found");
  }

  const card = await WildCard.create({
    userId: targetUserId,
    cardType: cardType,
    status: "ACTIVE",
    sourceInfo: sourceInfo || `Created by admin ${admin.userId}`,
  });

  res.json({
    success: true,
    card,
    message: `Wild card created for user ${targetUser.userId}`,
  });
});

export {
  checkAndCreateTier2RewardCards,
  checkAndCreateReferralRewardCards,
  getUserWildCards,
  useWildCard,
  adminGetUserWildCards,
  adminCreateWildCard,
};
