import API from "./API";
import {
  URL_API_AUTH_LOGIN,
  URL_API_AUTH_REGISTER,
  URL_API_AUTH_REF,
  URL_API_AUTH_CONFIRM,
  URL_API_AUTH_FORGOT_PASSWORD,
  URL_API_AUTH_RESET_PASSWORD,
  URL_API_AUTH_REFRESH,
  URL_API_AUTH_GET_VERIFY,
  URL_API_AUTH_GET_IP_AND_LOCATION,
} from "./URL";

const Auth = {
  checkLinkRef: (body) => {
    return API.post(URL_API_AUTH_REF, body);
  },
  login: (body) => {
    return API.post(URL_API_AUTH_LOGIN, body);
  },
  register: (body) => {
    return API.post(URL_API_AUTH_REGISTER, body);
  },
  confirm: (token) => {
    return API.get(`${URL_API_AUTH_CONFIRM}/${token}`);
  },
  forgotPassword: (body) => {
    return API.post(URL_API_AUTH_FORGOT_PASSWORD, body);
  },
  resetPassword: (body) => {
    return API.put(URL_API_AUTH_RESET_PASSWORD, body);
  },
  refresh: (body) => {
    return API.post(URL_API_AUTH_REFRESH, body);
  },
  getLinkVerify: (body) => {
    return API.post(URL_API_AUTH_GET_VERIFY, body);
  },
  getIpAndLocation: () => {
    return API.get(URL_API_AUTH_GET_IP_AND_LOCATION);
  },
};

export default Auth;
