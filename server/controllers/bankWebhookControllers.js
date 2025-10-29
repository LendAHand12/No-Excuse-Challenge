import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import { sendMailPaymentForAdmin } from "../utils/sendMailCustom.js";

/**
 * Webhook để nhận thông báo từ SePay về giao dịch thành công
 * @route POST /api/bank-webhook/notify
 * @access Public (vì SePay gọi từ bên ngoài)
 *
 * Format từ SePay:
 * {
 *   "id": 92704,                              // ID giao dịch trên SePay
 *   "gateway":"Vietcombank",                  // Brand name của ngân hàng
 *   "transactionDate":"2023-03-25 14:02:37", // Thời gian xảy ra giao dịch
 *   "accountNumber":"0123499999",              // Số tài khoản ngân hàng
 *   "code":null,                               // Mã code thanh toán
 *   "content":"chuyen tien mua iphone",        // Nội dung chuyển khoản (chứa orderId)
 *   "transferType":"in",                       // Loại giao dịch (in=tiền vào, out=tiền ra)
 *   "transferAmount":2277000,                  // Số tiền giao dịch
 *   "accumulated":19077000,                    // Số dư tài khoản
 *   "subAccount":null,                         // Tài khoản ngân hàng phụ
 *   "referenceCode":"MBVCB.3278907687",         // Mã tham chiếu của tin nhắn sms
 *   "description":""                           // Toàn bộ nội dung tin nhắn sms
 * }
 */
