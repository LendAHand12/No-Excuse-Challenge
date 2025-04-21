import expressAsyncHandler from "express-async-handler";
import Honor from "../models/honorModel.js";
import Transaction from "../models/transactionModel.js";
import Config from "../models/configModel.js";

const getDreamPool = expressAsyncHandler(async (req, res) => {
  const count = await Transaction.countDocuments({
    type: "PIG",
    status: "SUCCESS",
  });

  const allBreakers = await Honor.find({})
    .populate("userId", "_id userId email")
    .sort("-createdAt");

  const pigConfig = await Config.findOne({ label: "PIG" });

  res.json({
    dreampool: count * 5 + parseInt(pigConfig.value),
    allBreakers,
  });
});

const updateDreamPool = expressAsyncHandler(async (req, res) => {
  const { totalDreampool } = req.body;
  const pigConfig = await Config.findOne({ label: "PIG" });

  const count = await Transaction.countDocuments({
    type: "PIG",
    status: "SUCCESS",
  });

  const newPigConfigNumber = parseInt(totalDreampool) - count * 5;

  pigConfig.value = newPigConfigNumber;
  await pigConfig.save();

  res.json({ message: "Update successfuly" });
});

export { getDreamPool, updateDreamPool };
