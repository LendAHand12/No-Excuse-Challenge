import API from './API';
import { URL_API_CLAIM } from './URL';

const Claim = {
  hewe: () => {
    return API.post(`${URL_API_CLAIM}/hewe`);
  },
  usdt: ({ user_id, token }) => {
    return API.post(`${URL_API_CLAIM}/usdt`, { user_id, token });
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
};

export default Claim;
