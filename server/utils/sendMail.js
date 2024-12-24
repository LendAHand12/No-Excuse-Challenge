import dotenv from "dotenv";
import transporter from "../utils/transporter.js";
import generateToken from "../utils/generateToken.js";

dotenv.config();

const sendMail = async (id, email, option) => {
  const frontendURL = process.env.FRONTEND_BASE_URL;

  // send email for the email verification option
  if (option === "email verification") {
    // create a new JWT to verify user via email
    const emailToken = generateToken(id, "email");
    const url = `${frontendURL}/confirm?token=${emailToken}`;

    // set the correct mail option
    const mailOptions = {
      from: process.env.EMAIL, // sender address
      to: email,
      subject: "DreamChain",
      html: `
        <div>
            <h2 style="text-align: center">
            Welcome to DreamChain!
            </h2> 
            <br>
            Thank you for becoming a valued member of our community.
            <br></br>
            <b>Subject</b>: Activate Your DreamChain Account
            <br><br>
            Dear Member,
            <br><br>
            •	Your DreamChain account is pending activation.
            <br>
            •	To activate your account, please click the link below:
            Activation Link: <a href="${url}">Link</a>
            <br>
            •	After successfully activating your account, you are now able log in to your account on the website dreamchain.live to start your journey.
            <br><br>
            <b>Withdraw Assets</b> 
            <br><br>
            •	KYC must be completed before withdraw any assets.
            <br>
            •	Please upload both sides of your National ID, Driver License or Passport and update the required information. When your account status shows “Pending Verification,” it means the KYC process has been completed successfully. 
            <br>
            •	Please wait for the company to approve your identity. 
            <br>
            •	Once your account status changes to “Verified,” you can begin making transactions.
            </div>
          `,
      cc: process.env.CC_MAIL,
    };

    const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    // send a promise since nodemailer is async
    if (mailSent) return Promise.resolve(1);
  }
  // send a mail for resetting password if forgot password
  else if (option === "forgot password") {
    // create a new JWT to verify user via email
    const forgetPasswordToken = generateToken(id, "forgot password");
    const url = `${frontendURL}/reset-password?token=${forgetPasswordToken}`;
    const mailOptions = {
      from: process.env.EMAIL, // sender address
      to: email,
      subject: "Reset Password for DreamChain", // Subject line
      html: `
        <div>
          <h2 style="text-align: center">
          Welcome to DreamChain!
          </h2> 
          <br>
          Thank you for becoming a valued member of our community.
          <br></br>
          <b>Subject</b>:Reset Your DreamChain Password
          <br><br>
          Forgot your password? No worries! Simply click the link below to reset it:
          <br>
          Password Reset Link : <a href="${url}">Link</a>. 
          <br><br>
          <i>Note: This link is valid for only 10 minutes.</i>
        </div>
				
			`,
      cc: process.env.CC_MAIL,
    };

    const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    if (mailSent) return Promise.resolve(1);
  } else if (option === "Payment to not fine") {
    const mailOptions = {
      from: process.env.EMAIL, // sender address
      to: email,
      subject: "Please payment for DreamChain", // Subject line
      html: `<div>
					<h2>Please pay before being penalized</h2>
				</div>
				
			`,
      cc: process.env.CC_MAIL,
    };

    const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    if (mailSent) return Promise.resolve(1);
  } else if (option === "change wallet") {
    // create a new JWT to verify user via email
    const changeWalletToken = generateToken(id, "change wallet");
    const url = `${frontendURL}/user/changeWallet?token=${changeWalletToken}`;
    const mailOptions = {
      from: process.env.EMAIL, // sender address
      to: email,
      subject: "Change your wallet address for DreamChain", // Subject line
      html: `
        <div>
          <h2 style="text-align: center">
          Welcome to DreamChain!
          </h2> 
          <br>
          Thank you for becoming a valued member of our community.
          <br></br>
          <b>Subject</b>: Update Your Wallet Address
          <br><br>
          Want to change your wallet? No worries! Simply click the link below to update your wallet address:
          <br>
          Update Wallet Link : <a href="${url}">Link</a>
          <br>
          <br>
          <i>Note: This link is valid for only 10 minutes.</i>
        </div>
				
			`,
      cc: process.env.CC_MAIL,
    };

    const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    if (mailSent) return Promise.resolve(1);
  }
};

export default sendMail;
