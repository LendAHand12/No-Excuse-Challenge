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
  adminChangeWalletUser,
  getListChildNotEnoughBranchOfUser,
  getListUserForCreateAdmin,
  getAllUsersTier2,
  getSubUserProfile,
  getListChildOfSubUser,
  getAllUsersOver45,
  getAllUsersPreTier2,
} from "../controllers/userControllers.js";
import { protectRoute, isAdmin, isSuperAdmin } from "../middleware/authMiddleware.js";
import uploadCCCD from "../middleware/uploadCCCD.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllUsers);
router.route("/over45").get(protectRoute, isAdmin, getAllUsersOver45);
router.route("/info").get(protectRoute, getUserInfo);
router.route("/getAllDeletedUsers").get(protectRoute, isAdmin, getAllDeletedUsers);
router.route("/getAllUsersPreTier2").get(protectRoute, isAdmin, getAllUsersPreTier2);
router.route("/profile").get(protectRoute, getUserProfile);
router
  .route("/changeWallet")
  .get(protectRoute, mailForChangeWallet)
  .post(protectRoute, changeWallet);
router.route("/status").put(protectRoute, isAdmin, changeStatusUser);
router.route("/tree").get(protectRoute, getTree);
router.route("/tree/:id").get(protectRoute, isAdmin, getTreeOfUser);
router.route("/treeNode").post(protectRoute, getChildsOfUserForTree);
router.route("/changeSystem").post(protectRoute, isAdmin, changeSystem);
router.route("/getAllUsersForExport").post(protectRoute, isAdmin, getAllUsersForExport);

router.route("/getAllUsersWithKeyword").post(protectRoute, isAdmin, getAllUsersWithKeyword);
router.route("/listChild").get(protectRoute, getListChildOfUser);
router.route("/listChildSubUser").get(protectRoute, getListChildOfSubUser);
router.route("/listChildLteBranch").get(protectRoute, getListChildNotEnoughBranchOfUser);
router.route("/listChildForCreateAdmin").get(protectRoute, isAdmin, getListUserForCreateAdmin);
router.route("/change-wallet").put(protectRoute, isAdmin, adminChangeWalletUser);

router
  .route("/admin")
  .get(protectRoute, isSuperAdmin, getListAdmin)
  .post(protectRoute, isSuperAdmin, createAdmin);

router
  .route("/admin/:id")
  .get(protectRoute, isSuperAdmin, getAdminById)
  .put(protectRoute, isSuperAdmin, updateAdmin)
  .delete(protectRoute, isSuperAdmin, deleteAdmin);

router.route("/tiers/2").get(protectRoute, getAllUsersTier2);

router
  .route("/:id")
  .delete(protectRoute, isAdmin, adminDeleteUser)
  .get(protectRoute, isAdmin, getUserById)
  .put(
    protectRoute,
    uploadCCCD.fields([
      { name: "imgFront", maxCount: 1 },
      { name: "imgBack", maxCount: 1 },
    ]),
    updateUser
  );

router.route("/update/:id").post(
  protectRoute,
  isAdmin,
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
  protectRoute,
  isAdmin,
  adminCreateUser
);

router.route("/listNextUserTier").post(protectRoute, isAdmin, getListNextUserWithTier);

router.route("/getUsersWithTier").post(protectRoute, isAdmin, getUsersWithTier);

router.route("/changeNextUserTier").post(protectRoute, isAdmin, changeNextUserTier);

router.route("/getLastUserInTier").post(protectRoute, isAdmin, getLastUserInTier);

router.route("/removeLastUserInTier").post(protectRoute, isAdmin, removeLastUserInTier);

router.route("/sub-info").post(protectRoute, getSubUserProfile);

export default router;
