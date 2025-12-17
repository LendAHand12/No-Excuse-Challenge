import express from "express";
import {
  getPaymentInfo,
  createBankOrder,
  checkOrderStatus,
  addPayment,
  getAllPayments,
  getPaymentsOfUser,
  getPaymentDetail,
  checkCanRefundPayment,
  changeToRefunded,
  onAdminDoneRefund,
  getParentWithCount,
  getAllTransForExport,
  onDonePayment,
  getPaymentNextTierInfo,
  onDoneNextTierPayment,
  payWithCash,
  onDonePaymentWithCash,
  searchPendingOrder,
  approveBankPayment,
} from "../controllers/paymentControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/getParentWithCount").post(getParentWithCount);

router.route("/info").get(protectRoute, getPaymentInfo);
router.route("/createBankOrder").post(protectRoute, createBankOrder);
router.route("/checkOrder/:orderId").get(protectRoute, checkOrderStatus);
router.route("/infoNextTier").get(protectRoute, getPaymentNextTierInfo);
router.route("/user").get(protectAdminRoute, getAllPayments);
router.route("/getAllTransForExport").post(protectAdminRoute, getAllTransForExport);
router.route("/").get(protectRoute, getPaymentsOfUser).post(protectRoute, addPayment);

router.route("/done").post(protectRoute, onDonePayment);
router.route("/doneNextTier").post(protectRoute, onDoneNextTierPayment);

router.route("/:id").get(protectAdminRoute, getPaymentDetail);
router.route("/checkCanRefund").post(protectAdminRoute, checkCanRefundPayment);

router.route("/changeToRefunded").post(protectAdminRoute, changeToRefunded);
router.route("/onAdminDoneRefund").post(protectAdminRoute, onAdminDoneRefund);
router.route("/payWithCash").post(protectRoute, payWithCash);
router.route("/donePayWithCash").post(protectAdminRoute, onDonePaymentWithCash);

// Admin routes for payment verification
router.route("/admin/search-pending").get(protectAdminRoute, searchPendingOrder);
router.route("/admin/approve-bank-payment").post(protectAdminRoute, approveBankPayment);

export default router;
