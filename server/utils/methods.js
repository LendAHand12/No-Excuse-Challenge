import moment from "moment-timezone";
import NextUserTier from "../models/nextUserTierModel.js";
import Tree from "../models/treeModel.js";
import User from "../models/userModel.js";
import axios from "axios";
import ADMIN_ID from "../constants/AdminId.js";
import { areArraysEqual } from "../cronJob/index.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import PreTier2 from "../models/preTier2Model.js";

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

export const createCallbackToken = (userId, purpose = "kyc") => {
  const payload = {
    userId,
    purpose,
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

export const countChildOfEachLevel = async (rootId, includesDieId = false) => {
  const result = { tier0: 1 }; // tầng 0 là node gốc

  const recurse = async (ids, tier) => {
    if (!ids.length) return;

    const nodes = await Tree.find({ _id: { $in: ids } })
      .select("children userId")
      .lean();

    const allChildIds = nodes.flatMap((node) => node.children || []);

    if (!allChildIds.length) {
      // nếu không có children thì dừng, KHÔNG cộng thêm level nữa
      return;
    }

    let nextLevelChildIds = [];

    if (includesDieId) {
      // Đếm tất cả children ở level (tier + 1)
      result[`level${tier + 1}`] = (result[`level${tier + 1}`] || 0) + allChildIds.length;
      nextLevelChildIds = allChildIds.map((id) => new mongoose.Types.ObjectId(id));
    } else {
      // Chỉ đếm user hợp lệ
      const trees = await Tree.find({ _id: { $in: allChildIds } })
        .select("userId")
        .lean();

      const userIds = trees.map((t) => t.userId);
      const users = await User.find({ _id: { $in: userIds } })
        .select("errLahCode countPay")
        .lean();
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));

      const workingChildIds = [];

      for (const tree of trees) {
        const user = userMap.get(tree.userId.toString());
        if (!user) continue;
        if (user.errLahCode !== "OVER45" && user.countPay === 13) {
          workingChildIds.push(tree._id);
        }
      }

      // ✅ Đếm vào level (tier + 1)
      result[`level${tier + 1}`] = (result[`level${tier + 1}`] || 0) + workingChildIds.length;

      nextLevelChildIds = allChildIds.map((id) => new mongoose.Types.ObjectId(id));
    }

    if (nextLevelChildIds.length > 0) {
      await recurse(nextLevelChildIds, tier + 1);
    }
  };

  await recurse([new mongoose.Types.ObjectId(rootId)], 0); // bắt đầu từ tier 0

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
  const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(treeOfUser, true);
  console.log({ countChild: treeOfUser.countChild, countChild1, countChild2 });

  if (treeOfUser.countChild >= 62) {
    return true;
  } else {
    return false;
  }
};

export const getTotalLevel6ToLevel10OfUser = async (treeOfUser) => {
  const countWithLevelChild1 = await countChildOfEachLevel(treeOfUser.children[0]);
  const countWithLevelChild2 = await countChildOfEachLevel(treeOfUser.children[1]);

  // console.log({ countWithLevelChild1, countWithLevelChild2 });

  const countChild1 = sumLevels(countWithLevelChild1, 3, 9);
  const countChild2 = sumLevels(countWithLevelChild2, 3, 9);

  // console.log({countChild1, countChild2})

  return { countChild1, countChild2 };
};

export const getTotalLevel1ToLevel10OfUser = async (treeOfUser, includesDieId) => {
  const countWithLevelChild1 = await countChildOfEachLevel(treeOfUser.children[0], includesDieId);
  const countWithLevelChild2 = await countChildOfEachLevel(treeOfUser.children[1], includesDieId);

  // console.log({ countWithLevelChild1, countWithLevelChild2 });

  const countChild1 = sumLevels(countWithLevelChild1, 0, 9);
  const countChild2 = sumLevels(countWithLevelChild2, 0, 9);

  // console.log({countChild1, countChild2})

  return { countChild1, countChild2 };
};

