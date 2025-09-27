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

import {
  countChildToData,
  countLayerToData,
  deleteUser24hUnPay,
  distributionHewe,
  rankingCalc,
  checkRefWithTime,
  blockUserNotKYC,
  updateHewePrice,
  checkUserTryToTier2,
  checkRefUserHaveChildOver45,
  checkUserPreTier2,
  updateTier2Shortfall,
} from "./cronJob/index.js";
import { sendTelegramMessage } from "./utils/sendTelegram.js";
import { checkUserErrLahCodeDuoi45Ngay, getNextUserTier2, resetPass } from "./common.js";
import Tree from "./models/treeModel.js";
import { getTotalLevel1ToLevel10OfUser, getTotalLevel6ToLevel10OfUser } from "./utils/methods.js";

const app = express();

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

app.get("/api/test-tele", async (req, res) => {
  await sendTelegramMessage({ userName: "kiet" });

  return res.json({ message: "Test thành công" });
});

app.use(notFound);

// configure a custome error handler middleware
app.use(errorHandler);

// const nextUser = await getNextUserTier2();

// await resetPass();

const cron0 = new CronJob("00 00 * * *", async () => {
  // 0h
  console.log("Dis hewe to user start");
  await distributionHewe();
  console.log("Dis hewe user done");
});

const cron1 = new CronJob(
  "05 * * * *", // chạy 4:00 sáng
  async () => {
    console.log("Delete user start");
    await deleteUser24hUnPay();
    console.log("Delete user done");
  },
  null,
  true,
  "Asia/Bangkok" // múi giờ GMT+7
);

const cron12 = new CronJob("30 01 * * *", async () => {
  // 1h30
  console.log("Block user not KYC start");
  await blockUserNotKYC();
  console.log("Block user not KYC done");
});

const cron13 = new CronJob("45 01 * * *", async () => {
  // 1h30
  console.log("Check User try to Tier2 start");
  await checkUserTryToTier2();
  console.log("Check User try to Tier2 done");
});

const cron14 = new CronJob("55 01 * * *", async () => {
  // 1h55
  console.log("Check User Have child over 45 start");
  await checkRefUserHaveChildOver45();
  console.log("Check Usr Have child over 45 done");
});

const cron2 = new CronJob("00 02 * * *", async () => {
  // 2h
  console.log("Count child start");
  await countChildToData();
  console.log("Count child done");
});

const cron3 = new CronJob("00 03 * * *", async () => {
  // 3h
  console.log("Refresh layer start");
  await countLayerToData();
  console.log("Refresh layer done");
});

const cron4 = new CronJob("00 04 * * *", async () => {
  // 4h
  console.log("Ranking calc start");
  await rankingCalc();
  console.log("Ranking calc done");
});

const cron5 = new CronJob("00 05 * * *", async () => {
  // 5h
  console.log("Check ref with time start");
  await checkRefWithTime();
  console.log("Check ref with time done");
});

const cron6 = new CronJob("0 * * * *", async () => {
  // evry hour
  await updateHewePrice();
});

const cron7 = new CronJob("00 06 * * *", async () => {
  // every 6 hour
  console.log("Check user pre tier 2 start");
  await checkUserPreTier2();
  console.log("Check user pre tier 2 end");
});

const cron8 = new CronJob("10 06 * * *", async () => {
  // every 6 hour
  console.log("updateTier2Shortfall start");
  await updateTier2Shortfall();
  console.log("updateTier2Shortfall end");
});

// await test1();

// const tree = await Tree.findById("67e54106fe1364e3848c714b");
// const { countChild1, countChild2 } = await getTotalLevel1ToLevel10OfUser(tree, true);
// console.log({ countChild1, countChild2 });

// await checkUserErrLahCodeDuoi45Ngay();

cron0.start();
cron1.start();
cron12.start();
cron13.start();
cron14.start();
cron2.start();
cron3.start();
cron4.start();
cron5.start();
cron6.start();
cron7.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
