import dotenv from "dotenv";
import transporter from "./transporter.js";

dotenv.config();

export const sendMailUpdateLayerForAdmin = async (listUser) => {
  // set the correct mail option
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: [process.env.CC_MAIL, process.env.MAIL_ADMIN3],
    subject: "Update Layer Check",
    html: `<div style="font-size: 18px">
					<h2>DANH SÁCH NGƯỜI DÙNG THAY ĐỔI TẦNG</h2>
          <table>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Tầng cũ</th>
              <th>Tầng mới</th>
              <th>Kết luận</th>
            </tr>
            ${listUser.map(
              (item) =>
                `<tr>
                <td>${item.userId}</td>
                <td>${item.email}</td>
                <td>${item.oldLayer[item.oldLayer.length - 1]}</td>
                <td>${item.currentLayer[item.currentLayer.length - 1]}</td>
                <td>
                  ${
                    item.currentLayer[item.currentLayer.length - 1] >
                    item.oldLayer[item.oldLayer.length - 1]
                      ? "Tăng"
                      : item.currentLayer < item.oldLayer
                      ? "Giảm"
                      : ""
                  }
                </td>
              </tr>`
            )}
          </table>
				</div>
				
			`,
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
};

export const sendActiveLinkOld = async (email, link) => {
  // set the correct mail option
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: email,
    subject: "Activate Your MTD App",
    html: `
    <div>
    <h4>
      Congratulations! You are now a valued member of NoExcuseChallenge!
      </h4>
      NoExcuseChallenge believes that you will continue contributing significantly to the NoExcuseChallenge community and work together toward even greater success.
      <br></br>
      Ameritec IPS specializes in providing security software for mobile devices.
      We are pleased to provide you with the Activation Link (QR CODE) to activate your “MTD “ Ameritec Intrusion Prevention System.
      <br></br>
      Steps to Install and Activate the MTD App:
      <br></br>
      Step 1: Download the MTD app.
      <br></br>
      •	For Android devices, please use this link: [MTD - Android]
      <br></br>
      •	For iOS devices, please use this link: [MTD - iOS]
      <br></br>
      Step 2: On your Android or iOS device, use the Activation Link below to launch and activate the MTD app.
      Activation Link: <a href="https://ameritec.zimperium.com/api/acceptor/v1/user-activation/activation?stoken=${link}">Active Now</a>
      <br></br>
      Note:
      <br></br>
      If you cannot activate the MTD app directly by clicking the Activation Link, you can copy the link and paste it into browsers such as Chrome, Safari, or CocCoc to complete activation.
      <br></br>
      Important Warnings:
      <br></br>
      1.	Please keep your Activation Link (QR CODE) safe and secure.
      <br></br>
      2.	The license period is 365 days from the date you successfully register as a member on the website: https://NoExcuseChallenge.live. When the license expires, we will send you an email notification with instructions to renew.
      <br></br>
      3.	This Activation Link is for mobile devices running Android or iOS only.
      <br></br>
      4.	Each Activation Link (QR CODE) is valid for activation on a single device only. Any misuse of the Activation Link may result in the permanent termination of your MTD license.
      <br></br>
      5.	If you have any questions, please contact our technical support team for assistance. Thank you!
      The NoExcuseChallenge Team,
      <br></br>
      <b>The NoExcuseChallenge Team</b>
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
};

export const sendActiveLink = async (senderName, email) => {
  // set the correct mail option
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: email,
    subject: "Welcome to No Excuse Challenge – Your Journey Begins!",
    html: `
    <div>
    Dear <b>${senderName}</b>,
    <br></br>
    Welcome to <b>No Excuse Challenge</b>, powered by <b>DreamChain</b>! 🎉
    <br></br>
    You’ve just taken the first step toward a transformative journey where <b>innovation meets opportunity</b>. At <b>No Excuse Challenge</b>, we believe in pushing limits, breaking barriers, and empowering individuals to <b>achieve financial freedom and success</b> through blockchain and AI-driven solutions.
    <br></br>
    <h4>
    What’s Next?
    </h4>
    ✅ <b>Explore the Challenge</b> – Discover how HeWe Challenge helps you grow, compete, and succeed.
    <br></br>
    ✅ <b>Stay Engaged</b> – Connect with our vibrant community and stay updated on new opportunities.
    <br></br>
    ✅ <b>Unlock Your Potential</b> – Leverage the power of HeWe Challenge to take control of your financial future.
    <br></br>
    <br></br>
    Your journey starts now, and we’re here to support you every step of the way.
    If you have any questions, feel free to reach out to our support team at <b>supprot@noexcuse.live</b>
    <br></br>
    <b>🚀 Let’s challenge the future together!</b>
    <br></br>
    Best regards,
    <br></br>
    <b>DreamChain Team</b>
    <br></br>
    www.noexcuse.live

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
};

