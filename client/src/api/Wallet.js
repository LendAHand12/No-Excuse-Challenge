import API from "./API";
import { URL_API_WALLET } from "./URL";

const Wallet = {
  getAllWallets: () => {
    return API.get(URL_API_WALLET);
  },
  updateWallets: (body) => {
    return API.post(URL_API_WALLET, body);
  },
};

export default Wallet;
