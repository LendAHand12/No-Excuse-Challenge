import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  // host: "sv3.tmail.vn", // AMERITEC
  // port: 587,
  // secure: false,

  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },

});

export default transporter;
