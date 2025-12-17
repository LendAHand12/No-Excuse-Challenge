import express from "express";
import {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  changeStatusUser,
  getTree,
  getListChildOfUser,
  getTreeOfUser,
  getChildsOfUserForTree,
  getAllUsersWithKeyword,
  changeSystem,
  getChildrenList,
  getAllDeletedUsers,
  getAllUsersForExport,
  mailForChangeWallet,
  changeWallet,
  adminUpdateUser,
  adminDeleteUser,
  onAcceptIncreaseTier,
  adminCreateUser,
  getListNextUserWithTier,
  getUsersWithTier,
  changeNextUserTier,
  getLastUserInTier,
  removeLastUserInTier,
  createAdmin,
  getListAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminById,
  getUserInfo,
  getUserAssets,
  adminChangeWalletUser,
  getListChildNotEnoughBranchOfUser,
  getListUserForCreateAdmin,
  getAllUsersTier2,
  getSubUserProfile,
  getListChildOfSubUser,
  getAllUsersOver45,
  getAllUsersPreTier2,
  getTreesByUserName,
  checkUserAbnormalIncome,
} from "../controllers/userControllers.js";
import { protectRoute, isAdmin, isSuperAdmin } from "../middleware/authMiddleware.js";
import { protectAdminRoute, isRootAdmin } from "../controllers/adminControllers.js";
import uploadCCCD from "../middleware/uploadCCCD.js";

const router = express.Router();

router.route("/").get(protectAdminRoute, getAllUsers);
router.route("/over45").get(protectAdminRoute, getAllUsersOver45);
router.route("/trees").get(getTreesByUserName);
router.route("/info").get(protectRoute, getUserInfo);
router.route("/assets").get(protectRoute, getUserAssets);
router.route("/getAllDeletedUsers").get(protectAdminRoute, getAllDeletedUsers);
router.route("/getAllUsersPreTier2").get(protectAdminRoute, getAllUsersPreTier2);
router.route("/profile").get(protectRoute, getUserProfile);
router
  .route("/changeWallet")
  .get(protectRoute, mailForChangeWallet)
  .post(protectRoute, changeWallet);
router.route("/status").put(protectAdminRoute, changeStatusUser);
router.route("/tree").get(protectRoute, getTree);
router.route("/tree/:id").get(protectAdminRoute, getTreeOfUser);
router.route("/treeNode").post(protectRoute, getChildsOfUserForTree);
router.route("/changeSystem").post(protectAdminRoute, changeSystem);
router.route("/getAllUsersForExport").post(protectAdminRoute, getAllUsersForExport);

router.route("/getAllUsersWithKeyword").post(protectAdminRoute, getAllUsersWithKeyword);
router.route("/listChild").get(protectRoute, getListChildOfUser);
router.route("/listChildSubUser").get(protectRoute, getListChildOfSubUser);
router.route("/listChildLteBranch").get(protectRoute, getListChildNotEnoughBranchOfUser);
router.route("/listChildForCreateAdmin").get(protectAdminRoute, getListUserForCreateAdmin);
router.route("/change-wallet").put(protectAdminRoute, adminChangeWalletUser);

router
  .route("/admin")
  .get(protectAdminRoute, isRootAdmin, getListAdmin)
  .post(protectAdminRoute, isRootAdmin, createAdmin);

router
  .route("/admin/:id")
  .get(protectAdminRoute, isRootAdmin, getAdminById)
  .put(protectAdminRoute, isRootAdmin, updateAdmin)
  .delete(protectAdminRoute, isRootAdmin, deleteAdmin);

router.route("/tiers/2").get(protectRoute, getAllUsersTier2);

router
  .route("/:id")
  .delete(protectAdminRoute, adminDeleteUser)
  .get(protectAdminRoute, getUserById)
  .put(
    protectRoute,
    uploadCCCD.fields([
      { name: "imgFront", maxCount: 1 },
      { name: "imgBack", maxCount: 1 },
    ]),
    updateUser
  );

router.route("/update/:id").post(
  protectAdminRoute,
  uploadCCCD.fields([
    { name: "imgFront", maxCount: 1 },
    { name: "imgBack", maxCount: 1 },
  ]),
  adminUpdateUser
);

router.route("/tier/increase").post(protectRoute, onAcceptIncreaseTier);

router.route("/create").post(
  uploadCCCD.fields([
    { name: "imgFront", maxCount: 1 },
    { name: "imgBack", maxCount: 1 },
  ]),
  protectAdminRoute,
  adminCreateUser
);

router.route("/listNextUserTier").post(protectAdminRoute, getListNextUserWithTier);

router.route("/getUsersWithTier").post(protectAdminRoute, getUsersWithTier);

router.route("/changeNextUserTier").post(protectAdminRoute, changeNextUserTier);

router.route("/getLastUserInTier").post(protectAdminRoute, getLastUserInTier);

router.route("/removeLastUserInTier").post(protectAdminRoute, removeLastUserInTier);

router.route("/sub-info").post(protectRoute, getSubUserProfile);

router.route("/:id/check-abnormal-income").get(protectAdminRoute, checkUserAbnormalIncome);

export default router;