// Lấy root branch con trực tiếp của refId (B hoặc C)
// Logic: Tìm direct child (refId = rootId) đầu tiên trong cây con của nodeId
// Nếu nodeId chính là direct child → trả về nodeId
// Nếu nodeId không phải direct child → đi ngược lên tìm direct child đầu tiên
const getBranchRoot = (nodeId, rootId, parentMap) => {
  // Kiểm tra xem nodeId có phải là direct child của rootId không
  // (tức là parentId của nodeId = rootId)
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

export const hasTwoBranches = async (refId) => {
  const refTree = await Tree.findById(refId).lean();
  if (!refTree) {
    return { valid: false, error: "Ref not found" };
  }

  // ✅ Thêm điều kiện bắt buộc: node phải có đúng 2 con (children)
  if (!refTree.children || refTree.children.length < 2) {
    return false; // chưa đủ 2 con nên không thể có 2 nhánh
  }

  // Lấy tất cả F1 (những người do refId giới thiệu)
  const f1s = await Tree.find({ refId }).lean();
  if (f1s.length < 2) {
    return false; // chưa đủ 2 F1
  }

  // Lấy parentId cho toàn bộ cây con (chỉ cần _id và parentId)
  const allNodes = await Tree.find({}).select("_id parentId").lean();
  const parentMap = {};
  for (let n of allNodes) {
    parentMap[n._id.toString()] = n.parentId ? n.parentId.toString() : null;
  }

  // Tìm branch root của mỗi F1
  const branches = new Set();
  for (let f1 of f1s) {
    const branchRoot = getBranchRoot(f1._id.toString(), refId.toString(), parentMap);
    if (branchRoot) branches.add(branchRoot);
    if (branches.size >= 2) return true; // tối ưu: có đủ 2 nhánh thì dừng luôn
  }

  return false;
};

export const getAllDescendantsTier2Users = async (userId) => {
  // tìm node gốc trong Tree
  const rootTree = await Tree.findOne({ userId }).lean();
  if (!rootTree) {
    throw new Error("Root user not found in Tree");
  }

  // nếu không có children thì trả về rỗng
  if (!rootTree.children || rootTree.children.length === 0) {
    return { branch1: [], branch2: [] };
  }

  // lấy ra tối đa 2 nhánh
  const [branch1Root, branch2Root] = rootTree.children;

  // hàm lấy tất cả tier2 userId trong 1 nhánh
  const collectTier2FromBranch = async (rootId) => {
    const resultSet = new Set();
    const visited = new Set(); // Thêm Set để track visited nodes
    let queue = [rootId];

    while (queue.length > 0) {
      const batchIds = queue.splice(0, queue.length);

      const childTrees = await Tree.find({
        _id: { $in: batchIds.map((id) => new mongoose.Types.ObjectId(id)) },
      }).lean();

      for (const t of childTrees) {
        const nodeId = t._id.toString();

        // Kiểm tra nếu node đã được visit thì bỏ qua để tránh cycle
        if (visited.has(nodeId)) {
          continue;
        }
        visited.add(nodeId);

        // luôn gom children vào queue để duyệt tiếp (chỉ thêm những node chưa visit)
        if (t.children && t.children.length > 0) {
          for (const childId of t.children) {
            const childIdStr = childId.toString();
            if (!visited.has(childIdStr)) {
              queue.push(childId);
            }
          }
        }

        // nếu node là subId thì bỏ qua, không lấy user tier2
        if (t.isSubId) continue;

        // tìm user tier = 2, chỉ lấy userId
        const u = await User.findOne({ _id: t.userId, tier: 2 }).select("userId").lean();
        if (u) resultSet.add(u.userId);
      }
    }

    return Array.from(resultSet);
  };

  let branch1UserIds = [];
  let branch2UserIds = [];

  if (branch1Root) branch1UserIds = await collectTier2FromBranch(branch1Root);
  if (branch2Root) branch2UserIds = await collectTier2FromBranch(branch2Root);

  // loại trùng userId giữa 2 nhánh (ưu tiên giữ ở branch1)
  const branch1Set = new Set(branch1UserIds);
  branch2UserIds = branch2UserIds.filter((id) => !branch1Set.has(id));

  return { branch1: Array.from(branch1Set), branch2: branch2UserIds };
};

export const isLowestAchievedUser = async (userId) => {
  // Tìm document ACHIEVED có order thấp nhất
  const lowestAchieved = await PreTier2.findOne({ status: "ACHIEVED" })
    .sort({ order: 1 }) // sắp xếp tăng dần order
    .lean();

  if (!lowestAchieved) return false; // chưa có ai ACHIEVED

  // So sánh userId
  return lowestAchieved.userId.toString() === userId.toString();
};

export const addDays = (dateA, daysToAdd) => {
  return moment(dateA).add(daysToAdd, "days");
};

/**
 * Đếm số id sống trong một nhánh (dựa trên tree.dieTime)
 * Id sống: tree.dieTime === null hoặc tree.dieTime > today
 * @param {String} branchRootId - ID của tree root của nhánh
 * @returns {Number} - Số lượng id sống trong nhánh (từ level 0 đến level 9)
 */
export const countAliveIdsInBranch = async (branchRootId) => {
  if (!branchRootId) return 0;

  let count = 0;
  let queue = [branchRootId];
  const visited = new Set();
  // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
  const today = moment.tz("Asia/Ho_Chi_Minh").startOf("day");

  while (queue.length > 0) {
    const batchIds = queue.splice(0, queue.length);
    const trees = await Tree.find({
      _id: { $in: batchIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .select("children dieTime")
      .lean();

    for (const tree of trees) {
      if (visited.has(tree._id.toString())) continue;
      visited.add(tree._id.toString());

      // Thêm children vào queue để duyệt tiếp
      if (tree.children && tree.children.length > 0) {
        queue.push(...tree.children);
      }

      // Kiểm tra tree này có sống không
      // Tree sống: dieTime === null hoặc dieTime > today
      // Convert dieTime sang giờ Việt Nam và set về 00:00:00
      const isAlive =
        !tree.dieTime || moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day").isAfter(today);

      if (isAlive) {
        count++;
      }
    }
  }

  return count;
};

/**
 * Tính dieTime cho tree tier 1
 * Logic: 30 ngày từ ngày chết của con (chết sau nhất) để có ít nhất 2 tree con sống (refId = tree._id)
 * Nếu không có con nào chết, deadline = createdAt + 30 ngày
 * @param {Object} tree - Tree object (tier = 1)
 * @returns {Date|null} - dieTime hoặc null nếu đã đủ điều kiện
 */
export const calculateDieTimeForTier1 = async (tree) => {
  if (tree.tier !== 1) {
    throw new Error("Tree must be tier 1");
  }

  // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
  const todayMoment = moment.tz("Asia/Ho_Chi_Minh").startOf("day");
  const todayStart = todayMoment.toDate();

  // Tìm tất cả tree con (refId = tree._id, isSubId = false)
  const children = await Tree.find({
    refId: tree._id.toString(),
    isSubId: false,
  }).lean();

  // Logic mới:
  // - Nếu có từ 2 refId trở lên (không quan tâm sống hay chết) → dieTime = null
  // - Nếu có 1 refId:
  //   - Nếu refId này chết → dieTime = ngày chết của refId + 30 ngày
  //   - Nếu refId này còn sống → dieTime = createdAt + 30 ngày
  // - Nếu có 0 refId → dieTime = createdAt + 30 ngày

  if (children.length >= 2) {
    // Nếu có từ 2 refId trở lên → dieTime = null (không quan tâm sống hay chết)
    return null;
  }

  if (children.length === 1) {
    // Nếu có 1 refId
    const child = children[0];
    if (child.dieTime) {
      const childDieTimeMoment = moment.tz(child.dieTime, "Asia/Ho_Chi_Minh").startOf("day");
      const childDieTimeStart = childDieTimeMoment.toDate();

      // Kiểm tra xem refId này có chết không (dieTime <= today)
      if (childDieTimeStart <= todayStart) {
        // Nếu refId này chết → dieTime = ngày chết của refId + 30 ngày
        const deadlineMoment = moment
          .tz(childDieTimeStart, "Asia/Ho_Chi_Minh")
          .add(30, "days")
          .startOf("day");
        return deadlineMoment.toDate();
      }
    }
    // Nếu refId này còn sống → dieTime = createdAt + 30 ngày
    const deadlineMoment = moment
      .tz(tree.createdAt, "Asia/Ho_Chi_Minh")
      .add(30, "days")
      .startOf("day");
    return deadlineMoment.toDate();
  }

  // Nếu có 0 refId → dieTime = createdAt + 30 ngày
  const deadlineMoment = moment
    .tz(tree.createdAt, "Asia/Ho_Chi_Minh")
    .add(30, "days")
    .startOf("day");
  return deadlineMoment.toDate();
};

/**
 * Tính dieTime cho tree tier 2
 * Logic: Nếu không đủ 62 id sống ở tier 1 thì có deadline tới ngày 30/11/2025
 * Nếu đủ 62 id sống (tổng >= 62, mỗi nhánh >= 20) thì dieTime = null
 * Lưu ý: Tính 62 id sống trong cây tier 1 của cùng user, không phải cây tier 2
 * @param {Object} tree - Tree object (tier = 2)
 * @returns {Date|null} - dieTime hoặc null nếu đã đủ điều kiện
 */
export const calculateDieTimeForTier2 = async (tree) => {
  if (tree.tier !== 2) {
    throw new Error("Tree must be tier 2");
  }

  // Tìm tree tier 1 của cùng user (isSubId = false)
  const treeTier1 = await Tree.findOne({
    userId: tree.userId,
    tier: 1,
    isSubId: false,
  });

  // Deadline cố định: 30/11/2025 00:00:00 (theo giờ Việt Nam)
  const fixedDeadline = moment.tz("2025-11-30", "Asia/Ho_Chi_Minh").startOf("day");

  if (!treeTier1) {
    // Nếu không tìm thấy tree tier 1, trả về deadline cố định 30/11/2025
    return fixedDeadline.toDate();
  }

  // Đếm id sống trong 2 nhánh của tree tier 1
  const branch1Count = await countAliveIdsInBranch(treeTier1.children[0]);
  const branch2Count = await countAliveIdsInBranch(treeTier1.children[1]);
  console.log({ name: tree.userName, branch1Count, branch2Count });
  const totalCount = branch1Count + branch2Count;

  // Kiểm tra điều kiện
  const hasEnough = totalCount >= 62 && branch1Count >= 20 && branch2Count >= 20;

  if (hasEnough) {
    // Đã đủ điều kiện -> dieTime = null
    return null;
  } else {
    // Chưa đủ -> dieTime = 30/11/2025 (theo giờ Việt Nam, 00:00:00)
    return fixedDeadline.toDate();
  }
};

/**
 * Kiểm tra xem user có quá hạn (dieTime) hay chưa dựa trên Tree
 * @param {string|Object} treeId - ID của tree cần kiểm tra
 * @returns {boolean} - true nếu user đã quá hạn, false nếu chưa quá hạn hoặc không có dieTime
 */
export const isUserExpired = async (treeId) => {
  const tree = await Tree.findById(treeId);

  // Nếu không tìm thấy tree, coi như chưa hết hạn
  if (!tree) {
    return false;
  }

  // User chỉ hết hạn khi dieTime !== null và dieTime đã quá hạn ngày hiện tại
  if (tree.dieTime === null || tree.dieTime === undefined) {
    return false;
  }

  const todayStart = moment.tz("Asia/Ho_Chi_Minh").startOf("day");
  const dieTimeStart = moment.tz(tree.dieTime, "Asia/Ho_Chi_Minh").startOf("day");

  // Nếu dieTime đã quá hạn (today >= dieTime) thì trả về true
  return todayStart.isSameOrAfter(dieTimeStart);
};