export const sendMailUserCanInceaseTierToAdmin = async (u) => {
  // set the correct mail option
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: process.env.CC_MAIL,
    subject: "NGƯỜI DÙNG SANG TIER MỚI",
    html: `<div style="font-size: 18px">
					<h2>NGƯỜI DÙNG SANG TIER MỚI</h2>
          <table>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Tier mới</th>
            </tr>
              <tr>
                <td>${u.userId}</td>
                <td>${u.email}</td>
                <td>${u.tier + 1}</td>
              </tr>
          </table>
				</div>
				
			`,
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
};

export const sendMailContactWithAdmin = async (mailInfo) => {
  const { userName, phone, email, message } = mailInfo;

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.CC_MAIL,
    subject: "THÔNG TIN NGƯỜI DÙNG CẦN TƯ VẤN",
    html: `
    <div>
    <h1>
     Thông tin người cần tư vấn
    </h1>
    <p>
    <strong>Họ và tên :</strong> ${userName}
    </p><p>
    <strong>Số điện thoại :</strong> ${phone}
    </p>
    <p>
    <strong>Email :</strong> ${email}
    </p>
    <p style="max-width: 70%">
    <strong>Nội dung :</strong> ${message}
    </p>
    </div>
			`,
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
};

export const sendMailChangeWalletToAdmin = async (mailInfo) => {
  const { userId, userName, phone, email } = mailInfo;

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.CC_MAIL,
    subject: "THÔNG TIN NGƯỜI DÙNG CẦN DUYỆT ĐỔI THÔNG TIN",
    html: `
    <div>
    <h1>
     Thông tin người cần duyệt đổi thông tin
    </h1>
    <p>
    <strong>Họ và tên :</strong> ${userName}
    <p>
    <strong>Link profile :</strong> <a href="${process.env.FRONTEND_BASE_URL}/admin/users/${userId}" target="_blank">${process.env.FRONTEND_BASE_URL}/admin/users/${userId}</a>
    </p>
    </div>
			`,
    cc: [process.env.MAIL_ADMIN1, process.env.MAIL_ADMIN2],
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
};

export const sendMailReceiveCommission = async (mailInfo) => {
  const { senderName, email } = mailInfo;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Direct Commission from No Excuse Challenge",
    html: `
    <div>
    Congratulations! You have received <b>$15</b> commission from user <b>${senderName}</b>.
    <br></br>
    Thank you for participating in our NoExcuseChallenge referral program. 
    <br></br>
    No Excuse Challenge believes you will continue to make significant contributions to the No Excuse Challenge community as we work together toward even greater success.
    <br></br>
    ________________________________________
    <br></br>
    <b>
    The DreamChain Team
    </b>
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
};

export const sendMailRefDc = async (mailInfo) => {
  const { senderName, email } = mailInfo;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "No Excuse Challenge Fund",
    html: `
      Congratulations! You have received <b>$5</b> No Excuse Challenge Contribution Fund from user <b>${senderName}</b>.
      <br></br>
      Thank you for participating in our No Excuse Challenge referral program. 
      <br></br>
      No Excuse Challenge believes you will continue to make significant contributions to the NoExcuseChallenge community as we work together toward even greater success.
      <br></br>
      ________________________________________
      <br></br>
      <b>
      The DreamChain Team
      </b>
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
};

export const sendMailReject = async (mailInfo) => {
  const { senderName, email, reason } = mailInfo;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "KYC Verification Rejected – Action Required",
    html: `
      Dear <b>${senderName}</b>,
      <br></br>
      Thank you for submitting your KYC verification request. After reviewing your documents, we regret to inform you that your verification has been rejected due to the following reason(s):
      <br></br>
      •	Reason : ${reason}
      <br></br>
      To complete your verification, please resubmit your documents while ensuring:
      <br></br>
      ✔️ The document is clear and readable.
      <br></br>
      ✔️ The details match the information you provided.
      <br></br>
      ✔️ The document is valid and not expired.
      <br></br>
      If you have any questions or need further assistance, please feel free to contact our support team at support@noexcuse.live
      We appreciate your cooperation and look forward to verifying your account successfully.
      <br></br>
      Best regards,
      <br></br>
      DreamChain Support
      <br></br>
      DreamChain
      <br></br>
      www.noexcuse.live
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
};

export const sendMailGetHewePrice = async () => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.MAIL_ADMIN1,
    subject: "Please check connect API get HEWE price",
    html: `
    <h1>Warning: Please check connect API get HEWE price</h1>
			`,
    cc: [process.env.CC_MAIL, process.env.MAIL_ADMIN4],
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
};
