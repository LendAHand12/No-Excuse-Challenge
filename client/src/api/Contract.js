import API from "./API";
import { URL_API_CONTRACTS } from "./URL";

const Contract = {
  generateContract: (userId) => {
    return API.get(`${URL_API_CONTRACTS}/generate/${userId}`, {
      responseType: "blob",
    });
  },
  getPreviewData: (userId) => {
    return API.get(`${URL_API_CONTRACTS}/preview-data/${userId}`);
  },
};


export default Contract;
