import Transaction from "./models/transactionModel.js";
import Tree from "./models/treeModel.js";
import User from "./models/userModel.js";
import { getParentWithCountPay } from "./utils/getParentWithCountPay.js";
import {
  findNextUser,
  findLevelById,
  findUsersAtLevel,
  findNextUserByIndex,
} from "./utils/methods.js";

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

  console.log({ result });
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
  const listUser = await User.find({ isAdmin: false, status: { $ne: "DELETED" } });

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
