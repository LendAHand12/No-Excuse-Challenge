import moment from "moment";
import NextUserTier from "../models/nextUserTierModel.js";
import Tree from "../models/treeModel.js";
import User from "../models/userModel.js";
import axios from "axios";
import ADMIN_ID from "../constants/AdminId.js";

export const getParentUser = async (userId, tier) => {
  const tree = await Tree.findOne({ userId, tier });

  if (!tree) {
    throw new Error("System not found");
  }

  const parentUser = await User.findById(tree.parentId);

  if (!parentUser) {
    throw new Error("Couldn't find any superior information");
  }

  return parentUser;
};

export const getRefParentUser = async (userId, tier) => {
  const tree = await Tree.findOne({ userId, tier });

  if (!tree) {
    throw new Error("System not found");
  }

  const parentUser = await Tree.findById(tree.refId);

  if (!parentUser) {
    throw new Error("No referrer information found");
  }

  return parentUser;
};

export const findNextUser = async (tier) => {
  const nextUserInDB = await NextUserTier.findOne({ tier });
  if (nextUserInDB) return nextUserInDB.userId;
  const admin = await User.findById("6494e9101e2f152a593b66f2");
  if (!admin) throw "Unknow admin";
  const listUserLevel = await findUsersAtLevel(admin._id, admin.currentLayer[tier - 1], 2, 1);

  const sortedData = listUserLevel.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const itemWithMinLength = sortedData.reduce((minItem, currentItem) => {
    return currentItem.children.length < minItem.children.length ? currentItem : minItem;
  }, sortedData[0]);
  return itemWithMinLength ? itemWithMinLength.userId : "6494e9101e2f152a593b66f2";
};

export const findNextUserNotIncludeNextUserTier = async (tier) => {
  const admin = await User.findById("6494e9101e2f152a593b66f2");
  if (!admin) throw "Unknow admin";
  const listUserLevel = await findUsersAtLevel(admin._id, admin.currentLayer[tier - 1], 2, 1);
  const sortedData = listUserLevel.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  // for (let user of sortedData) {
  //   console.log({
  //     userName: user.userName,
  //     length: user.children.length,
  //     createdAt: user.createdAt,
  //   });
  // }

  const itemWithMinLength = sortedData.reduce((minItem, currentItem) => {
    return currentItem.children.length < minItem.children.length ? currentItem : minItem;
  }, sortedData[0]);
  return itemWithMinLength ? itemWithMinLength.userId : "6494e9101e2f152a593b66f2";
};

export const findUsersAtLevel = async (rootUserId, targetLevel, tier, currentLevel = 1) => {
  if (currentLevel > targetLevel) {
    return [];
  }

  const root = await Tree.findOne({ userId: rootUserId, tier }).populate("children");
  if (!root) {
    return [];
  }

  if (currentLevel === targetLevel) {
    return Tree.find({
      userId: { $in: root.children.map((child) => child) },
      tier,
    });
  }

  let usersAtLevel = [];
  for (const child of root.children) {
    const usersInChildren = await findUsersAtLevel(child, targetLevel, tier, currentLevel + 1);
    usersAtLevel = usersAtLevel.concat(usersInChildren);
  }

  return usersAtLevel;
};

export const findRootLayer = async (id, tier) => {
  // Tìm người dùng root đầu tiên (có parentId null)
  const root = await User.findById(id);
  if (!root) {
    return 0; // Nếu không tìm thấy root, trả về 0
  }

  let layer = 1;
  let currentLayerCount = 1; // Số lượng node hoàn chỉnh ở tầng hiện tại (ban đầu là 1)

  while (true) {
    const nextLayerCount = currentLayerCount * 2; // Số lượng node hoàn chỉnh trong tầng tiếp theo
    const totalDescendants = await countDescendants(root._id, layer, tier); // Tính tổng số con (bao gồm cả node hoàn chỉnh và node chưa đủ 3 cấp dưới)

    if (totalDescendants < nextLayerCount) {
      break;
    }

    layer++;
    currentLayerCount = nextLayerCount;
  }

  return layer - 1; // Trừ 1 vì layer hiện tại là layer chưa hoàn chỉnh
};

export const countDescendants = async (userId, layer, tier) => {
  const tree = await Tree.findOne({ userId, tier });

  if (!tree) {
    return 0;
  }

  if (layer === 0) {
    return 1; // Nếu đã đủ 3 cấp dưới thì tính là một node hoàn chỉnh
  }

  let count = 0;

  for (const childId of tree.children) {
    const child = await User.findById(childId);
    if (child && child.countPay !== 0) {
      count += await countDescendants(childId, layer - 1, tier);
    }
  }

  return count;
};

export const getUserClosestToNow = (users) => {
  const currentTime = moment();

  users.sort((userA, userB) => {
    const timeA = moment(userA.userId.lockedTime);
    const timeB = moment(userB.userId.lockedTime);
    return currentTime.diff(timeA) - currentTime.diff(timeB);
  });

  return users[0];
};

