import asyncHandler from "express-async-handler";
import Wallet from "../models/walletModel.js";
import User from "../models/userModel.js";

const getAllWallets = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find();

  res.json({
    wallets,
  });
});

const updateWallet = asyncHandler(async (req, res) => {
  const { wallets } = req.body;

  // try {
  for (let w of wallets) {
    let walletData = await Wallet.findOne({ type: w.type });
    walletData.address = w.address || walletData.address;
    walletData.updateAgent = req.headers["user-agent"];
    await walletData.save();
    if (w.type === "ADMIN") {
      const admin = await User.findById("6494e9101e2f152a593b66f2");
      admin.walletAddress = w.address;
      await admin.save();
    }
  }
  res.status(200).json({
    message: "Update successful",
  });
  // } catch (error) {
  //   res.status(400);
  //   throw new Error("Internal error");
  // }
});

export { getAllWallets, updateWallet };
