import express from "express";
import {
  getPaymentInfo,
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
} from "../controllers/paymentControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/getParentWithCount").post(getParentWithCount);

router.route("/info").get(protectRoute, getPaymentInfo);
router.route("/user").get(protectRoute, isAdmin, getAllPayments);
router
  .route("/getAllTransForExport")
  .post(protectRoute, isAdmin, getAllTransForExport);
router
  .route("/")
  .get(protectRoute, getPaymentsOfUser)
  .post(protectRoute, addPayment);

router.route("/done").post(protectRoute, onDonePayment);

router.route("/:id").get(protectRoute, isAdmin, getPaymentDetail);
router
  .route("/checkCanRefund")
  .post(protectRoute, isAdmin, checkCanRefundPayment);

router.route("/changeToRefunded").post(protectRoute, isAdmin, changeToRefunded);
router
  .route("/onAdminDoneRefund")
  .post(protectRoute, isAdmin, onAdminDoneRefund);

export default router;