export const checkRatioCountChildOfUser = async (userId) => {
  const u = await User.findById(userId);
  if (u.countChild[0] >= 300) {
    const listChildId = await Tree.find({
      parentId: u._id,
      tier: 1,
    }).select("userId");

    let highestChildSales = 0;
    let lowestChildSales = Infinity;

    for (const childId of listChildId) {
      const child = await User.findById(childId.userId);

      if (child.countChild[0] > highestChildSales) {
        highestChildSales = child.countChild[0];
      }

      if (child.countChild[0] < lowestChildSales) {
        lowestChildSales = child.countChild[0];
      }
    }

    if (highestChildSales >= 0.4 * 300 && lowestChildSales >= 0.2 * 300) {
      return true;
    } else {
      return false;
    }
  }
};

export const checkSerepayWallet = async (walletAddress) => {
  return axios
    .post(`${process.env.SEREPAY_HOST}/api/user/checkwallet`, {
      wallet: walletAddress,
    })
    .then(async (response) => {
      return response.data.status;
    })
    .catch((error) => {
      return false;
      // let message =
      //   error.response && error.response.data.message
      //     ? error.response.data.message
      //     : error.message;
      // throw new Error(message);
    });
};
export const removeAccents = (str) => {
  var AccentsMap = [
    "aàảãáạăằẳẵắặâầẩẫấậ",
    "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
    "dđ",
    "DĐ",
    "eèẻẽéẹêềểễếệ",
    "EÈẺẼÉẸÊỀỂỄẾỆ",
    "iìỉĩíị",
    "IÌỈĨÍỊ",
    "oòỏõóọôồổỗốộơờởỡớợ",
    "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
    "uùủũúụưừửữứự",
    "UÙỦŨÚỤƯỪỬỮỨỰ",
    "yỳỷỹýỵ",
    "YỲỶỸÝỴ",
  ];
  for (var i = 0; i < AccentsMap.length; i++) {
    var re = new RegExp("[" + AccentsMap[i].substr(1) + "]", "g");
    var char = AccentsMap[i][0];
    str = str.replace(re, char);
  }
  return str.toLowerCase();
};

export const findLevelById = async (userId, tier) => {
  try {
    const node = await Tree.findOne({ userId, tier });

    if (!node) {
      return -1;
    }

    let level = 0;
    let currentParentId = node.parentId;

    while (currentParentId) {
      const parentNode = await Tree.findOne({ userId: currentParentId, tier });

      if (!parentNode) {
        break;
      }

      level++;
      currentParentId = parentNode.parentId;
    }

    return level;
  } catch (error) {
    console.error("Error finding level:", error);
    return -1;
  }
};

export const findHighestLevelUsers = async (tier) => {
  const rootUser = await User.findById(ADMIN_ID);
  const targetLevel = rootUser.currentLayer[tier - 1] + 1;
  let highestLevelUsers = [];
  highestLevelUsers = await findUsersAtLevel(ADMIN_ID, targetLevel, tier, 1);
  return highestLevelUsers;
};

export const findHighestIndexOfLevel = async (tier) => {
  const highestLevelUsers = await findHighestLevelUsers(tier);
  if (highestLevelUsers.length === 0) {
    return 1;
  } else {
    const maxIndexOfLevel = Math.max(...highestLevelUsers.map((o) => o.indexOnLevel));
    return maxIndexOfLevel + 1;
  }
};

export const findNextUserByIndex = async (tier) => {
  const lastUserTree = await Tree.findOne({ tier }).sort("-createdAt");
  const parentOfLastUserTree = await Tree.findOne({
    userId: lastUserTree.parentId,
    tier,
  });
  const nextUserTree = await Tree.find({
    createdAt: { $gte: parentOfLastUserTree.createdAt },
    tier,
  });
  return nextUserTree.userId;
};

export const mergeIntoThreeGroups = (A) => {
  if (A.length === 0) return [0, 0, 0];
  if (A.length === 1) return [A[0].countChild, 0, 0];
  if (A.length === 2) return [A[0].countChild, A[1].countChild, 0];

  // Sort by countChild descending
  const sorted = [...A].sort((a, b) => b.countChild - a.countChild);

  // Assign groups
  const group1 = sorted[0].countChild;
  const group2 = sorted[1]?.countChild || 0;
  const group3 = sorted.slice(2).reduce((sum, item) => sum + item.countChild, 0);

  return [group1, group2, group3];
};

export const findNextReferrer = async (referrerId) => {
  const referrer = await Tree.findOne({ userId: referrerId });
  if (!referrer) return null;

  // Nếu referrer là root (không có parentId), cho phép nhiều nhánh
  if (!referrer.parentId) {
    return referrer.userId;
  }

  // Nếu người giới thiệu chưa đủ 2 nhánh, trả về chính họ
  if (referrer.children.length < 2) {
    return referrer.userId;
  }

  // BFS để tìm vị trí thích hợp trong hệ thống của referrer
  const queue = [...referrer.children];
  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentUser = await Tree.findOne({ userId: currentId });

    if (!currentUser) continue;

    if (currentUser.children.length < 2) {
      return currentUser.userId;
    }

    queue.push(...currentUser.children);
  }

  return null; // Không tìm thấy vị trí hợp lệ
};
