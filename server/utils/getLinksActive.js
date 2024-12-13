import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const makeid = (length) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };


export const getActiveLink = async (email, full_name, phone) => {
  let accessToken = "";
  let groupId = "";
  var links = [];
  await axios
    .post(`${process.env.APP_ZIMPERIUM_LOGIN_LINK}`, {
      clientId: process.env.APP_ZIMPERIUM_CLIENT,
      secret: process.env.APP_ZIMPERIUM_SECRET,
    })
    .then((res) => {
      accessToken = res.data.accessToken;
    })
    .catch((err) => {
      console.log("err in get active link accessToken", err);
    });

  await axios
    .get(`${process.env.APP_GET_GROUPS_LINK}`, {
      headers: {
        Authorization: "Bearer " + accessToken,
        ContentType: "application/json",
      },
    })
    .then((res) => {
      groupId = res.data[0].id;
    })
    .catch((err) => {
      console.log("err in get active link groupId", err);
    });
let ran = makeid(10);
  await axios
    .post(
      `${process.env.APP_CREATE_USER_LINK}`,
      {
        activationLimit: 10,
        email,
        firstName: full_name,
        groupId,
        lastName: ran,
        phoneNumber: phone,
        sendEmailInvite: false,
        sendSmsInvite: false,
      },
      {
        headers: {
          Authorization: "Bearer " + accessToken,
          ContentType: "application/json",
        },
      }
    )
    .then(async (res) => {
      links.push(res.data.shortToken);
      console.log("link in get", links);
    })
    .catch((err) => {
      console.log("err in get active link", err);
    });

  return links;
};
