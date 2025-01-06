import API from './API';
import { URL_API_CLAIM } from './URL';

const Claim = {
  hewe: () => {
    return API.post(`${URL_API_CLAIM}/hewe`);
  },
  usdt: () => {
    return API.post(`${URL_API_CLAIM}/usdt`);
  },
};

export default Claim;
