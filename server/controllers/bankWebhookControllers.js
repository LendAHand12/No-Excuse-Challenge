import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import ContentParseLog from "../models/contentParseLogModel.js";
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
      // Trả về success: true ngay cả khi thiếu field (SePay yêu cầu)
      // Nhưng log để debug
      console.warn("Missing required fields in webhook:", {
        content: !!content,
        transferAmount: !!transferAmount,
        transferType: transferType !== undefined,
      });
      return res.status(201).json({
        success: true,
        message: "Webhook received (missing fields ignored)",
      });
    }

    // Chỉ xử lý giao dịch tiền vào (in)
    if (transferType !== "in") {
      console.log("Ignoring outgoing transaction (transferType: out)");
      return res.status(201).json({
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
    // Pattern mới: NEC theo sau bởi timestamp (số)
    // Format: NEC{timestamp} (ví dụ: NEC1703123456789)
    // Cũng hỗ trợ format cũ AMERITEC cho tương thích ngược
    let orderId = null;
    let matchedPattern = "NONE";

    // Tìm pattern mới: NEC + số (timestamp) + số random - format: NEC{13 chữ số timestamp}{3 chữ số random}
    // Format mới: NEC{13 số}{3 số} = 19 ký tự tổng cộng
    // Cũng hỗ trợ format cũ (16 ký tự) cho tương thích: NEC{13 số}
    const necMatchNew = contentTrimmed.match(/NEC\d{16}/i); // Format mới: 19 ký tự (NEC + 16 số)
    const necMatchOld = contentTrimmed.match(/NEC\d{13}/i); // Format cũ: 16 ký tự (NEC + 13 số) - tương thích ngược
    const necMatch = necMatchNew || necMatchOld;
    if (necMatch) {
      orderId = necMatch[0]; // Giữ nguyên case gốc từ content
      matchedPattern = necMatchNew ? "NEC_NEW" : "NEC_OLD";
    } else {
      // Fallback: Tìm pattern cũ AMERITEC (tương thích ngược với order cũ)
      const amritecMatch = contentTrimmed.match(/AMERITEC[\w\d]{13}/i);
      if (amritecMatch) {
        orderId = amritecMatch[0];
        matchedPattern = "AMERITEC";
      } else {
        // Nếu không match pattern nào, thử dùng toàn bộ content nếu nó chỉ là orderId (không có text thêm)
        // Kiểm tra xem content có chứa khoảng trắng không
        if (!contentTrimmed.includes(" ")) {
          orderId = contentTrimmed;
          matchedPattern = "FULL_CONTENT";
        }
      }
    }

    // Lưu log parse content
    const parseLogData = {
      originalContent: content,
      contentTrimmed: contentTrimmed,
      parsedOrderId: orderId,
      parseStatus: orderId ? "success" : "no_match",
      matchedPattern: matchedPattern,
      orderFound: false,
      webhookData: {
        sepayId: id,
        gateway,
        transactionDate,
        accountNumber,
        code,
        transferType,
        transferAmount,
        accumulated,
        subAccount,
        referenceCode,
        description,
      },
      processingResult: null,
    };

    if (!orderId) {
      console.log("Could not extract orderId from content:", content);

      // Lưu log với parseStatus = "no_match"
      await ContentParseLog.create({
        ...parseLogData,
        parseStatus: "no_match",
        processingResult: "no_order_id",
        responseSent: {
          success: true,
          message: "Webhook received (could not extract orderId)",
        },
      });

      // Trả về success: true để SePay không retry
      // Nhưng log để theo dõi
      return res.status(201).json({
        success: true,
        message: "Webhook received (could not extract orderId)",
        content: content,
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

    // Cập nhật log với thông tin order tìm thấy
    parseLogData.orderFound = !!order;
    if (order) {
      parseLogData.foundOrderId = order.orderId;
      parseLogData.foundOrderStatus = order.status;
    }

    // Nếu vẫn không tìm thấy, tìm order PENDING gần nhất của accountNumber (nếu match)
    if (!order) {
      console.log("Order not found with orderId/userId:", orderId);

      // Lưu log với orderFound = false
      await ContentParseLog.create({
        ...parseLogData,
        processingResult: "order_not_found",
        responseSent: {
          success: true,
          message: "Webhook received (order not found)",
          orderId: orderId,
        },
      });

      // Trả về success: true để SePay không retry
      return res.status(201).json({
        success: true,
        message: "Webhook received (order not found)",
        orderId: orderId,
      });
    }

    // Kiểm tra replay - order đã được xử lý
    if (order.status === "SUCCESS") {
      console.log("Order already processed:", order.orderId);

      // Lưu log với processingResult = "order_already_processed"
      await ContentParseLog.create({
        ...parseLogData,
        processingResult: "order_already_processed",
        responseSent: {
          success: true,
          message: "Order already processed",
          orderId: order.orderId,
        },
      });

      return res.status(201).json({
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

      // Lưu log với processingResult = "amount_mismatch"
      await ContentParseLog.create({
        ...parseLogData,
        processingResult: "amount_mismatch",
        errorMessage: `Amount mismatch: expected ${order.amount}, received ${transferAmount}, difference: ${amountDiff}`,
        responseSent: {
          success: true,
          message: "Webhook received (amount mismatch logged)",
          orderId: order.orderId,
          expected: order.amount,
          received: transferAmount,
        },
      });

      // Trả về success: true nhưng log lỗi để theo dõi
      // SePay sẽ không retry, nhưng admin có thể xử lý thủ công
      return res.status(201).json({
        success: true,
        message: "Webhook received (amount mismatch logged)",
        orderId: order.orderId,
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

      // Lưu log với processingResult = "user_not_found"
      await ContentParseLog.create({
        ...parseLogData,
        processingResult: "user_not_found",
        errorMessage: `User not found for order: ${order.orderId}, userId: ${userId}`,
        responseSent: {
          success: true,
          message: "Order processed but user not found",
          orderId: order.orderId,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Order processed but user not found",
        orderId: order.orderId,
      });
    }

    // Update user's countPay based on order type
    // if (order.type === "PAYMENT") {
    //   // Gửi email thông báo cho admin
    //   try {
    //     await sendMailPaymentForAdmin({
    //       userId: user._id,
    //       userName: user.userId,
    //       amount: transferAmount,
    //       transactionId: id?.toString(),
    //       accountNumber: accountNumber,
    //       bankCode: gateway,
    //       orderId: order.orderId,
    //     });
    //   } catch (emailError) {
    //     console.error("Failed to send email notification:", emailError);
    //     // Không throw error, chỉ log
    //   }

    //   await user.save();
    // }

    console.log("✅ Order processed successfully:", {
      orderId: order.orderId,
      userId: user.userId,
      amount: transferAmount,
      sepayId: id,
    });

    // Lưu log với processingResult = "success"
    await ContentParseLog.create({
      ...parseLogData,
      processingResult: "success",
      responseSent: {
        success: true,
        message: "Order processed successfully",
        orderId: order.orderId,
        userId: user.userId,
        countPay: user.countPay,
      },
    });

    // Trả về status 201 theo yêu cầu SePay cho response thành công
    return res.status(201).json({
      success: true,
      message: "Order processed successfully",
      orderId: order.orderId,
      userId: user.userId,
      countPay: user.countPay,
    });
  } catch (error) {
    console.error("❌ SePay webhook error:", error);

    // Lưu log với processingResult = "error"
    try {
      await ContentParseLog.create({
        originalContent: req.body?.content || "",
        contentTrimmed: req.body?.content?.trim() || "",
        parsedOrderId: null,
        parseStatus: "failed",
        matchedPattern: "NONE",
        orderFound: false,
        webhookData: {
          sepayId: req.body?.id,
          gateway: req.body?.gateway,
          transactionDate: req.body?.transactionDate,
          accountNumber: req.body?.accountNumber,
          code: req.body?.code,
          transferType: req.body?.transferType,
          transferAmount: req.body?.transferAmount,
          accumulated: req.body?.accumulated,
          subAccount: req.body?.subAccount,
          referenceCode: req.body?.referenceCode,
          description: req.body?.description,
        },
        processingResult: "error",
        errorMessage: error.message,
        responseSent: {
          success: true,
          message: "Webhook received (error logged)",
          error: error.message,
        },
      });
    } catch (logError) {
      console.error("Failed to save error log:", logError);
    }

    // Trả về success: true ngay cả khi có lỗi để SePay không retry nhiều lần
    // Admin có thể xem log để xử lý
    return res.status(201).json({
      success: true,
      message: "Webhook received (error logged)",
      error: error.message,
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
