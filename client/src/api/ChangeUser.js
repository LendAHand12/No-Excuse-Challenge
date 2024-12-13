import API from "./API";
import { URL_API_CHANGE_USER } from "./URL";

const Package = {
  getByUser: () => {
    return API.get(URL_API_CHANGE_USER);
  },
  create: (body) => {
    return API.post(URL_API_CHANGE_USER, body);
  },
  cancel: () => {
    return API.get(`${URL_API_CHANGE_USER}/cancel`);
  },
  getList: (pageNumber, keyword) => {
    return API.get(
      `${URL_API_CHANGE_USER}/list?pageNumber=${pageNumber}&keyword=${keyword}`
    );
  },
  getDetail: (id) => {
    return API.get(`${URL_API_CHANGE_USER}/detail/${id}`);
  },
  reject: (body) => {
    return API.post(`${URL_API_CHANGE_USER}/reject`, body);
  },
  approve: (body) => {
    return API.post(`${URL_API_CHANGE_USER}/approve`, body);
  },
};

export default Package;
