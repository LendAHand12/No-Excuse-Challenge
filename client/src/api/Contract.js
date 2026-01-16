import API from "./API";
import { URL_API_CONTRACTS } from "./URL";

const Contract = {
  generateContract: (userId) => {
    return API.get(`${URL_API_CONTRACTS}/generate/${userId}`, {
      responseType: "blob",
    });
  },
  getContractContent: (userId) => {
    return API.get(`${URL_API_CONTRACTS}/content/${userId}`);
  },
};


export default Contract;
