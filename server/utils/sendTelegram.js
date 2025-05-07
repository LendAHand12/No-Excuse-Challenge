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
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML", // Markdown
    });
    console.log("✅ Message sent to Telegram");
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    console.error("🔍 Telegram response:", error.response?.data);
  }
};
