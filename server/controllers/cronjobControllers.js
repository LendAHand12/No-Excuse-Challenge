import asyncHandler from "express-async-handler";
import Cronjob from "../models/cronjobModel.js";
import {
  countChildToData,
  countLayerToData,
  deleteUser24hUnPay,
  distributionHewe,
  rankingCalc,
  checkUserPreTier2,
  updateErrLahCodeOver45,
} from "../cronJob/index.js";
import { recalculateTreeDieTimeForOldData, testCalculateDieTimeForTree } from "../common.js";

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
    title: "Check Pre Tier 2 Pending List",
    func: checkUserPreTier2,
  },
  {
    title: "Recalculate Tree DieTime For Old Data",
    func: recalculateTreeDieTimeForOldData,
  },
  {
    title: "Update errLahCode OVER45",
    func: updateErrLahCodeOver45,
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

const testTreeDieTime = asyncHandler(async (req, res) => {
  // Hỗ trợ cả GET (query param hoặc route param) và POST (body)
  const treeId = req.params.treeId || req.query.treeId || req.body.treeId;

  if (!treeId) {
    res.status(400);
    throw new Error(
      "treeId is required. Use GET /api/cronjob/test-tree-dietime/:treeId or POST with body { treeId }"
    );
  }

  try {
    const result = await testCalculateDieTimeForTree(treeId);
    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message || "Error testing tree dieTime");
  }
});

export { runCronjob, testTreeDieTime };
