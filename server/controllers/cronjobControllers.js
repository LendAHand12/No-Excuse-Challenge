import asyncHandler from "express-async-handler";
import Cronjob from "../models/cronjobModel.js";
import {
  countChildToData,
  countLayerToData,
  deleteUser24hUnPay,
  distributionHewe,
  rankingCalc,
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
];

const runCronjob = asyncHandler(async (req, res) => {
  const { user } = req;
  const { cronjob } = req.body;

  const cron = cronjobs.find((ele) => ele.title === cronjob.title);

  if(cron) {
    await cron.func();
  } else {
    throw new Error("Cronjob not found");
  }

  console.log({ cron });

  await Cronjob.create({
    userId: user.id,
    title: cronjob.title,
  });

  res.json({
    message: "Process completed!",
  });
});

export { runCronjob };
