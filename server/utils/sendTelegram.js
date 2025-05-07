import axios from "axios";
import moment from "moment";

const TELEGRAM_BOT_TOKEN = process.env.TELE_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELE_CHAT_ID;

export const sendTelegramMessage = async ({ userName }) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const now = new Date();
  const formatted = moment(now).format("YYYY-MM-DD HH:mm");

  const message = `
      <b>🔔 Thông báo có yêu cầu rút tiền</b>\n
      <b>Tên người dùng:</b> ${userName}\n
      <b>Thời gian:</b> ${formatted}\n
      <b>Chi tiết:</b> <a href="${process.env.FRONTEND_BASE_URL}/admin/withdraw">Xem chi tiết</a>
      `;
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // thử bỏ verify TLS (debug)
      keepAlive: true,           // giữ kết nối
      timeout: 5000              // set timeout rõ ràng
    });

    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML", // Markdown
    }, { httpsAgent: agent });
    console.log("✅ Message sent to Telegram", response.data);
  } catch (error) {
    if (error.response) {
      // Lỗi trả về từ server (Telegram API)
      console.error("❌ Telegram API error:");
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      // Request đã gửi nhưng không nhận được response
      console.error("❌ No response from Telegram API. Request:", error.request);
    } else {
      // Lỗi khác (có thể là lỗi cấu hình)
      console.error("❌ Unknown error:", error.message);
    }
  }
};
