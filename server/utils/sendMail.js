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
      subject: "LEND A HAND",
      html: `<div style="font-size: 18px">
					<h2>XIN CHÀO QUÝ KHÁCH !</h2>
					-Tài khoản LEND A HAND (THE POWER OF UNITED ) của quý khách đang chờ được kích hoạt.
          <br></br>
          -Để kích hoạt tài khoản quý khách vui lòng nhấp vào link bên dưới để kích hoạt tài khoản.
          <br></br>
          LINK KÍCH HOẠT: <a href="${url}">Link</a>
					<br>
          -Sau khi kích hoạt tài khoản thành công quý khách đăng nhập tài khoản của mình trên website: <a href="https://lah12.com">https://lah12.com</a> vừa mới đăng ký để  KYC.
          <br></br>
          -Để KYC quý khách vui lòng upload CCCD 2 mặt và cập nhật, khi trên tài khoản hiện thị trạng thái CHỜ XÁC THỰC là đã KYC thành công. Sau đó bạn chờ để cty Duyệt, khi tài khoản ở trạng thái ĐÃ XÁC THỰC thì bạn có thể bắt đầu thanh toán. <br></br>
          -ĐỂ LẤY LINK GIỚI THIỆU QUÝ KHÁCH VUI LÒNG LÀM THEO HƯỚNG DẪN BÊN DƯỚI:
          <br></br>
          -LINK GIỚI THIỆU:
          <br></br>
          Bạn có thể lấy link giới thiệu bằng cách đăng nhập tài khoản vào thư mục GIỚI THIỆU / chọn cấp dưới ( KHÔNG CHỌN), rồi COPY để lấy link giới thiệu của mình.
          <br></br>
          <br></br>
          <br></br>
          <b>Best Regards & Thanks!</b>
          <br></br>
          <br></br>
          <b>Van Truong (Mr.)</b>
          <br></br>
          <br></br>
          IT CHIEF OF SECURITY OFFICER | AMERITECJSC
          <br></br>
          29 VO VAN TAN, Ward VO THI SAU, District 3 | Ho Chi Minh City, Vietnam
          <br></br>
          T: (+84-28) 2250.8166
          <br></br>
          Email: support@lah12.com
          <br></br>
          <br></br>
          Website: <a href="https://lah12.com">www.lah12.com</a>
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
      subject: "Reset Password for Lend A Hand", // Subject line
      html: `<div>
					<h2>Reset Password for your Lend A Hand account</h2>
					<br/>
					Forgot your password? No worries! Just click this link to 
					<a href="${url}">reset your password</a>. 
					<br>
					Note that this link is valid for only the next 10 minutes. 
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
      subject: "Please payment for Lend A Hand", // Subject line
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
      subject: "Change your wallet address for Lend A Hand", // Subject line
      html: `<div>
					<h2>Change your wallet address for your Lend A Hand account</h2>
					<br/>
					Change your wallet? No worries! Just click this link to 
					<a href="${url}">change your wallet</a>. 
					<br>
					Note that this link is valid for only the next 10 minutes. 
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
