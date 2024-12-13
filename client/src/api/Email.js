import API from "./API";
import { URL_API_EMAIL } from "./URL";

const Email = {
  createEmail: (body) => {
    return API.post(`${URL_API_EMAIL}`, body);
  },
};

export default Email;
