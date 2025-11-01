import asyncHandler from "express-async-handler";
import Config from "../models/configModel.js";

const getAllConfigs = asyncHandler(async (req, res) => {
  const allConfigs = await Config.find({
    label: { $not: { $regex: "PIG", $options: "i" } },
  });

  res.json({
    allConfigs: allConfigs,
  });
});

const update = asyncHandler(async (req, res) => {
  const { config } = req.body;

  const configData = await Config.findById(config._id);

  if (configData) {
    configData.value = config.value;
    await configData.save();
  }

  res.json({
    message: "Update successfully",
  });
});

// Get USDT exchange rate for bank withdrawal
const getExchangeRate = asyncHandler(async (req, res) => {
  const exchangeRateConfig = await Config.findOne({ label: "USD_TO_VND_BUY" });

  if (!exchangeRateConfig) {
    res.status(404).json({
      error: "Exchange rate not found",
    });
    return;
  }

  res.json({
    exchangeRate: exchangeRateConfig.value,
    label: exchangeRateConfig.label,
  });
});

export { getAllConfigs, update, getExchangeRate };
