import dotenv from "dotenv";
import transporter from "./transporter.js";

dotenv.config();

export const sendMailUpdateLayerForAdmin = async (listUser) => {
  // set the correct mail option
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: process.env.CC_MAIL,
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

export const sendActiveLink = async (email, link) => {
  // set the correct mail option
  const mailOptions = {
    from: process.env.EMAIL, // sender address
    to: email,
    subject: "KÍCH HOẠT APP MTD - LAH",
    html: `
    <div>
    <p class="MsoNormal">
    <b>
    <span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">
    <br>&nbsp;&nbsp;&nbsp;</span></b><b><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black"><img width="182" height="181" style="width:1.8958in;height:1.8854in" id="m_8405509371388206043Picture_x0020_1" src="https://res.cloudinary.com/dhqggkmto/image/upload/v1690189285/unnamed_wwtijg.png" alt="signature_595371848" data-image-whitelisted="" class="CToWUd" data-bit="iit"><span>&nbsp;</span></span></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:16.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#0070c0">&nbsp;</span><b><span style="font-size:16.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#0070c0">Chúc mừng Quý Khách Hàng đã là thành viên của Lend A Hand!</span></b><span style="font-size:16.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:16.0pt;color:black">&nbsp; </span><span style="font-size:13.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#081c36;letter-spacing:.15pt;background:white">&nbsp;L.A.H tin rằng Quý khách hàng sẽ tiếp tục mang lại những đóng góp quan trọng cho cộng đồng Lend A Hand và làm việc cùng nhau để đạt được những thành công lớn hơn nữa.</span><span style="font-size:16.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal" style="margin-left:36.0pt"><span style="font-size:13.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#081c36;letter-spacing:.15pt;background:white">&nbsp;</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span style="font-size:16.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#0070c0">Công Ty CP AMERITEC chuyên cung cấp phần mền bảo mật cho thiết bị di động!</span></b><span style="font-size:16.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal" style="margin-left:36.0pt"><span style="font-size:13.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;&nbsp;&nbsp; </span><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">X</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">in gửi đến quý khách hàng&nbsp;<b>Activation Link (QR CODE)</b>&nbsp;để kích hoạt cho sản phẩm&nbsp;</span><b><i><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#92d050">MTD</span></i></b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;của chúng tôi.</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">Để cài đặt và kích hoạt ứng dụng&nbsp;</span></b><b><i><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#92d050">MTD</span></i></b><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">,</span></i></b><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;hãy làm theo các bước dưới đây:</span></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;</span></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">Bước 1</span></b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">: Tải xuống ứng dụng&nbsp;</span><b><i><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#92d050">MTD</span></i></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">&nbsp;</span></i></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">-Đối với thiết bị Android, vui lòng sử dụng liên kết sau:</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#4472c4">&nbsp;</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#4472c4"><a href="https://play.google.com/store/apps/details?id=com.zimperium.zips&amp;hl=vi&amp;gl=US" title="https://play.google.com/store/apps/details?id=com.zimperium.zips&amp;hl=vi&amp;gl=US" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://play.google.com/store/apps/details?id%3Dcom.zimperium.zips%26hl%3Dvi%26gl%3DUS&amp;source=gmail&amp;ust=1690275178889000&amp;usg=AOvVaw3cuVL0qUksOAmwrkU0-Ilv"><span lang="EN-US" style="color:#0563c1">MTD</span><span style="color:#0563c1">&nbsp;- Android</span></a></span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span style="font-size:11.0pt;color:black">&nbsp;<u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">-Đối với thiết bị iOS, vui lòng sử dụng liên kết sau:</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#4472c4"><a href="https://apps.apple.com/vn/app/zimperium-zips/id1030924459" title="https://apps.apple.com/vn/app/zimperium-zips/id1030924459" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://apps.apple.com/vn/app/zimperium-zips/id1030924459&amp;source=gmail&amp;ust=1690275178889000&amp;usg=AOvVaw0mJFL-dgShcMw5CV5tU1cz"><span lang="EN-US" style="color:#4472c4">MTD</span><span style="color:#4472c4">&nbsp;- iOS</span></a></span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">Bước 2</span></b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">: Trên thiết bị di động Android hoặc iOS của bạn, vui lòng sử dụng liên kết&nbsp;</span><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">bên&nbsp;</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">dưới để khởi chạy và kích hoạt ứng dụng&nbsp;</span><b><i><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">MTD</span></i></b><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">.</span></i></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">&nbsp;</span></i></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span lang="VI" style="font-size:16.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#92d050">Activation Link:&nbsp;&nbsp;</span></b><span lang="VI" style="font-size:11.0pt;color:black">
    <a href="https://ameritec.zimperium.com/api/acceptor/v1/user-activation/activation?stoken=${link}">LINK</a>
    </span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span style="font-size:11.0pt;color:black">&nbsp;<u></u><u></u></span></p><p class="MsoNormal"><b><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">-Lưu&nbsp;</span></b><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">Ý:</span></b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;Nếu Quý khách nhấp vào Activation Link mà ko kích hoạt được App&nbsp;</span><b><i><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#92d050">MTD</span></i></b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;quý khách có thể copy đường link đó và dán vào các trình duyệt như Chrome, Safari, Coccoc … để được kích hoạt.</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;background:white">-Cảnh báo.</span></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">&nbsp; &nbsp;&nbsp;1. Giữ&nbsp;</span></i><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">Activation Link (<span style="background:white">QR CODE)</span></span></i></b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">&nbsp;của quý khách cẩn thận.</span></i><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><i><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">&nbsp;&nbsp;</span></i><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">2. Thời gian sử dụng bản quyền là 365 ngày tính từ ngày quý khách đăng ký thành viên thành công trên website:</span></i><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;background:white">https:// <a href="http://ameritecjsc.com.vn" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://ameritecjsc.com.vn&amp;source=gmail&amp;ust=1690275178889000&amp;usg=AOvVaw3_cLqRtrqTmemrIYazkH1Y">ameritecjsc.com.vn</a></span></i></b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;background:white">&nbsp;</span></i><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">và khi hết thời gian bản quyền, công ty chúng tôi sẽ gửi email thông báo và hướng dẫn gia hạn cho quý khách hàng.</span></i><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">&nbsp; &nbsp;3.</span></i><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47;background:white">&nbsp;Activation Link&nbsp;</span></i></b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">này chỉ dùng để kích hoạt cho thiết bị di động chạy hệ điều hành Adroid hoặc IOS.</span></i><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">&nbsp; &nbsp;4<b>.</b></span></i><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">&nbsp;</span></i></b><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#70ad47">Activation Link (<span style="background:white">QR CODE)&nbsp;</span></span></i></b><b><i><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;background:white">chỉ được kích hoạt cho một thiết bị.</span></i></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">Mọi Thắc mắc xin liên hệ về đội kỹ thuật của công ty chúng tôi để được hỗ trợ</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black">, xin cảm ơn!</span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><i><span style="font-size:11.0pt;color:black">&nbsp;</span></i><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><b><i><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black;background:white">Best Regards &amp; Thanks!</span></i></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal" style="background:white"><b><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">Van Truong (Mr.)</span></b><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal" style="background:white"><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">IT CHIEF&nbsp;</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">OF SECURITY OFFICER</span><span lang="VI" style="font-size:11.0pt;color:black">&nbsp;</span><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">| AMERITECJSC<br>2</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">9 VO VAN TAN</span><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">, Ward&nbsp;</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">VO THI SAU</span><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">, District&nbsp;</span><span lang="VI" style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">3&nbsp;</span><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">| Ho Chi Minh City, Vietnam<b><br></b>T: (+84-28) 2250.8166<br>Email:&nbsp;<a href="mailto:vantt@ameritecjsc.com" title="mailto:vantt@ameritecjsc.com" target="_blank"><span style="color:#0563c1">vantt@ameritecjsc.com</span></a></span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal" style="background:white"><span style="font-size:11.0pt;font-family:&quot;Tahoma&quot;,sans-serif;color:black">Website:&nbsp;<a href="https://ameritecjsc.com.vn/" title="https://ameritecjsc.com.vn/" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://ameritecjsc.com.vn/&amp;source=gmail&amp;ust=1690275178889000&amp;usg=AOvVaw255YX8y0v8ix8HbRnJk1iv"><span style="color:#0563c1">https</span><span lang="VI" style="color:#0563c1">://ameritecjsc.<wbr>com.vn</span></a></span><span style="font-size:11.0pt;color:black"><u></u><u></u></span></p><p class="MsoNormal"><span style="font-size:11.0pt;color:black">&nbsp;<u></u><u></u></span></p></div>
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
