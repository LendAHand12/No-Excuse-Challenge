import API from "./API";
import { URL_API_PACKAGE } from "./URL";

const Package = {
  getAllPackages: () => {
    return API.get(URL_API_PACKAGE);
  },
  updatePackages: (body) => {
    return API.post(URL_API_PACKAGE, body);
  },
};

export default Package;
