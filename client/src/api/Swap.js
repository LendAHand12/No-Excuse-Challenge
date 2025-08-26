import API from './API';
import { URL_API_SWAP } from './URL';

const Swap = {
  getAllSwaps: () => {
    return API.get(URL_API_SWAP);
  },
  request: (body) => {
    return API.post(URL_API_SWAP, body);
  },
};

export default Swap;
