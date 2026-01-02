import API from './API';
import { URL_API_KYC } from './URL';

const Page = {
  startKYC: () => {
    return API.get(`${URL_API_KYC}/start`);
  },
  register: (body) => {
    return API.post(`${URL_API_KYC}/register`, body);
  },
  claim: (body) => {
    return API.post(`${URL_API_KYC}/claim`, body);
  },
  getDouble: (pageNumber, keyword) => {
    return API.get(`${URL_API_KYC}/double?pageNumber=${pageNumber}&keyword=${keyword}`);
  },
  checkKyc: (body) => {
    return API.post(`${URL_API_KYC}/checkKyc`, body);
  },
  moveSystem: (body) => {
    return API.post(`${URL_API_KYC}/move-system`, body);
  },
  startUpdateInfo: (body) => {
    return API.post(`${URL_API_KYC}/start-update-info`, body);
  }
};

export default Page;
