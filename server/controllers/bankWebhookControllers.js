import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import { sendMailPaymentForAdmin } from "../utils/sendMailCustom.js";

/**
 * Webhook để nhận thông báo từ ngân hàng về giao dịch thành công
 * @route POST /api/bank-webhook/notify
 * @access Public (vì ngân hàng gọi từ bên ngoài)
 *
 * Logic: Parse transId từ transferContent để xác định user và tìm order tương ứng
 */
const bankWebhookNotify = asyncHandler(async (req, res) => {
  try {
    const {
      transactionId, // ID giao dịch của ngân hàng
      accountNumber, // Số tài khoản người gửi
      bankCode, // Mã ngân hàng
      amount, // Số tiền
      status, // Trạng thái (SUCCESS, FAILED, PENDING)
      createdAt, // Thời gian giao dịch
      description, // Mô tả giao dịch
      transferContent, // Nội dung chuyển khoản (chứa transId)
    } = req.body;

    console.log("Bank webhook received:", {
      transactionId,
      transferContent,
      amount,
      status,
    });

    if (!transferContent || !amount || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Parse transId từ nội dung chuyển khoản
    const transId = transferContent.trim();

    // Tìm order dựa trên transId (có thể là userId hoặc unique transaction code)
    const order = await Order.findOne({
      $or: [{ orderId: transId }, { userId: transId }],
    });

    if (!order) {
      console.log("Order not found with transId:", transId);
      return res.status(404).json({ error: "Order not found" });
    }

    // Kiểm tra replay - order đã được xử lý
    if (order.status === "SUCCESS") {
      console.log("Order already processed:", order.orderId);
      return res.status(200).json({ message: "Order already processed" });
    }

    // Validate amount - phải khớp với order
    if (parseInt(amount) !== parseInt(order.amount)) {
      console.error("❌ Amount mismatch:", {
        expected: order.amount,
        received: amount,
        orderId: order.orderId,
      });
      return res.status(400).json({
        error: "Amount mismatch",
        message: `Expected amount: ${order.amount}, received: ${amount}`,
      });
    }

    // Lấy userId từ order
    const userId = order.userId;

    // Chỉ xử lý nếu status là SUCCESS
    if (status === "SUCCESS") {
      // Update order status
      order.status = "SUCCESS";
      if (transactionId) order.bankTransactionId = transactionId;
      if (accountNumber) order.accountNumber = accountNumber;
      if (bankCode) order.bankCode = bankCode;
      if (description) order.description = description;
      if (transferContent) order.transferContent = transferContent;
      order.processedAt = new Date();
      await order.save();

      // Tìm user
      const user = await User.findById(userId);

      if (user) {
        // Update user's countPay based on order type
        if (order.type === "PAYMENT") {
          user.countPay = (user.countPay || 0) + 1;

          // Gửi email thông báo cho admin
          await sendMailPaymentForAdmin({
            userId: user._id,
            userName: user.userId,
            amount: amount,
            transactionId: transactionId,
            accountNumber: accountNumber,
            bankCode: bankCode,
          });

          await user.save();
        }
      }

      console.log("Order processed successfully:", order.orderId);
      return res.status(200).json({
        success: true,
        message: "Order processed successfully",
      });
    } else if (status === "FAILED") {
      // Update order status to FAILED
      order.status = "FAILED";
      if (description) order.description = description;
      if (transferContent) order.transferContent = transferContent;
      order.processedAt = new Date();
      await order.save();

      console.log("Order failed:", order.orderId);
      return res.status(200).json({
        success: true,
        message: "Order marked as failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Bank webhook error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Webhook để verify connection với ngân hàng
 * @route GET /api/bank-webhook/verify
 * @access Public
 */
const bankWebhookVerify = asyncHandler(async (req, res) => {
  // Trả về thông tin để verify webhook
  res.status(200).json({
    success: true,
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
});

export { bankWebhookNotify, bankWebhookVerify };
