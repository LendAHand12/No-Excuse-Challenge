// server/wellsfargo/wireTransfer.js
import axios from "axios";
import https from "https";
import fs from "fs";

const consumerKey = "KpVE2AsYptNoGBZXwTbd7Xh8EnHUMGzH";
const consumerSecret = "n14KmAADsVLuEr8r";

// Tạo base64 Basic Auth
const getAuthHeader = () => {
  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );
  return `Basic ${token}`;
};

const getToken = async () => {
  const endpoint =
    "https://api-sandbox.wellsfargo.com/oauth2/v1/token?grant_type=client_credentials&scope=Wires-Payments-Status%20Wires-Payments%20Wires-Payments-Template'";
  const res = await axios.post(
    endpoint,
    {},
    {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        "gateway-entity-id": "2245227474-56ac0-8ac34",
        "client-request-id": "e1de7d97-e0b2-49f7-b436-5f487a40c271",
      },
    }
  );
  if (res.data.access_token) {
    return `Bearer ${res.data.access_token}`;
  } else {
    console.log("Error when get token");
  }
};

// Tạo HTTPS Agent dùng mTLS
// const httpsAgent = new https.Agent({
//   cert: fs.readFileSync("certs/client-cert.pem"),
//   key: fs.readFileSync("certs/client-key.pem"),
//   ca: fs.readFileSync("certs/ca.pem"),
// });

// Gửi lệnh wire
const makeTransfer = async () => {
  const endpoint =
    "https://api-sandbox.wellsfargo.com/instant-payments/v1/credit-transfers";

  const wirePayload = {
    end_to_end_id: "DB32819",
    amount: "11.77",
    currency: "USD",
    debtor: {
      routing_number: "091000012",
      account_number: "1000031912",
    },
    creditor: {
      legal_entity_id: "92832902384519323565",
      name: "Dr John Doe",
      street_number: "2982",
      street_name: "Main St",
      city: "Raleigh",
      state: "NC",
      postal_code: "27513",
      country: "US",
      routing_number: "021011222",
      account_number: "1596397269",
    },
    ultimate_creditor: {
      private_id: "529791232",
      name: "Health Hospital",
      street_number: "5000",
      street_name: "Healthy Way.",
      address_line_2: "Floor Four",
      city: "Greenville",
      state: "SC",
      postal_code: "29601",
      country: "US",
    },
    remittance: {
      remittance_id: "RemitId_9876",
      remittance_location_method: "URID",
      remittance_location: "www.healthyhospital.com/abcd/remitdoc",
      remittance_information_unstructured: "Your invoice information.",
    },
  };

  try {
    const auth = await getToken();
    const res = await axios.post(endpoint, wirePayload, {
      //   httpsAgent,
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
        "gateway-entity-id": "2245227474-56ac0-8ac34",
        "client-request-id": "e1de7d97-e0b2-49f7-b436-5f487a40c271",
        "ceo-company-id": "AMERITECIPSLLC",
      },
    });
    console.log({ data: res.data });

    return res.data;
  } catch (err) {
    console.log("Wire Transfer Error:", err.response.data);
  }
};

export { makeTransfer };
