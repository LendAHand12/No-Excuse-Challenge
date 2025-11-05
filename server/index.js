import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import morgan from "morgan"; // show the API endpoints
import cors from "cors"; // allow cross origin requests
import cookieSession from "cookie-session"; // for implementing cookie sessions for passport
import helmet from "helmet";
import { CronJob } from "cron";

// middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import changeUserRoutes from "./routes/changeUserRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import pagePreviewRoutes from "./routes/pagePreviewRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import pageSettingRoutes from "./routes/pageSettingRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import dreampoolRoutes from "./routes/dreampoolRoutes.js";
import withdrawRoutes from "./routes/withdrawRoutes.js";
import iceBreakerRoutes from "./routes/iceBreakerRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import cronjobRoutes from "./routes/cronjobRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import userHistoryRoutes from "./routes/userHistoryRoutes.js";
import moveSystemRoutes from "./routes/moveSystemRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import preTier2Routes from "./routes/preTier2Routes.js";
import bankWebhookRoutes from "./routes/bankWebhookRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

import {
  countChildToData,
  countLayerToData,
  deleteUser24hUnPay,
  distributionHewe,
  rankingCalc,
  blockUserNotKYC,
  updateHewePrice,
  checkUserPreTier2,
  checkRefAndTotalChildOfUser,
  fetchVnUsdRates,
} from "./cronJob/index.js";
import { sendTelegramMessage } from "./utils/sendTelegram.js";
import { fixParentChildLinks } from "./common.js";
import Tree from "./models/treeModel.js";
import { getTotalLevel1ToLevel10OfUser, getTotalLevel6ToLevel10OfUser } from "./utils/methods.js";

const app = express();

// Trust proxy để IP whitelist hoạt động đúng (khi đứng sau Nginx/Cloudflare)
app.set("trust proxy", true);

// use morgan in development mode
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// connect to the mongoDB database
connectDB();

app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(cors()); // to avoid CORS errors
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.static("public"));

// use cookie sessions
app.use(
  cookieSession({
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    keys: [process.env.COOKIE_SESSION_KEY],
  })
);

// configure all the routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/changeUser", changeUserRoutes);
app.use("/api/page", pageRoutes);
app.use("/api/page-preview", pagePreviewRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/page-settings", pageSettingRoutes);
app.use("/api/claim", claimRoutes);
app.use("/api/dreampool", dreampoolRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/ice-breaker", iceBreakerRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/cronjob", cronjobRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/config", configRoutes);
app.use("/api/user-history", userHistoryRoutes);
app.use("/api/move-system", moveSystemRoutes);
app.use("/api/swap", swapRoutes);
app.use("/api/pre-tier-2", preTier2Routes);
app.use("/api/bank-webhook", bankWebhookRoutes);
app.use("/api/tickets", ticketRoutes);

app.get("/api/test-tele", async (req, res) => {
  await sendTelegramMessage({ userName: "kiet" });

  return res.json({ message: "Test thành công" });
});

app.use(notFound);

// configure a custome error handler middleware
app.use(errorHandler);

// const nextUser = await getNextUserTier2();

// await resetPass();

// Cấu hình timezone Việt Nam (GMT+7)
const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

const cron0 = new CronJob(
  "00 00 * * *", // 0h giờ Việt Nam
  async () => {
    console.log("Dis hewe to user start");
    await distributionHewe();
    console.log("Dis hewe user done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron1 = new CronJob(
  "00 05 * * *", // 5h sáng giờ Việt Nam
  async () => {
    console.log("Delete user start");
    await deleteUser24hUnPay();
    console.log("Delete user done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron12 = new CronJob(
  "30 01 * * *", // 1h30 giờ Việt Nam
  async () => {
    console.log("Block user not KYC start");
    await blockUserNotKYC();
    console.log("Block user not KYC done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron2 = new CronJob(
  "00 02 * * *", // 2h giờ Việt Nam
  async () => {
    console.log("Count child start");
    await countChildToData();
    console.log("Count child done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron3 = new CronJob(
  "00 03 * * *", // 3h giờ Việt Nam
  async () => {
    console.log("Refresh layer start");
    await countLayerToData();
    console.log("Refresh layer done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron4 = new CronJob(
  "00 04 * * *", // 4h giờ Việt Nam
  async () => {
    console.log("Ranking calc start");
    await rankingCalc();
    console.log("Ranking calc done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron6 = new CronJob(
  "0 * * * *", // Mỗi giờ theo giờ Việt Nam
  async () => {
    console.log("Update HEWE price start");
    await updateHewePrice();
    console.log("Update HEWE price done");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

// Chạy mỗi giờ vào phút thứ 10: lấy tỷ giá VN từ phobitcoin
const cronFetchVnUsdRates = new CronJob(
  "10 * * * *", // phút 10 mỗi giờ
  async () => {
    try {
      console.log("Fetch VN USD rates start");
      await fetchVnUsdRates();
      console.log("Fetch VN USD rates done");
    } catch (e) {
      console.error("Fetch VN USD rates error:", e?.message || e);
    }
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

const cron7 = new CronJob(
  "00 06 * * *", // 6h giờ Việt Nam
  async () => {
    console.log("Check user pre tier 2 start");
    await checkUserPreTier2();
    console.log("Check user pre tier 2 end");
  },
  null,
  true,
  VIETNAM_TIMEZONE
);

// await resetErrLahCode();

// const tree = await Tree.findById("67e54106fe1364e3848c714b");
// const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(tree, true);
// console.log({ countChild1, countChild2 });

// await checkUserErrLahCodeDuoi45Ngay();

await fixParentChildLinks();

cron0.start();
cron1.start();
cron12.start();
cron2.start();
cron3.start();
cron4.start();
cron6.start();
cron7.start();
cronFetchVnUsdRates.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
