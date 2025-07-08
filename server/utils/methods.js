import moment from "moment";
import NextUserTier from "../models/nextUserTierModel.js";
import Tree from "../models/treeModel.js";
import User from "../models/userModel.js";
import axios from "axios";
import ADMIN_ID from "../constants/AdminId.js";
import { areArraysEqual } from "../cronJob/index.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

  const parent = await User.findById(parentUser.userId);

  return { ...parentUser._doc, walletAddress: parent.walletAddress };
};

export const findNextUser = async (tier) => {
  await countLayerOfAdmin();
  const admin = await User.findById("6494e9101e2f152a593b66f2");
  if (!admin) throw "Unknow admin";
  const adminTree = await Tree.findOne({ userId: admin._id, tier });
  const listUserLevel = await findUsersAtLevel(adminTree._id, admin.currentLayer[tier - 1], 2, 1);

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

// export const findUsersAtLevel = async (
//   rootTreeId,
//   targetLevel,
//   tier,
//   currentLevel = 1
// ) => {
//   if (currentLevel > targetLevel) {
//     return [];
//   }

//   const root = await Tree.findById(rootTreeId).populate("children");
//   if (!root) {
//     return [];
//   }

//   if (currentLevel === targetLevel) {
//     return Tree.findById({ $in: root.children.map((child) => child) });
//   }

//   let usersAtLevel = [];
//   for (const child of root.children) {
//     const usersInChildren = await findUsersAtLevel(
//       child,
//       targetLevel,
//       tier,
//       currentLevel + 1
//     );
//     usersAtLevel = usersAtLevel.concat(usersInChildren);
//   }

//   return usersAtLevel;
// };

export const findUsersAtLevel = async (rootTreeId, targetLevel, tier, currentLevel = 1) => {
  if (currentLevel > targetLevel) {
    return [];
  }

  const rootTree = await Tree.findById(rootTreeId);
  if (!rootTree) {
    return [];
  }

  if (currentLevel === targetLevel) {
    const trees = await Tree.find({
      _id: { $in: rootTree.children },
      tier: tier,
    });

    return trees;
  }

  let treesAtTargetLevel = [];

  for (const childId of rootTree.children) {
    const treesFromChild = await findUsersAtLevel(childId, targetLevel, tier, currentLevel + 1);
    treesAtTargetLevel = treesAtTargetLevel.concat(treesFromChild);
  }

  return treesAtTargetLevel;
};

export const findRootLayer = async (id, tier) => {
  // Tìm người dùng root đầu tiên (có parentId null)
  const root = await User.findById(id);
  const treeRoot = await Tree.findOne({ userId: root._id, tier });
  if (!root || !treeRoot) {
    return 0; // Nếu không tìm thấy root, trả về 0
  }

  let layer = 1;
  let currentLayerCount = 1; // Số lượng node hoàn chỉnh ở tầng hiện tại (ban đầu là 1)

  while (true) {
    const nextLayerCount = currentLayerCount * 2; // Số lượng node hoàn chỉnh trong tầng tiếp theo
    const totalDescendants = await countDescendants(treeRoot._id, layer, tier); // Tính tổng số con (bao gồm cả node hoàn chỉnh và node chưa đủ 3 cấp dưới)

    if (totalDescendants < nextLayerCount) {
      break;
    }

    layer++;
    currentLayerCount = nextLayerCount;
  }

  return layer - 1; // Trừ 1 vì layer hiện tại là layer chưa hoàn chỉnh
};

export const countDescendants = async (userId, layer, tier) => {
  const tree = await Tree.findById(userId);

  if (!tree) {
    return 0;
  }

  if (layer === 0) {
    return 1; // Nếu đã đủ 3 cấp dưới thì tính là một node hoàn chỉnh
  }

  let count = 0;

  for (const childId of tree.children) {
    const child = await Tree.findById(childId);
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
  const lastUserTier = await Tree.findOne({ tier }).sort({ createdAt: -1 });

  return lastUserTier.indexOnLevel;
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

export const countLayerOfAdmin = async () => {
  let newLayer = [];
  const u = await User.findById("6494e9101e2f152a593b66f2");
  for (let i = 1; i <= u.tier; i++) {
    const layer = await findRootLayer(u._id, i);
    newLayer.push(layer);
  }

  if (areArraysEqual(newLayer, u.currentLayer)) {
    u.oldLayer = u.currentLayer;
    await u.save();
  } else {
    u.oldLayer = u.currentLayer;
    u.currentLayer = newLayer;
    await u.save();
  }
};

export const createCallbackToken = (userId) => {
  const payload = {
    userId,
    purpose: "kyc",
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "10m", // thời gian hết hạn token
  });
};

export const decodeCallbackToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    return decoded; // { userId, purpose: "kyc", iat, exp }
  } catch (err) {
    throw new Error("Token expired, please try again");
  }
};

