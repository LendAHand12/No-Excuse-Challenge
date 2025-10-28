# Bank Webhook API Documentation

## Overview

Webhook này được sử dụng để nhận thông báo từ ngân hàng về giao dịch đã thành công hoặc thất bại.

## Endpoints

### 1. Verify Webhook

**GET** `/api/bank-webhook/verify`

Kiểm tra xem webhook endpoint có hoạt động không.

**Response:**

```json
{
  "success": true,
  "message": "Webhook endpoint is active",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Notify Transaction

**POST** `/api/bank-webhook/notify`

Nhận thông báo về giao dịch từ ngân hàng.

**Request Body:**

```json
{
  "transactionId": "BANK123456789", // ID giao dịch của ngân hàng
  "transferContent": "USER123", // Nội dung chuyển khoản (chứa userId hoặc orderId)
  "accountNumber": "1234567890", // Số tài khoản người gửi
  "bankCode": "ACB", // Mã ngân hàng
  "amount": 1000000, // Số tiền (VNĐ)
  "status": "SUCCESS", // Trạng thái: SUCCESS, FAILED, PENDING
  "createdAt": "2024-01-15T10:30:00Z", // Thời gian giao dịch
  "description": "Payment for package A" // Mô tả giao dịch
}
```

**Note:** `transferContent` chứa transId để xác định user. Hệ thống sẽ tự động tìm order dựa trên transId (có thể là userId hoặc orderId).

**Response Success:**

```json
{
  "success": true,
  "message": "Transaction processed successfully"
}
```

**Response Error:**

```json
{
  "error": "Missing required fields"
}
```

## Field Descriptions

| Field           | Type   | Required | Description                                     |
| --------------- | ------ | -------- | ----------------------------------------------- |
| transactionId   | String | No       | ID giao dịch từ ngân hàng (bankTransactionId)   |
| transferContent | String | Yes      | Nội dung chuyển khoản (chứa transId/userId)     |
| accountNumber   | String | No       | Số tài khoản người gửi                          |
| bankCode        | String | No       | Mã ngân hàng                                    |
| amount          | Number | Yes      | Số tiền giao dịch (VNĐ)                         |
| status          | String | Yes      | Trạng thái giao dịch (SUCCESS, FAILED, PENDING) |
| signature       | String | No       | Chữ ký để verify tính xác thực                  |
| createdAt       | String | No       | Thời gian giao dịch (ISO 8601)                  |
| description     | String | No       | Mô tả giao dịch                                 |

## Status Values

- `SUCCESS`: Giao dịch thành công
- `FAILED`: Giao dịch thất bại
- `PENDING`: Giao dịch đang chờ xử lý

## Process Flow

1. User tạo order trong hệ thống với `orderId` (status: PENDING)
2. User chuyển khoản với nội dung chứa `orderId` (ví dụ: "ORDER123")
3. Ngân hàng xử lý và gọi webhook với:
   - `transferContent`: chứa orderId
   - `status`: SUCCESS hoặc FAILED
   - `amount`, `accountNumber`, `transactionId`, etc.
4. System:
   - Tìm order dựa trên `transferContent` (orderId)
   - Cập nhật order:
     - Nếu `status: SUCCESS`: Update order.status = SUCCESS, tăng countPay của user
     - Nếu `status: FAILED`: Update order.status = FAILED
5. Gửi email thông báo cho admin về giao dịch thành công

## Security Features ✅

Webhook đã được bảo mật với các tính năng sau:

### 1. ✅ IP Whitelist

- Chỉ cho phép request từ IP của ngân hàng
- Config qua `BANK_IP_WHITELIST` environment variable

### 2. ✅ HMAC Signature Verification

- Verify request bằng HMAC-SHA256 signature
- Secret key: `BANK_WEBHOOK_SECRET`

### 3. ✅ Amount Validation

- Kiểm tra amount từ bank phải khớp với order.amount
- Ngăn chặn fraud by fake amount

### 4. ✅ Replay Attack Protection

- Không xử lý order đã được xử lý (status = SUCCESS)
- Idempotent design

### 5. ✅ Comprehensive Logging

- Log tất cả security events
- Monitor unauthorized attempts

**Xem chi tiết cấu hình tại:** [SECURITY_CONFIG.md](./SECURITY_CONFIG.md)

## Testing

### Test Verify Endpoint

```bash
curl http://localhost:5000/api/bank-webhook/verify
```

### Test Notify Endpoint

```bash
curl -X POST http://localhost:5000/api/bank-webhook/notify \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "BANK123",
    "transferContent": "ORDER123",
    "amount": 1000000,
    "status": "SUCCESS",
    "accountNumber": "1234567890",
    "bankCode": "ACB"
  }'
```

## Example Implementation in Bank System

```javascript
// After successful transaction
// transferContent là nội dung người dùng nhập khi chuyển khoản (chứa orderId)
const webhookData = {
  transactionId: bankTransactionId,
  transferContent: transferContent, // Nội dung chuyển khoản (ví dụ: "ORDER123")
  accountNumber: fromAccount,
  bankCode: bankCode,
  amount: amount,
  status: "SUCCESS",
  createdAt: new Date().toISOString(),
  description: "Package payment",
};

// Send to webhook
fetch("https://your-domain.com/api/bank-webhook/notify", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(webhookData),
});
```
