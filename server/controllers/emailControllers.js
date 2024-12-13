import asyncHandler from "express-async-handler";
import Email from "../models/emailModel.js";
import { sendMailContactWithAdmin } from "../utils/sendMailCustom.js";

const getAllEmails = asyncHandler(async (req, res) => {
  const emails = await Email.find();

  res.json({
    emails,
  });
});

const createEmail = asyncHandler(async (req, res) => {
  const { userName, phone, email, message } = req.body;
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.socket.remoteAddress;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const listSentEmailOnDay = await Email.find({
      $and: [
        { $or: [{ email }, { ip }] },
        {
          createdAt: {
            $gte: todayStart,
            $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      ],
    });
    if (listSentEmailOnDay.length < 5) {
      await sendMailContactWithAdmin({
        userName,
        phone,
        email,
        message,
      });
      await Email.create({ userName, phone, email, message, ip });
    }
    res.status(200).json({
      message: "Sent mail contact",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Internal error");
  }
});

export { getAllEmails, createEmail };
