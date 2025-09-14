import asyncHandler from "express-async-handler";
import Cronjob from "../models/cronjobModel.js";
import {
  checkRefWithTime,
  countChildToData,
  countLayerToData,
  deleteUser24hUnPay,
  distributionHewe,
  rankingCalc,
  checkUserPreTier2
} from "../cronJob/index.js";

const cronjobs = [
  {
    title: "Distribution Hewe",
    func: distributionHewe,
  },
  {
    title: "Delete unpaid user",
    func: deleteUser24hUnPay,
  },
  {
    title: "Count subordinates",
    func: countChildToData,
  },
  {
    title: "Count level",
    func: countLayerToData,
  },
  {
    title: "Dreampool reward",
    func: rankingCalc,
  },
  {
    title: "Check referral list",
    func: checkRefWithTime,
  },
  {
    title: "Check Pre Tier 2 Pending List",
    func: checkUserPreTier2,
  },
];

const runCronjob = asyncHandler(async (req, res) => {
  const { user } = req;
  const { cronjob } = req.body;

  const cron = cronjobs.find((ele) => ele.title === cronjob.title);

  if (!cron) {
    throw new Error("Cronjob not found");
  }

  // Ghi log với trạng thái pending
  const log = await Cronjob.create({
    userId: user.id,
    title: cronjob.title,
    status: "pending",
  });

  // Gọi cron func không chờ, xử lý kết quả async
  cron
    .func()
    .then(async () => {
      await Cronjob.findByIdAndUpdate(log._id, {
        status: "success",
        finishedAt: new Date(),
      });
    })
    .catch(async (err) => {
      await Cronjob.findByIdAndUpdate(log._id, {
        status: "failed",
        error: err.message || "Unknown error",
        finishedAt: new Date(),
      });
    });

  // Trả về ngay
  res.json({
    message: "Cronjob triggered successfully!",
    logId: log._id,
  });
});

export { runCronjob };
