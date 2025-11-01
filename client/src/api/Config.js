import API from './API';
import { URL_API_CONFIG } from './URL';

const Config = {
  list: () => {
    return API.get(`${URL_API_CONFIG}`);
  },
  update: (body) => {
    return API.post(`${URL_API_CONFIG}`, body);
  },
  getExchangeRate: () => {
    return API.get(`${URL_API_CONFIG}/exchange-rate`);
  },
};

export default Config;