export const updateValueAtIndex = (arr, index, newValue) => {
  if (index >= 0 && index < arr.length) {
    arr[index] = newValue;
  } else {
    console.error("Index is out of bounds");
  }
};

export const getFaceTecData = async (externalDatabaseRefID) => {
  return axios
    .get(
      `${process.env.FACETEC_HOST}/api/sessionDetails?externalDatabaseRefID=${externalDatabaseRefID}&pageNumber=0&pageSize=10&path=/enrollment-3d`
    )
    .then(async (response) => {
      return response.data;
    })
    .catch((error) => {
      throw new Error("FaceTec error");
    });
};

export const countChildOfEachLevel = async (rootId) => {
  const result = { tier0: 1 }; // tầng 0 là node gốc

  // Hàm đệ quy thật sự
  const recurse = async (ids, tier) => {
    if (!ids.length) return;

    // Lấy các node tương ứng
    const nodes = await Tree.find({ _id: { $in: ids } })
      .select("children")
      .lean();

    // Gom các _id của children
    const childIds = [];
    const workingChildIds = [];
    for (const node of nodes) {
      if (node.children?.length > 0) {
        for (const childId of node.children) {
          const tree = await Tree.findById(childId);
          const child = await User.findById(tree.userId);
          if (child.errLahCode !== "OVER45") {
            workingChildIds.push(new mongoose.Types.ObjectId(childId));
          }
          childIds.push(new mongoose.Types.ObjectId(childId));
        }
      }
    }

    if (childIds.length > 0) {
      result[`level${tier}`] = workingChildIds.length;
      await recurse(childIds, tier + 1);
    }
  };

  await recurse([new mongoose.Types.ObjectId(rootId)], 1);

  return result;
};

export const totalChildOn2Branch = async (treeOfUserId) => {
  const treeOfUser = await Tree.findById(treeOfUserId);
  if (treeOfUser.children.length < 2) {
    throw new Error("Children not have 2 ID");
  }
  const child1 = await Tree.findById(treeOfUser.children[0]);
  const child2 = await Tree.findById(treeOfUser.children[1]);
  const countChild1 = child1.countChild;
  const countChild2 = child2.countChild;
  return {
    countChild1,
    countChild2,
  };
};

export const sumLevels = (obj, fromLevel = 5, toLevel = 9) => {
  let sum = 0;

  for (let i = fromLevel; i <= toLevel; i++) {
    const key = `level${i}`;
    sum += obj[key] || 0;
  }

  return sum;
};

export const checkUserCanNextTier = async (treeOfUser) => {
  const { countChild1, countChild2 } = await getTotalLevel6ToLevel10OfUser(treeOfUser);
  console.log({ countChild1, countChild2 });

  if (treeOfUser.countChild >= 127) {
    // if (treeOfUser.countChild >= 126) {
    if (countChild1 >= 32 && countChild2 >= 32) {
      // if (countChild1 >= 0 && countChild2 >= 0) {
      return true;
    } else {
      return false;
    }
  }
};

export const getTotalLevel6ToLevel10OfUser = async (treeOfUser) => {
  const countWithLevelChild1 = await countChildOfEachLevel(treeOfUser.children[0]);
  const countWithLevelChild2 = await countChildOfEachLevel(treeOfUser.children[1]);

  const countChild1 = sumLevels(countWithLevelChild1, 1, 9);
  const countChild2 = sumLevels(countWithLevelChild2, 1, 9);

  return { countChild1, countChild2 };
};
