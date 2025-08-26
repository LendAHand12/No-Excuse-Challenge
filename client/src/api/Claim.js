import API from './API';
import { URL_API_CLAIM } from './URL';

const Claim = {
  hewe: () => {
    return API.post(`${URL_API_CLAIM}/hewe`);
  },
  amc: () => {
    return API.post(`${URL_API_CLAIM}/amc`);
  },
  usdt: ({ user_id, token, amount }) => {
    return API.post(`${URL_API_CLAIM}/usdt`, { user_id, token, amount });
  },
  list: (pageNumber, coin, keyword) => {
    return API.get(
      `${URL_API_CLAIM}/list/?pageNumber=${pageNumber}&coin=${coin}&keyword=${keyword}`,
    );
  },
  export: (body) => {
    return API.post(`${URL_API_CLAIM}/export`, body);
  },
  user: (pageNumber, coin) => {
    return API.get(
      `${URL_API_CLAIM}/user/?pageNumber=${pageNumber}&coin=${coin}`,
    );
  },
  reset: () => {
    return API.get(`${URL_API_CLAIM}/reset`);
  },
  price: (body) => {
    return API.post(`${URL_API_CLAIM}/price`, body);
  },
};

export default Claim;