const bankWebhookNotify = asyncHandler(async (req, res) => {
  try {
    const {
      id, // ID giao dịch trên SePay
      gateway, // Brand name của ngân hàng
      transactionDate, // Thời gian xảy ra giao dịch
      accountNumber, // Số tài khoản ngân hàng
      code, // Mã code thanh toán
      content, // Nội dung chuyển khoản (chứa orderId)
      transferType, // Loại giao dịch (in/out)
      transferAmount, // Số tiền giao dịch
      accumulated, // Số dư tài khoản
      subAccount, // Tài khoản ngân hàng phụ
      referenceCode, // Mã tham chiếu
      description, // Mô tả
    } = req.body;

    console.log("SePay webhook received:", {
      id,
      gateway,
      transferAmount,
      transferType,
      content,
      accountNumber,
    });

    // Validate required fields
    if (!content || !transferAmount || transferType === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "content, transferAmount, and transferType are required",
      });
    }

    // Chỉ xử lý giao dịch tiền vào (in)
    if (transferType !== "in") {
      console.log("Ignoring outgoing transaction (transferType: out)");
      return res.status(200).json({
        success: true,
        message: "Outgoing transaction ignored",
      });
    }

    // Clean content: chỉ trim, KHÔNG uppercase ngay để giữ nguyên case của orderId
    const contentTrimmed = content.trim();

    // Helper function để escape regex special characters
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Helper function để tìm order với case-insensitive search
    const findOrderCaseInsensitive = async (searchId) => {
      // Escape special characters cho regex
      const escapedId = escapeRegex(searchId);

      // Dùng case-insensitive regex để tìm (luôn dùng regex để đảm bảo match dù case nào)
      const found = await Order.findOne({
        $or: [
          {
            orderId: {
              $regex: `^${escapedId}$`,
              $options: "i",
            },
          },
          {
            userId: {
              $regex: `^${escapedId}$`,
              $options: "i",
            },
          },
        ],
        status: { $ne: "SUCCESS" },
      });

      return found;
    };

    // Extract orderId từ content GỐC (chưa uppercase) để giữ nguyên case
    // Pattern: AMERITEC theo sau bởi 13 ký tự alphanumeric
    // Format: AMERITEC{5 ký tự user._id}{8 số timestamp} = 21 ký tự tổng cộng
    let orderId = null;
    const amritecMatch = contentTrimmed.match(/AMERITEC[\w\d]{13}/i); // Case-insensitive match
    if (amritecMatch) {
      orderId = amritecMatch[0]; // Giữ nguyên case gốc từ content
    } else {
      // Nếu không match pattern, thử dùng toàn bộ content nếu nó chỉ là orderId (không có text thêm)
      // Kiểm tra xem content có chứa khoảng trắng không
      if (!contentTrimmed.includes(" ")) {
        orderId = contentTrimmed;
      }
    }

    if (!orderId) {
      console.log("Could not extract orderId from content:", content);
      return res.status(400).json({
        error: "Invalid content format",
        message: "Could not extract orderId from content",
      });
    }

    console.log("Extracted orderId from content:", orderId);

    // Tìm order với case-insensitive search
    let order = await findOrderCaseInsensitive(orderId);

    // Nếu vẫn không tìm thấy, thử tìm bằng userId từ code (fallback)
    if (!order && code) {
      order = await Order.findOne({
        userId: code,
        status: { $ne: "SUCCESS" },
      });
      if (order) {
        orderId = code;
      }
    }

    console.log("Looking for order with orderId:", orderId);

    // Nếu vẫn không tìm thấy, tìm order PENDING gần nhất của accountNumber (nếu match)
    if (!order) {
      console.log("Order not found with orderId/userId:", orderId);
      return res.status(404).json({
        error: "Order not found",
        message: `Could not find order with identifier: ${orderId}`,
      });
    }

    // Kiểm tra replay - order đã được xử lý
    if (order.status === "SUCCESS") {
      console.log("Order already processed:", order.orderId);
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        orderId: order.orderId,
      });
    }

    // Validate amount - phải khớp với order (cho phép sai số nhỏ do làm tròn)
    const amountDiff = Math.abs(parseFloat(transferAmount) - parseFloat(order.amount));
    const tolerance = 1000; // Cho phép sai số 1000 VND

    if (amountDiff > tolerance) {
      console.error("❌ Amount mismatch:", {
        expected: order.amount,
        received: transferAmount,
        difference: amountDiff,
        orderId: order.orderId,
      });
      return res.status(400).json({
        error: "Amount mismatch",
        message: `Expected amount: ${order.amount}, received: ${transferAmount}`,
        expected: order.amount,
        received: transferAmount,
      });
    }

    // Lấy userId từ order
    const userId = order.userId;

    // Update order với thông tin từ SePay
    order.status = "SUCCESS";
    order.bankTransactionId = id?.toString() || null;
    order.bankName = gateway || null;
    order.accountNumber = accountNumber || null;
    order.bankCode = gateway || null; // gateway có thể là "Vietcombank", cần mapping nếu cần
    order.transferContent = content || null;
    order.description = description || content || null;

    // Parse transactionDate
    if (transactionDate) {
      order.processedAt = new Date(transactionDate);
    } else {
      order.processedAt = new Date();
    }

    // Lưu thông tin bổ sung vào metadata
    order.metadata = {
      ...(order.metadata || {}),
      sepayId: id,
      referenceCode: referenceCode || null,
      subAccount: subAccount || null,
      accumulated: accumulated || null,
      code: code || null,
    };

    await order.save();

    // Tìm user và update
    const user = await User.findById(userId);

    if (!user) {
      console.warn("User not found for order:", order.orderId, "userId:", userId);
      return res.status(200).json({
        success: true,
        message: "Order processed but user not found",
        orderId: order.orderId,
      });
    }

    // Update user's countPay based on order type
    if (order.type === "PAYMENT") {
      const previousCountPay = user.countPay || 0;
      user.countPay = previousCountPay + 1;

      // Gửi email thông báo cho admin
      try {
        await sendMailPaymentForAdmin({
          userId: user._id,
          userName: user.userId,
          amount: transferAmount,
          transactionId: id?.toString(),
          accountNumber: accountNumber,
          bankCode: gateway,
          orderId: order.orderId,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Không throw error, chỉ log
      }

      await user.save();
      console.log(`User ${user.userId} countPay updated: ${previousCountPay} -> ${user.countPay}`);
    }

    console.log("✅ Order processed successfully:", {
      orderId: order.orderId,
      userId: user.userId,
      amount: transferAmount,
      sepayId: id,
    });

    return res.status(200).json({
      success: true,
      message: "Order processed successfully",
      orderId: order.orderId,
      userId: user.userId,
      countPay: user.countPay,
    });
  } catch (error) {
    console.error("❌ SePay webhook error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * Webhook để verify connection với SePay
 * @route GET /api/bank-webhook/verify
 * @access Public
 */
const bankWebhookVerify = asyncHandler(async (req, res) => {
  // Trả về thông tin để verify webhook
  res.status(200).json({
    success: true,
    message: "Webhook endpoint is active",
    service: "SePay",
    timestamp: new Date().toISOString(),
    timezone: "Asia/Ho_Chi_Minh",
  });
});

export { bankWebhookNotify, bankWebhookVerify };
