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
};

export default Page;
