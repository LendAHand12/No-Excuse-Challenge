import API from './API';
import { URL_API_ICE_BREAKER } from './URL';

const IceBreaker = {
  list: () => {
    return API.get(
      `${URL_API_ICE_BREAKER}`
    );
  },
};

export default IceBreaker;
