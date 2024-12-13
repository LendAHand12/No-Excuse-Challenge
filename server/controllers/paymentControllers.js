import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import {
  getParentWithCountPay,
  getLevelOfRefUser,
} from "../utils/getParentWithCountPay.js";
import Refund from "../models/refundModel.js";
import { getActiveLink } from "../utils/getLinksActive.js";
import { sendActiveLink } from "../utils/sendMailCustom.js";
import {
  checkRatioCountChildOfUser,
  getParentUser,
  getRefParentUser,
  checkSerepayWallet,
} from "../utils/methods.js";
import { checkCanIncreaseNextTier } from "./userControllers.js";
import Wallet from "../models/walletModel.js";
import Tree from "../models/treeModel.js";

const getPaymentInfoNew = asyncHandler(async (req, res) => {
  const { user } = req;
  const { continueWithBuyPackageB } = req.query;

  if (user) {
    let walletUser = user[`walletAddress${user.tier}`];
    if (user.countPay === 13) {
      const canIncreaseTier = await checkCanIncreaseNextTier(user);
      if (!canIncreaseTier) {
        res.status(404);
        throw new Error("You are not eligible for next step payment");
      }
    }

    const wallets = await Wallet.find();

    const registerWallet = wallets.find((ele) => ele.type === "REGISTER");
    const holdWallet = await getAdminWallets();

    if (user.tier === 1) {
      if (
        continueWithBuyPackageB === "true" &&
        user.buyPackage === "B" &&
        user.countPay === 7
      ) {
        user.continueWithBuyPackageB = true;
        await user.save();
      } else if (
        continueWithBuyPackageB === "false" &&
        user.buyPackage === "B" &&
        user.countPay === 7
      ) {
        user.continueWithBuyPackageB = false;
        await user.save();
      }
    }

    const payments = [];
    const paymentIds = [];

    if (user.fine > 0) {
      const transactionFine = await Transaction.create({
        userId: user.id,
        amount: user.fine,
        userCountPay: user.countPay,
        address_ref: registerWallet.address,
        address_from: walletUser,
        address_to: registerWallet.address,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: "FINE",
        status: "PENDING",
      });

      payments.push({
        address: registerWallet.address,
        amount: user.fine,
      });

      paymentIds.push({
        type: "FINE",
        id: transactionFine._id,
        amount: user.fine,
        to: registerWallet.address,
      });
    } else {
      const refUser = await getRefParentUser(user.id, user.tier);

      let haveRefNotPayEnough = false;
      let registerFee = user.countPay === 0 ? 7 * user.tier : 0;
      let directCommissionWallet = "";
      let directCommissionFee = 5 * user.tier;
      let referralCommissionFee = 10 * user.tier;

      // delete pending trans
      await Transaction.deleteMany({
        $and: [
          {
            status: "PENDING",
          },
          { userId: user.id },
        ],
      });

      if (user.countPay === 0) {
        payments.push({
          address: registerWallet.address,
          amount: registerFee,
        });
        const transactionRegister = await Transaction.create({
          userId: user.id,
          amount: registerFee,
          userCountPay: user.countPay,
          address_ref: registerWallet.address,
          address_from: walletUser,
          address_to: registerWallet.address,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "REGISTER",
          status: "PENDING",
        });
        paymentIds.push({
          type: "REGISTER",
          id: transactionRegister._id,
          amount: registerFee,
          to: registerWallet.address,
        });
      }

      if (user.tier >= 2 || user.buyPackage === "A") {
        if (user.countPay === 0) {
          directCommissionFee = 65 * user.tier;
          if (refUser.closeLah) {
            directCommissionWallet = holdWallet[user.tier];
            haveRefNotPayEnough = true;
          } else if (
            refUser.openLah ||
            refUser.adminChangeTier ||
            refUser.createBy === "ADMIN"
          ) {
            directCommissionWallet = refUser[`walletAddress${user.tier}`];
          } else {
            if (
              refUser.status === "LOCKED" ||
              refUser.tier < user.tier ||
              (refUser.tier === user.tier && refUser.countPay < 13)
            ) {
              directCommissionWallet = holdWallet[user.tier];
              haveRefNotPayEnough = true;
            } else {
              directCommissionWallet = refUser[`walletAddress${user.tier}`];
            }
          }
        } else {
          const pendingTransPackage = await Transaction.findOne({
            userId: user._id,
            tier: user.tier,
            type: "PACKAGE",
            userCountPay: user.countPay,
          });

          if (pendingTransPackage) {
            pendingTransPackage.status = "SUCCESS";
            await pendingTransPackage.save();
          }
        }
      } else if (user.tier === 1 && user.buyPackage === "B") {
        if (user.countPay === 0) {
          directCommissionFee = 35 * user.tier;
          if (refUser.closeLah) {
            directCommissionWallet = holdWallet[user.tier];
            haveRefNotPayEnough = true;
          } else if (
            refUser.openLah ||
            refUser.adminChangeTier ||
            refUser.createBy === "ADMIN"
          ) {
            directCommissionWallet = refUser[`walletAddress${user.tier}`];
          } else {
            if (
              refUser.status === "LOCKED" ||
              refUser.tier < user.tier ||
              (refUser.tier === user.tier && refUser.countPay < 7)
            ) {
              directCommissionWallet = holdWallet[user.tier];
              haveRefNotPayEnough = true;
            } else {
              directCommissionWallet = refUser[`walletAddress${user.tier}`];
            }
          }
        } else if (user.countPay === 7 && user.continueWithBuyPackageB) {
          directCommissionFee = 30 * user.tier;
          if (refUser.closeLah) {
            directCommissionWallet = holdWallet[user.tier];
            haveRefNotPayEnough = true;
          } else if (
            refUser.openLah ||
            refUser.adminChangeTier ||
            refUser.createBy === "ADMIN"
          ) {
            directCommissionWallet = refUser[`walletAddress${user.tier}`];
          } else {
            if (
              refUser.status === "LOCKED" ||
              refUser.tier < user.tier ||
              (refUser.tier === user.tier && refUser.countPay < 13)
            ) {
              directCommissionWallet = holdWallet[user.tier];
              haveRefNotPayEnough = true;
            } else {
              directCommissionWallet = refUser[`walletAddress${user.tier}`];
            }
          }
        } else {
          const pendingTransPackage = await Transaction.findOne({
            userId: user._id,
            tier: user.tier,
            type: "PACKAGE",
            userCountPay: user.countPay,
          });

          if (pendingTransPackage) {
            pendingTransPackage.status = "SUCCESS";
            await pendingTransPackage.save();
          }
        }
      } else if (user.tier === 1 && user.buyPackage === "C") {
        if (refUser.closeLah) {
          directCommissionWallet = holdWallet[user.tier];
          haveRefNotPayEnough = true;
        } else if (
          refUser.openLah ||
          refUser.adminChangeTier ||
          refUser.createBy === "ADMIN"
        ) {
          directCommissionWallet = refUser[`walletAddress${user.tier}`];
        } else {
          if (
            refUser.status === "LOCKED" ||
            refUser.tier < user.tier ||
            (refUser.tier === user.tier && refUser.countPay < user.countPay + 1)
          ) {
            directCommissionWallet = holdWallet[user.tier];
            haveRefNotPayEnough = true;
          } else {
            directCommissionWallet = refUser[`walletAddress${user.tier}`];
          }
        }
      }

      const transactionDirect = await Transaction.create({
        userId: user.id,
        amount: directCommissionFee,
        userCountPay: user.countPay,
        address_ref: refUser[`walletAddress${user.tier}`]
          ? refUser[`walletAddress${user.tier}`]
          : refUser[`walletAddress1`],
        address_from: walletUser,
        address_to: directCommissionWallet,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: haveRefNotPayEnough ? "DIRECTHOLD" : "DIRECT",
        status: "PENDING",
        refBuyPackage: refUser.buyPackage,
      });
      paymentIds.push({
        type: "DIRECT",
        id: transactionDirect._id,
        amount: directCommissionFee,
        to: directCommissionWallet,
      });
      payments.push({
        address: directCommissionWallet,
        amount: directCommissionFee,
      });

      // await generatePackageTrans(
      //   user,
      //   refUser,
      //   directCommissionWallet,
      //   user.continueWithBuyPackageB
      // );

      const ancestorsData = await findAncestors(user.id, 13, user.tier);
      let ancestors = ancestorsData.map((data, index) => {
        if (index === 0) {
          data.isFirst = true;
        }
        return data;
      });
      if (user.buyPackage === "A") {
        ancestors = [...ancestorsData];
      } else if (user.buyPackage === "B" && user.countPay === 0) {
        ancestors = ancestorsData.slice(0, 7);
      } else if (
        user.buyPackage === "B" &&
        user.countPay === 7 &&
        continueWithBuyPackageB
      ) {
        ancestors = ancestorsData.slice(7);
      } else {
        ancestors = ancestorsData.slice(user.countPay, user.countPay + 1);
      }

      let countPayUser = user.countPay;
      let indexFor = 1;
      for (let p of ancestors) {
        // console.log({ name: p.userName, isFirst: p.isFirst });
        let referralCommissionWallet, haveParentNotPayEnough;
        const receiveUser = await User.findById(p.userId);
        if (p.isFirst) {
          referralCommissionWallet = receiveUser[`walletAddress${user.tier}`];
          const isSerepayWallet = await checkSerepayWallet(
            receiveUser[`walletAddress${user.tier}`]
          );
          if (!isSerepayWallet) {
            referralCommissionWallet = holdWallet[user.tier];
          }
        } else {
          if (receiveUser.closeLah) {
            referralCommissionWallet = holdWallet[user.tier];
            haveParentNotPayEnough = true;
          } else if (
            receiveUser.openLah ||
            receiveUser.adminChangeTier ||
            receiveUser.createBy === "ADMIN"
          ) {
            referralCommissionWallet = receiveUser[`walletAddress${user.tier}`];
          } else {
            if (
              receiveUser.status === "LOCKED" ||
              (receiveUser.errLahCode !== "" && indexFor > 6) ||
              receiveUser.tier < user.tier ||
              (receiveUser.tier === user.tier &&
                receiveUser.countPay < user.countPay + 1)
            ) {
              referralCommissionWallet = holdWallet[user.tier];
              haveParentNotPayEnough = true;
            } else {
              referralCommissionWallet =
                receiveUser[`walletAddress${user.tier}`];
            }
          }

          if (
            user.tier === 1 &&
            receiveUser.tier === 1 &&
            ((receiveUser.buyPackage === "B" && receiveUser.countPay < 7) ||
              (receiveUser.buyPackage === "A" && receiveUser.countPay < 13))
          ) {
            haveParentNotPayEnough = true;
          }

          if (receiveUser.hold !== "no" && receiveUser.holdLevel !== "no") {
            if (
              receiveUser.hold.toString() === user.tier.toString() &&
              parseInt(receiveUser.holdLevel) <= parseInt(user.countPay)
            ) {
              haveParentNotPayEnough = true;
            }
          } else if (
            user.tier >= 2 &&
            user.countPay >= 3 &&
            receiveUser.countChild[0] >= 300
          ) {
            const checkRatioCountChild = await checkRatioCountChildOfUser(
              receiveUser._id
            );
            if (!checkRatioCountChild) haveParentNotPayEnough = true;
          }

          if (haveParentNotPayEnough) {
            referralCommissionWallet = holdWallet[user.tier];
          }

          if (
            referralCommissionWallet ===
            receiveUser[`walletAddress${user.tier}`]
          ) {
            const isSerepayWallet = await checkSerepayWallet(
              receiveUser[`walletAddress${user.tier}`]
            );
            if (!isSerepayWallet) {
              referralCommissionWallet = holdWallet[user.tier];
            }
          }
        }

        payments.push({
          address: referralCommissionWallet,
          amount: referralCommissionFee,
        });

        const transactionReferral = await Transaction.create({
          userId: user.id,
          amount: referralCommissionFee,
          userCountPay: countPayUser,
          address_ref: receiveUser[`walletAddress${user.tier}`],
          address_from: user.walletAddress[0],
          address_to: referralCommissionWallet,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: haveParentNotPayEnough ? "REFERRALHOLD" : "REFERRAL",
          status: "PENDING",
        });
        paymentIds.push({
          type: "REFERRAL",
          id: transactionReferral._id,
          amount: referralCommissionFee,
          to: referralCommissionWallet,
        });
        countPayUser = countPayUser + 1;
        indexFor++;
      }
    }

    res.json({
      payments,
      paymentIds,
    });
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

const getPaymentInfo = asyncHandler(async (req, res) => {
  const { user } = req;
  const { continueWithBuyPackageB } = req.query;
  const wallets = await Wallet.find();

  const registerWallet = wallets.find((ele) => ele.type === "REGISTER");
  const adminWallet = wallets.find((ele) => ele.type === "ADMIN");
  const holdWallet1 = wallets.find((ele) => ele.type === "HOLD1");
  const holdWallet2 = wallets.find((ele) => ele.type === "HOLD2");
  const holdWallet3 = wallets.find((ele) => ele.type === "HOLD3");
  const holdWallet4 = wallets.find((ele) => ele.type === "HOLD4");
  const holdWallet5 = wallets.find((ele) => ele.type === "HOLD5");

  const holdWallet = {
    1: holdWallet1,
    2: holdWallet2,
    3: holdWallet3,
    4: holdWallet4,
    5: holdWallet5,
  };

  if (user.tier === 1) {
    if (
      continueWithBuyPackageB === "true" &&
      user.buyPackage === "B" &&
      user.countPay === 7
    ) {
      user.continueWithBuyPackageB = true;
      await user.save();
    } else if (
      continueWithBuyPackageB === "false" &&
      user.buyPackage === "B" &&
      user.countPay === 7
    ) {
      user.continueWithBuyPackageB = false;
      await user.save();
    }
  }

  let haveParentNotPayEnough = false;
  let haveRefNotPayEnough = false;
  let parentWithCountPay;
  let parentUser;

  if (user) {
    if (user.countPay === 13) {
      const canIncreaseTier = await checkCanIncreaseNextTier(user);
      if (!canIncreaseTier) {
        res.status(404);
        throw new Error("You are not eligible for next step payment");
      }
    }
    const refUser = await getRefParentUser(user._id, user.tier);
    if (user.countPay === 0 && user.tier === 1) {
      parentUser = refUser;
      parentWithCountPay = refUser;
    } else {
      parentUser = await getParentUser(user._id, user.tier);
      let levelOfRefUser = await getLevelOfRefUser(
        user.id,
        user.tier,
        refUser._id
      );
      let withCountPay = user.countPay;

      if (levelOfRefUser > user.countPay) {
        if (user.countPay <= 1) {
          withCountPay = 0;
        } else {
          withCountPay = levelOfRefUser - user.countPay;
        }
      } else if (levelOfRefUser === user.countPay) {
        withCountPay = user.countPay;
      }
      parentWithCountPay = await getParentWithCountPay(
        user.id,
        withCountPay,
        user.tier,
        refUser._id
      );
    }

    if (!parentUser || !refUser) {
      res.status(404);
      throw new Error("Parent not found");
    }

    let registerFee = user.countPay === 0 ? 7 * user.tier : 0;
    let directCommissionWallet = "";
    let directCommissionFee = 5 * user.tier;
    let referralCommissionWallet = "";
    let referralCommissionFee = 10 * user.tier;

    if (user.tier >= 2 || user.buyPackage === "A") {
      if (user.countPay === 0) {
        directCommissionFee = 65 * user.tier;
        if (refUser.closeLah) {
          directCommissionWallet = holdWallet[user.tier].address;
          haveRefNotPayEnough = true;
        } else if (
          refUser.openLah ||
          refUser.adminChangeTier ||
          refUser.createBy === "ADMIN"
        ) {
          directCommissionWallet = refUser.walletAddress[0];
        } else {
          if (
            refUser.status === "LOCKED" ||
            refUser.tier < user.tier ||
            (refUser.tier === user.tier && refUser.countPay < 13)
          ) {
            directCommissionWallet = holdWallet[user.tier].address;
            haveRefNotPayEnough = true;
          } else {
            directCommissionWallet = refUser.walletAddress[0];
          }
        }
      } else {
        const pendingTransPackage = await Transaction.findOne({
          userId: user._id,
          tier: user.tier,
          type: "PACKAGE",
          userCountPay: user.countPay,
        });

        if (pendingTransPackage) {
          pendingTransPackage.status = "SUCCESS";
          await pendingTransPackage.save();
        }
      }
    } else if (user.tier === 1 && user.buyPackage === "B") {
      if (user.countPay === 0) {
        directCommissionFee = 35 * user.tier;
        if (refUser.closeLah) {
          directCommissionWallet = holdWallet[user.tier].address;
          haveRefNotPayEnough = true;
        } else if (
          refUser.openLah ||
          refUser.adminChangeTier ||
          refUser.createBy === "ADMIN"
        ) {
          directCommissionWallet = refUser.walletAddress[0];
        } else {
          if (
            refUser.status === "LOCKED" ||
            refUser.tier < user.tier ||
            (refUser.tier === user.tier && refUser.countPay < 7)
          ) {
            directCommissionWallet = holdWallet[user.tier].address;
            haveRefNotPayEnough = true;
          } else {
            directCommissionWallet = refUser.walletAddress[0];
          }
        }
      } else if (user.countPay === 7 && user.continueWithBuyPackageB) {
        directCommissionFee = 30 * user.tier;
        if (refUser.closeLah) {
          directCommissionWallet = holdWallet[user.tier].address;
          haveRefNotPayEnough = true;
        } else if (
          refUser.openLah ||
          refUser.adminChangeTier ||
          refUser.createBy === "ADMIN"
        ) {
          directCommissionWallet = refUser.walletAddress[0];
        } else {
          if (
            refUser.status === "LOCKED" ||
            refUser.tier < user.tier ||
            (refUser.tier === user.tier && refUser.countPay < 13)
          ) {
            directCommissionWallet = holdWallet[user.tier].address;
            haveRefNotPayEnough = true;
          } else {
            directCommissionWallet = refUser.walletAddress[0];
          }
        }
      } else {
        const pendingTransPackage = await Transaction.findOne({
          userId: user._id,
          tier: user.tier,
          type: "PACKAGE",
          userCountPay: user.countPay,
        });

        if (pendingTransPackage) {
          pendingTransPackage.status = "SUCCESS";
          await pendingTransPackage.save();
        }
      }
    } else if (user.tier === 1 && user.buyPackage === "C") {
      if (refUser.closeLah) {
        directCommissionWallet = holdWallet[user.tier].address;
        haveRefNotPayEnough = true;
      } else if (
        refUser.openLah ||
        refUser.adminChangeTier ||
        refUser.createBy === "ADMIN"
      ) {
        directCommissionWallet = refUser.walletAddress[0];
      } else {
        if (
          refUser.status === "LOCKED" ||
          refUser.tier < user.tier ||
          (refUser.tier === user.tier && refUser.countPay < user.countPay + 1)
        ) {
          directCommissionWallet = holdWallet[user.tier].address;
          haveRefNotPayEnough = true;
        } else {
          directCommissionWallet = refUser.walletAddress[0];
        }
      }
    }

    // delete pending trans
    await Transaction.deleteMany({
      $and: [
        {
          status: "PENDING",
        },
        { userId: user.id },
      ],
    });

    if (user.countPay === 0) {
      if (user.tier >= 2) {
        if (refUser.closeLah) {
          directCommissionWallet = holdWallet[user.tier].address;
          haveRefNotPayEnough = true;
        } else if (
          refUser.openLah ||
          refUser.adminChangeTier ||
          refUser.createBy === "ADMIN"
        ) {
          directCommissionWallet = refUser.walletAddress[0];
        } else {
          if (
            refUser.status === "LOCKED" ||
            refUser.tier < user.tier ||
            (refUser.tier === user.tier && refUser.countPay < user.countPay + 1)
          ) {
            directCommissionWallet = holdWallet[user.tier].address;
            haveRefNotPayEnough = true;
          } else {
            directCommissionWallet = refUser.walletAddress[0];
          }
        }
      }
      if (parentUser.closeLah) {
        referralCommissionWallet = holdWallet[user.tier].address;
        haveParentNotPayEnough = true;
      } else if (
        parentUser.openLah ||
        parentUser.adminChangeTier ||
        parentUser.createBy === "ADMIN"
      ) {
        referralCommissionWallet = parentUser.walletAddress[0];
      } else {
        if (
          parentUser.status === "LOCKED" ||
          // parentUser.errLahCode !== "" ||
          parentUser.tier < user.tier ||
          (parentUser.tier === user.tier &&
            parentUser.countPay < user.countPay + 1)
        ) {
          referralCommissionWallet = holdWallet[user.tier].address;
          haveParentNotPayEnough = true;
        } else {
          referralCommissionWallet = parentUser.walletAddress[0];
        }
      }
    } else {
      if (refUser.closeLah) {
        directCommissionWallet = holdWallet[user.tier].address;
        haveRefNotPayEnough = true;
      } else if (
        refUser.openLah ||
        refUser.adminChangeTier ||
        refUser.createBy === "ADMIN"
      ) {
        directCommissionWallet = refUser.walletAddress[0];
      } else {
        if (
          refUser.status === "LOCKED" ||
          refUser.tier < user.tier ||
          (refUser.tier === user.tier && refUser.countPay < user.countPay + 1)
        ) {
          directCommissionWallet = holdWallet[user.tier].address;
          haveRefNotPayEnough = true;
        } else {
          directCommissionWallet = refUser.walletAddress[0];
        }
      }

      if (!parentWithCountPay) {
        referralCommissionWallet = holdWallet[user.tier].address;
      } else if (parentWithCountPay.closeLah) {
        referralCommissionWallet = holdWallet[user.tier].address;
        haveParentNotPayEnough = true;
      } else if (
        parentWithCountPay.openLah ||
        parentWithCountPay.adminChangeTier ||
        parentWithCountPay.createBy === "ADMIN"
      ) {
        referralCommissionWallet = parentWithCountPay.walletAddress[0];
      } else if (
        parentWithCountPay.status === "LOCKED" ||
        // parentWithCountPay.errLahCode !== "" ||
        parentWithCountPay.tier < user.tier ||
        (parentWithCountPay.tier === user.tier &&
          parentWithCountPay.countPay < user.countPay + 1)
      ) {
        referralCommissionWallet = holdWallet[user.tier].address;
        haveParentNotPayEnough = true;
      } else {
        referralCommissionWallet = parentWithCountPay.walletAddress[0];
      }
    }

    let holdDirectCommission = false;
    let holdReferralCommission = false;

    if (
      user.buyPackage === "B" &&
      user.countPay === 0 &&
      refUser.buyPackage === "C"
    ) {
      holdDirectCommission = true;
    }

    if (
      user.buyPackage === "A" &&
      (refUser.buyPackage === "B" || refUser.buyPackage === "C")
    ) {
      holdDirectCommission = true;
    }

    if (
      user.tier === 1 &&
      refUser.tier === 1 &&
      ((refUser.buyPackage === "B" && refUser.countPay < 7) ||
        (refUser.buyPackage === "A" && refUser.countPay < 13))
    ) {
      holdDirectCommission = true;
    }

    if (
      user.tier === 1 &&
      parentWithCountPay.tier === 1 &&
      ((parentWithCountPay.buyPackage === "B" &&
        parentWithCountPay.countPay < 7) ||
        (parentWithCountPay.buyPackage === "A" &&
          parentWithCountPay.countPay < 13))
    ) {
      holdReferralCommission = true;
    }

    if (
      parentWithCountPay.hold !== "no" &&
      parentWithCountPay.holdLevel !== "no"
    ) {
      if (
        parentWithCountPay.hold.toString() === user.tier.toString() &&
        parseInt(parentWithCountPay.holdLevel) <= parseInt(user.countPay)
      ) {
        holdReferralCommission = true;
      }
    } else if (
      user.tier >= 2 &&
      user.countPay >= 3 &&
      parentWithCountPay.countChild[0] < 300
    ) {
      holdReferralCommission = true;
    } else if (
      user.tier >= 2 &&
      user.countPay >= 3 &&
      parentWithCountPay.countChild[0] >= 300
    ) {
      const checkRatioCountChild = await checkRatioCountChildOfUser(
        parentWithCountPay._id
      );
      if (!checkRatioCountChild) holdReferralCommission = true;
    }

    if (parentUser.userId === "NU HONG VIP") {
      holdDirectCommission = true;
    }

    if (holdDirectCommission) {
      haveRefNotPayEnough = true;
      directCommissionWallet = holdWallet[user.tier].address;
    }

    if (holdReferralCommission) {
      referralCommissionWallet = holdWallet[user.tier].address;
      haveParentNotPayEnough = true;
    }

    let transactionRegister = null;
    let transactionDirect = null;
    let transactionReferral = null;
    let transactionFine = null;

    const transIds = {};

    const listTransSuccess = await Transaction.find({
      $and: [
        { tier: user.tier },
        { userId: user.id },
        { userCountPay: user.countPay },
        { status: "SUCCESS" },
        {
          type: { $ne: "FINE" },
        },
      ],
    });

    let step = 0;
    if (listTransSuccess.length === 0) {
      if (user.countPay === 0) {
        step = 1;
        transactionRegister = await Transaction.create({
          userId: user.id,
          amount: registerFee,
          userCountPay: user.countPay,
          address_ref: registerWallet.address,
          address_from: user.walletAddress[0],
          address_to: registerWallet.address,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: "REGISTER",
          status: "PENDING",
        });
        transIds.register = transactionRegister._id;
      } else {
        step = 2;
      }

      transactionDirect = await Transaction.create({
        userId: user.id,
        amount: directCommissionFee,
        userCountPay: user.countPay,
        address_ref: refUser.walletAddress[0],
        address_from: user.walletAddress[0],
        address_to: directCommissionWallet,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: haveRefNotPayEnough ? "DIRECTHOLD" : "DIRECT",
        status: "PENDING",
        refBuyPackage: refUser.buyPackage,
      });
      transIds.direct = transactionDirect._id;

      await generatePackageTrans(
        user,
        refUser,
        directCommissionWallet,
        user.continueWithBuyPackageB
      );

      transactionReferral = await Transaction.create({
        userId: user.id,
        amount: referralCommissionFee,
        userCountPay: user.countPay,
        address_ref: parentWithCountPay.walletAddress[0],
        address_from: user.walletAddress[0],
        address_to: referralCommissionWallet,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: haveParentNotPayEnough ? "REFERRALHOLD" : "REFERRAL",
        status: "PENDING",
      });
      transIds.referral = transactionReferral._id;
    }
    if (listTransSuccess.length === 1) {
      if (user.countPay === 0) {
        step = 2;
        transIds.register = listTransSuccess[0]._id;
        transactionDirect = await Transaction.create({
          userId: user.id,
          amount: directCommissionFee,
          userCountPay: user.countPay,
          address_ref: refUser.walletAddress[0],
          address_from: user.walletAddress[0],
          address_to: directCommissionWallet,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: haveRefNotPayEnough ? "DIRECTHOLD" : "DIRECT",
          status: "PENDING",
          refBuyPackage: refUser.buyPackage,
        });
        transIds.direct = transactionDirect._id;

        await generatePackageTrans(
          user,
          refUser,
          directCommissionWallet,
          user.continueWithBuyPackageB
        );

        transactionReferral = await Transaction.create({
          userId: user.id,
          amount: referralCommissionFee,
          userCountPay: user.countPay,
          address_ref: parentWithCountPay.walletAddress[0],
          address_from: user.walletAddress[0],
          address_to: referralCommissionWallet,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: haveParentNotPayEnough ? "REFERRALHOLD" : "REFERRAL",
          status: "PENDING",
        });
        transIds.referral = transactionReferral._id;
      } else {
        step = 3;
        const directTrans = listTransSuccess.find(
          (ele) =>
            ele.type === "DIRECT" ||
            ele.type === "DIRECTHOLD" ||
            ele.type === "PACKAGE"
        );
        if (directTrans.type === "PACKAGE") {
          directCommissionFee = 0;
        }
        transIds.direct = directTrans._id;

        await generatePackageTrans(
          user,
          refUser,
          directCommissionWallet,
          user.continueWithBuyPackageB
        );

        transactionReferral = await Transaction.create({
          userId: user.id,
          amount: referralCommissionFee,
          userCountPay: user.countPay,
          address_ref: parentWithCountPay.walletAddress[0],
          address_from: user.walletAddress[0],
          address_to: referralCommissionWallet,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: haveParentNotPayEnough ? "REFERRALHOLD" : "REFERRAL",
          status: "PENDING",
        });
        transIds.referral = transactionReferral._id;
      }
    }
    if (listTransSuccess.length === 2) {
      if (user.countPay === 0) {
        step = 3;
        const registerTrans = listTransSuccess.find(
          (ele) => ele.type === "REGISTER"
        );
        transIds.register = registerTrans._id;

        const directTrans = listTransSuccess.find(
          (ele) =>
            ele.type === "DIRECT" ||
            ele.type === "DIRECTHOLD" ||
            ele.type === "PACKAGE"
        );
        if (directTrans.type === "PACKAGE") {
          directCommissionFee = 0;
        }
        transIds.direct = directTrans._id;

        await generatePackageTrans(
          user,
          refUser,
          directCommissionWallet,
          user.continueWithBuyPackageB
        );

        transactionReferral = await Transaction.create({
          userId: user.id,
          amount: referralCommissionFee,
          userCountPay: user.countPay,
          address_ref: parentWithCountPay.walletAddress[0],
          address_from: user.walletAddress[0],
          address_to: referralCommissionWallet,
          tier: user.tier,
          buyPackage: user.buyPackage,
          hash: "",
          type: haveParentNotPayEnough ? "REFERRALHOLD" : "REFERRAL",
          status: "PENDING",
        });
        transIds.referral = transactionReferral._id;
      } else {
        step = 4;
        const directTrans = listTransSuccess.find(
          (ele) =>
            ele.type === "DIRECT" ||
            ele.type === "DIRECTHOLD" ||
            ele.buyPackage === "PACKAGE"
        );
        if (directTrans.type === "PACKAGE") {
          directCommissionFee = 0;
        }
        transIds.direct = directTrans._id;

        await generatePackageTrans(
          user,
          refUser,
          directCommissionWallet,
          user.continueWithBuyPackageB
        );

        const referral = listTransSuccess.find(
          (ele) => ele.type === "REFERRAL" || ele.type === "REFERRALHOLD"
        );
        transIds.register = referral._id;
      }
    }
    if (listTransSuccess.length === 3 && user.countPay === 0) {
      step = 4;
      const registerTrans = listTransSuccess.find(
        (ele) => ele.type === "REGISTER"
      );
      transIds.register = registerTrans._id;

      const directTrans = listTransSuccess.find(
        (ele) =>
          ele.type === "DIRECT" ||
          ele.type === "DIRECTHOLD" ||
          ele.type === "PACKAGE"
      );
      if (directTrans.type === "PACKAGE") {
        directCommissionFee = 0;
      }
      transIds.direct = directTrans._id;

      await generatePackageTrans(
        user,
        refUser,
        directCommissionWallet,
        user.continueWithBuyPackageB
      );

      const referral = listTransSuccess.find(
        (ele) => ele.type === "REFERRAL" || ele.type === "REFERRALHOLD"
      );
      transIds.register = referral._id;
    }

    if (user.fine > 0) {
      transactionFine = await Transaction.create({
        userId: user.id,
        amount: user.fine,
        userCountPay: user.countPay,
        address_ref: registerWallet.address,
        address_from: user.walletAddress[0],
        address_to: registerWallet.address,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: "FINE",
        status: "PENDING",
      });
    }

    res.json({
      countPay: user.countPay,
      step,
      registerFee,
      registerWallet: registerWallet.address,
      directCommissionWallet,
      directCommissionFee,
      referralCommissionWallet,
      referralCommissionFee,
      transIds,
      transactionFine,
    });
  } else {
    res.status(404);
    throw new Error("User does not exist");
  }
});

const getAdminWallets = async () => {
  const wallets = await Wallet.find();

  const holdWallet1 = wallets.find((ele) => ele.type === "HOLD1");
  const holdWallet2 = wallets.find((ele) => ele.type === "HOLD2");
  const holdWallet3 = wallets.find((ele) => ele.type === "HOLD3");
  const holdWallet4 = wallets.find((ele) => ele.type === "HOLD4");
  const holdWallet5 = wallets.find((ele) => ele.type === "HOLD5");

  return {
    1: holdWallet1.address,
    2: holdWallet2.address,
    3: holdWallet3.address,
    4: holdWallet4.address,
    5: holdWallet5.address,
  };
};

const findAncestors = async (userId, limit, tier) => {
  let ancestors = [];
  let currentUserId = userId;
  let currentParent;

  const tree = await Tree.findOne({ userId, tier });
  const refTree = await Tree.findOne({ userId: tree.refId, tier });
  if (!refTree) {
    throw new Error("Ref user does not exist");
  }
  ancestors.push(refTree);

  while (ancestors.length < limit) {
    const treeOfUser = await Tree.findOne({ userId: currentUserId, tier });
    if (!treeOfUser) throw new Error("User does not exist");

    const parentId = treeOfUser.parentId;

    if (!parentId) {
      ancestors.push(currentParent);
      continue;
    }

    if (parentId && parentId === tree.refId) {
      currentUserId = parentId;
      continue;
    }

    const parent = await Tree.findOne({ userId: parentId, tier });
    if (!parent) {
      ancestors.push(currentParent);
      continue;
    }

    currentParent = parent;
    ancestors.push(currentParent);
    currentUserId = parentId;
  }

  return ancestors;
};

const generatePackageTrans = async (
  user,
  refUser,
  directCommissionWallet,
  continueWithBuyPackageB
) => {
  const listPendingDirect = await Transaction.find({
    $or: [
      {
        $and: [
          {
            userId: user._id,
            tier: user.tier,
            type: "PACKAGE",
            status: "SUCCESS",
          },
        ],
      },
      {
        $and: [
          {
            userId: user._id,
            tier: user.tier,
            type: "DIRECT",
            status: "SUCCESS",
          },
        ],
      },
      {
        $and: [
          {
            userId: user._id,
            tier: user.tier,
            type: "DIRECTHOLD",
            status: "SUCCESS",
          },
        ],
      },
    ],
  });

  const startIndexPackageTrans = listPendingDirect.length;

  if (user.buyPackage === "A" || user.tier >= 2) {
    for (
      let i = user.countPay === 0 ? 1 : startIndexPackageTrans;
      i <= 12;
      i++
    ) {
      await Transaction.create({
        userId: user.id,
        amount: 0,
        userCountPay: i,
        address_ref: refUser.walletAddress[0],
        address_from: user.walletAddress[0],
        address_to: directCommissionWallet,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: "PACKAGE",
        status: "PENDING",
      });
    }
  }
  if (user.tier === 1 && user.buyPackage === "B") {
    let count = 6;
    if (user.countPay >= 7 && continueWithBuyPackageB) {
      count = 12;
    }
    for (
      let i =
        user.countPay === 0
          ? 1
          : user.countPay === 7
          ? startIndexPackageTrans + 1
          : startIndexPackageTrans;
      i <= count;
      i++
    ) {
      await Transaction.create({
        userId: user.id,
        amount: 0,
        userCountPay: i,
        address_ref: refUser.walletAddress[0],
        address_from: user.walletAddress[0],
        address_to: directCommissionWallet,
        tier: user.tier,
        buyPackage: user.buyPackage,
        hash: "",
        type: "PACKAGE",
        status: "PENDING",
      });
    }
  }
};

const addPayment = asyncHandler(async (req, res) => {
  const { id, hash, type, transIds } = req.body;
  const transaction = await Transaction.findById(id);
  const user = await User.findById(transaction.userId);
  if (transaction.type === "FINE") {
    user.fine = 0;
    await user.save();
  }
  transaction.hash = hash || transaction.hash;
  transaction.status = "SUCCESS";
  const transactionUpdate = await transaction.save();

  if (type === "REFERRAL") {
    await onDonePayment(user, transIds);
  }

  if (transactionUpdate) {
    res.status(201).json({
      message: "Payment successful",
    });
  }
});

const onDonePaymentNew = asyncHandler(async (req, res) => {
  const { user } = req;
  const { transIds } = req.body;
  console.log({ transIds });
  const transIdsList = Object.values(transIds);
  if (transIdsList.length > 0) {
    if (transIdsList.length === 1 && transIdsList[0].type === "FINE") {
      user.fine = 0;
    } else {
      for (let transId of transIdsList) {
        await Transaction.findOneAndUpdate(
          { _id: transId.id, userId: user.id, tier: user.tier },
          { status: "SUCCESS" }
        );
      }

      await Transaction.updateMany(
        { userId: user.id, type: "PACKAGE", tier: user.tier },
        { status: "SUCCESS" }
      );

      if (user.countPay === 0 && user.tier === 1) {
        const links = await getActiveLink(user.email, user.userId, user.phone);
        if (links.length === 1) {
          await sendActiveLink(user.email, links[0]);
        }
      }

      if (user.countPay === 12 && user.buyPackage === "B") {
        if (user.continueWithBuyPackageB === true) {
          user.buyPackage = "A";
          await Tree.findOneAndUpdate(
            { userId: user._id },
            { buyPackage: "A" }
          );
        } else {
          user.buyPackage = "C";
        }
      }

      user.countPay =
        transIds.length === 15
          ? 13
          : transIds.length === 9
          ? 7
          : transIds.length === 7
          ? 13
          : user.countPay + 1;

      console.log({ count: user.countPay });
      if (user.countPay === 13 && user.buyPackage === "B") {
        if (user.continueWithBuyPackageB === true) {
          user.buyPackage = "A";
          await Tree.findOneAndUpdate(
            { userId: user._id },
            { buyPackage: "A" }
          );
        } else {
          user.buyPackage = "C";
        }
      }
    }

    const updatedUser = await user.save();

    if (updatedUser) {
      res.json({ message: "system update successful" });
    }
  } else {
    throw new Error("No transaction found");
  }
});

const onDonePayment = async (user, transIds) => {
  const transIdsList = Object.values(transIds);
  if (transIdsList.length > 0) {
    for (let transId of transIdsList) {
      try {
        await Transaction.findOne({
          $and: [
            { userId: user._id },
            { userCountPay: user.countPay },
            { _id: transId },
            { status: "SUCCESS" },
          ],
        });
      } catch (err) {
        throw new Error("No transaction found");
      }
    }

    if (user.countPay === 0 && user.tier === 1) {
      const links = await getActiveLink(user.email, user.userId, user.phone);
      if (links.length === 1) {
        await sendActiveLink(user.email, links[0]);
      }
    }

    if (user.countPay === 12 && user.buyPackage === "B") {
      if (user.continueWithBuyPackageB === true) {
        user.buyPackage = "A";
        await Tree.findOneAndUpdate({ userId: user._id }, { buyPackage: "A" });
      } else {
        user.buyPackage = "C";
      }
    }

    user.countPay = user.countPay + 1;

    const updatedUser = await user.save();

    if (updatedUser) {
      return;
    }
  } else {
    throw new Error("No transaction found");
  }
};

const getAllPayments = asyncHandler(async (req, res) => {
  const { pageNumber, keyword, status, tier } = req.query;
  const page = Number(pageNumber) || 1;
  let searchType = {};
  if (
    status === "DIRECT" ||
    status === "REFERRAL" ||
    status === "REGISTER" ||
    status === "FINE"
  ) {
    searchType = { type: status };
  }
  if (status === "HOLD") {
    searchType = { type: { $regex: status, $options: "i" } };
  }

  const pageSize = 10;

  const count = await Transaction.countDocuments({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userIds
          { address_from: { $regex: keyword, $options: "i" } }, // Tìm theo địa chỉ ví
          { address_to: { $regex: keyword, $options: "i" } }, // Tìm theo địa chỉ ví
        ],
      },
      { ...searchType },
      { tier },
      {
        status: "SUCCESS",
      },
      { type: { $ne: "PACKAGE" } },
    ],
  });

  const allPayments = await Transaction.find({
    $and: [
      {
        $or: [
          { userId: { $regex: keyword, $options: "i" } }, // Tìm theo userId
          { address_from: { $regex: keyword, $options: "i" } }, // Tìm theo địa chỉ ví
          { address_to: { $regex: keyword, $options: "i" } }, // Tìm theo địa chỉ ví
        ],
      },
      { ...searchType },
      { tier },
      {
        status: "SUCCESS",
      },
      { type: { $ne: "PACKAGE" } },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(status === "HOLD" ? "isHoldRefund -createdAt" : "-createdAt")
    .select("-password");

  const result = [];
  for (let pay of allPayments) {
    let user = await User.findById(pay.userId);
    if (status === "REGISTER" || status === "FINE") {
      result.push({
        _id: pay._id,
        address_from: pay.address_from,
        tier: pay.tier,
        // hash: pay.hash,
        amount: pay.amount,
        userId: user.userId,
        email: user.email,
        type: pay.type,
        createdAt: pay.createdAt,
      });
    } else if (status === "DIRECT" || status === "REFERRAL") {
      const userRef = await User.findOne({
        walletAddress: { $in: [pay.address_ref] },
      });
      result.push({
        _id: pay._id,
        address_from: pay.address_from,
        tier: pay.tier,
        // hash: pay.hash,
        amount: pay.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef ? userRef.userId : "Unknow",
        userReceiveEmail: userRef ? userRef.email : "Unknow",
        userCountPay: pay.userCountPay,
        type: pay.type,
        createdAt: pay.createdAt,
      });
    } else if (status === "HOLD") {
      const userRef = await User.findOne({
        walletAddress: { $in: [pay.address_ref] },
      });
      result.push({
        _id: pay._id,
        address_from: pay.address_from,
        tier: pay.tier,
        // hash: pay.hash,
        amount: pay.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef ? userRef.userId : "Unknow",
        userReceiveEmail: userRef ? userRef.email : "Unknow",
        type: pay.type,
        userCountPay: pay.userCountPay,
        createdAt: pay.createdAt,
        isHoldRefund: pay.isHoldRefund,
      });
    }
  }

  res.json({
    payments: result,
    pages: Math.ceil(count / pageSize),
  });
});

const getPaymentsOfUser = asyncHandler(async (req, res) => {
  const { user } = req;
  const { pageNumber } = req.query;
  const page = Number(pageNumber) || 1;

  const pageSize = 20;

  const count = await Transaction.countDocuments({
    $and: [
      { userId: user.id },
      { status: "SUCCESS" },
      { type: { $ne: "PACKAGE" } },
    ],
  });

  const allPayments = await Transaction.find({
    $and: [
      { userId: user.id },
      { status: "SUCCESS" },
      { type: { $ne: "PACKAGE" } },
    ],
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort("-createdAt")
    .select("-password");

  res.json({
    payments: allPayments,
    pages: Math.ceil(count / pageSize),
  });
});

const getPaymentDetail = asyncHandler(async (req, res) => {
  const trans = await Transaction.findById(req.params.id);
  if (trans) {
    let user = await User.findById(trans.userId);
    if (trans.type === "REGISTER") {
      res.json({
        _id: trans._id,
        address_from: trans.address_from,
        hash: trans.hash,
        amount: trans.amount,
        userId: user.userId,
        email: user.email,
        type: trans.type,
        status: trans.status,
        createdAt: trans.createdAt,
      });
    } else if (trans.type === "DIRECT" || trans.type === "REFERRAL") {
      const userRef = await User.findOne({
        walletAddress: { $in: [trans.address_ref] },
      });
      res.json({
        _id: trans._id,
        address_from: trans.address_from,
        address_to: trans.address_ref,
        hash: trans.hash,
        amount: trans.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef.userId,
        userReceiveEmail: userRef.email,
        type: trans.type,
        status: trans.status,
        userCountPay: trans.userCountPay,
        createdAt: trans.createdAt,
      });
    } else if (trans.type === "DIRECTHOLD" || trans.type === "REFERRALHOLD") {
      const userRef = await User.findOne({
        walletAddress: { $in: [trans.address_ref] },
      });
      res.json({
        _id: trans._id,
        address_from: trans.address_from,
        address_to: trans.address_ref,
        hash: trans.hash,
        amount: trans.amount,
        userId: user.userId,
        email: user.email,
        userReceiveId: userRef ? userRef.userId : "Unknow",
        userReceiveEmail: userRef ? userRef.email : "Unknow",
        type: trans.type,
        status: trans.status,
        userCountPay: trans.userCountPay,
        createdAt: trans.createdAt,
        isHoldRefund: trans.isHoldRefund,
      });
    }
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const checkCanRefundPayment = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const trans = await Transaction.findById(id);
  if (trans) {
    const { userCountPay, address_ref } = trans;
    const userReceive = await User.findOne({
      walletAddress: { $in: [address_ref] },
    });
    // const isSerepayWallet = await checkSerepayWallet(userReceive.walletAddress);
    if (userReceive) {
      if (userReceive.status === "LOCKED") {
        res.status(404);
        throw new Error(`User parent locked`);
      } else if (userReceive.closeLah) {
        res.status(404);
        throw new Error(`User is being blocked from trading`);
      }
      //  else if (!isSerepayWallet) {
      //   throw new Error(`The wallet received is not a Serepay wallet`);
      // }
      else if (userReceive.countPay - 1 < userCountPay) {
        res.status(404);
        throw new Error(
          userReceive.countPay === 0
            ? `User parent NOT FINISHED REGISTER`
            : `User parent pay = ${
                userReceive.countPay - 1
              } time but user pay = ${userCountPay} time`
        );
      } else if (
        trans.type === "REFERRALHOLD" &&
        userReceive.errLahCode === "OVER30"
      ) {
        throw new Error(`User has not had 3 child within 30 days`);
      } else if (
        trans.type === "REFERRALHOLD" &&
        userReceive.errLahCode === "OVER60"
      ) {
        throw new Error(`User has not had 3 child within 60 days`);
      } else if (
        userReceive.buyPackage === "A" &&
        userReceive.tier === 1 &&
        userReceive.countPay < 13
      ) {
        throw new Error(
          `User is ${trans.buyPackage} package but pay ${
            userReceive.countPay === 0 ? 0 : userReceive.countPay - 1
          } times`
        );
      } else if (
        userReceive.buyPackage === "B" &&
        userReceive.tier === 1 &&
        userReceive.countPay < 7
      ) {
        throw new Error(
          `User is ${trans.buyPackage} package but pay ${
            userReceive.countPay === 0 ? 0 : userReceive.countPay - 1
          } times`
        );
      } else if (
        trans.type === "DIRECTHOLD" &&
        trans.buyPackage === "B" &&
        trans.amount === 35 &&
        trans.refBuyPackage === "C"
      ) {
        res.json({
          amount: 5,
          message: `User is ${trans.buyPackage} package Parent is ${trans.refBuyPackage} package (refund 5 USDT)`,
        });
      } else if (
        trans.type === "DIRECTHOLD" &&
        trans.buyPackage === "A" &&
        trans.refBuyPackage === "C"
      ) {
        res.json({
          amount: 5,
          message: `User is ${trans.buyPackage} package Parent is ${trans.refBuyPackage} package (refund 5 USDT)`,
        });
      } else if (
        trans.type === "DIRECTHOLD" &&
        trans.buyPackage === "A" &&
        trans.refBuyPackage === "B"
      ) {
        res.json({
          amount: 35,
          message: `User is ${trans.buyPackage} package Parent is ${trans.refBuyPackage} package (refund 35 USDT)`,
        });
      } else if (trans.type === "DIRECTHOLD" && trans.amount === 30) {
        const receiveParent = await User.findOne({
          walletAddress: { $in: [trans.address_ref] },
        });

        if (receiveParent.buyPackage !== "A") {
          res.json({
            message: `parent has not paid enough to upgrade to package A`,
          });
        }
      } else {
        res.json({
          message: "User is OK for a refund",
        });
      }
    } else {
      res.status(404);
      throw new Error("Cannot get user parent");
    }
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const changeToRefunded = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const trans = await Transaction.findById(id);
  if (trans) {
    trans.isHoldRefund = true;
    await trans.save();
    res.json({
      message: "Update successful",
    });
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const onAdminDoneRefund = asyncHandler(async (req, res) => {
  const { transId, transHash, transType, fromWallet, receiveWallet } = req.body;
  const trans = await Transaction.findById(transId);
  if (trans) {
    trans.isHoldRefund = true;
    await trans.save();

    const refund = await Refund.create({
      transId: transId,
      hash: transHash,
      address_from: fromWallet,
      address_to: receiveWallet,
      type: transType,
    });

    res.json({
      message: "Refund successful",
    });
  } else {
    res.status(404);
    throw new Error("Transaction does not exist");
  }
});

const findUserOtherParentId = asyncHandler(async (req, res) => {
  console.log("getting....");
  const listUsers = await User.find({ $and: [{ isAdmin: false }] });

  const result = [];
  for (let u of listUsers) {
    if (u.children.length > 0) {
      for (let childId of u.children) {
        const child = await User.findById(childId);
        if (child.parentId.toString() !== u.parentId.toString()) {
          result.push({ child: childId, parent: u._id });
        }
      }
    }
  }

  res.json(result);
});

const getParentWithCount = asyncHandler(async (req, res) => {
  const { id, countPay } = req.body;

  const parent = await getParentWithCountPay(id, countPay);

  res.json(parent);
});

const getAllTransForExport = asyncHandler(async (req, res) => {
  let fromDate, toDate;
  const { limit, page } = req.body;
  let match = {
    status: "SUCCESS",
    type: { $ne: "PACKAGE" },
  };

  if (req.body.fromDate) {
    fromDate = req.body.fromDate.split("T")[0];
    match.createdAt = {
      $gte: new Date(new Date(fromDate).valueOf() + 1000 * 3600 * 24),
    };
  }
  if (req.body.toDate) {
    toDate = req.body.toDate.split("T")[0];
    match.createdAt = {
      ...match.createdAt,
      $lte: new Date(new Date(toDate).valueOf() + 1000 * 3600 * 24),
    };
  }

  const offset = (page - 1) * limit;

  const transactions = await Transaction.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "address_from",
        foreignField: "walletAddress",
        as: "sender",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "address_ref",
        foreignField: "walletAddress",
        as: "receiver",
      },
    },
    { $skip: offset },
    { $limit: limit },
    { $sort: { createdAt: -1 } },
  ]);

  const totalCount = await Transaction.countDocuments(match);

  const result = transactions.map((tran) => ({
    _id: tran._id,
    type: tran.type,
    amount: tran.amount,
    isHoldRefund: tran.isHoldRefund,
    status: tran.status,
    createdAt: tran.createdAt,
    address_from: tran.address_from,
    tier: tran.tier,
    address_ref: tran.address_ref,
    senderName: tran.sender.length > 0 ? tran.sender[0].userId : "unknown",
    senderEmail: tran.sender.length > 0 ? tran.sender[0].email : "unknown",
    senderStatus:
      tran.sender.length > 0
        ? tran.sender[0].status === "DELETED"
          ? "TK đã xoá"
          : ""
        : "unknow",
    receiverName:
      tran.receiver.length > 0 ? tran.receiver[0].userId : "unknown",
    receiverEmail:
      tran.receiver.length > 0 ? tran.receiver[0].email : "unknown",
  }));

  res.json({ totalCount, result });
});

export {
  getPaymentInfo,
  addPayment,
  getAllPayments,
  getPaymentsOfUser,
  getPaymentDetail,
  checkCanRefundPayment,
  changeToRefunded,
  onAdminDoneRefund,
  findUserOtherParentId,
  getParentWithCount,
  getAllTransForExport,
  onDonePayment,
};
