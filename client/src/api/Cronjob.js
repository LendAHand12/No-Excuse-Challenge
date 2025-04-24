import API from "./API";
import {
  URL_API_CRONJOB
} from "./URL";

const Cronjob = {
  run: (body) => {
    return API.post(`${URL_API_CRONJOB}/run`, body);
  },
};

export default Cronjob;
