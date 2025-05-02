import API from './API';
import { URL_API_KYC } from './URL';

const Page = {
  startKYC: () => {
    return API.get(`${URL_API_KYC}/start`);
  },
};

export default Page;
