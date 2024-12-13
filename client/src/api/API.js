import axios from "axios";
import queryString from "query-string";

import store from "@/store";
import i18n from "@/i18n";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 120000,
  paramsSerializer: (params) => queryString.stringify(params),
});

API.interceptors.request.use(
  function (config) {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    config.headers["Accept-Language"] = i18n.language;
    config.headers["Content-Type"] = "application/json";
    if (config.customContentType === "multipart/form-data") {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    if (config.pageName) {
      config.headers["page-name"] = config.pageName;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default API;
