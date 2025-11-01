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

const router = express.Router();

router.route("/getParentWithCount").post(getParentWithCount);

router.route("/info").get(protectRoute, getPaymentInfo);
router.route("/createBankOrder").post(protectRoute, createBankOrder);
router.route("/checkOrder/:orderId").get(protectRoute, checkOrderStatus);
router.route("/infoNextTier").get(protectRoute, getPaymentNextTierInfo);
router.route("/user").get(protectRoute, isAdmin, getAllPayments);
router.route("/getAllTransForExport").post(protectRoute, isAdmin, getAllTransForExport);
router.route("/").get(protectRoute, getPaymentsOfUser).post(protectRoute, addPayment);

router.route("/done").post(protectRoute, onDonePayment);
router.route("/doneNextTier").post(protectRoute, onDoneNextTierPayment);

router.route("/:id").get(protectRoute, isAdmin, getPaymentDetail);
router.route("/checkCanRefund").post(protectRoute, isAdmin, checkCanRefundPayment);

router.route("/changeToRefunded").post(protectRoute, isAdmin, changeToRefunded);
router.route("/onAdminDoneRefund").post(protectRoute, isAdmin, onAdminDoneRefund);
router.route("/payWithCash").post(protectRoute, payWithCash);
router.route("/donePayWithCash").post(protectRoute, isAdmin, onDonePaymentWithCash);

// Admin routes for payment verification
router.route("/admin/search-pending").get(protectRoute, isAdmin, searchPendingOrder);
router.route("/admin/approve-bank-payment").post(protectRoute, isAdmin, approveBankPayment);

export default router;
