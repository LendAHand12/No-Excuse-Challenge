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
    
    // Check if data is FormData or if customContentType is multipart/form-data
    const isFormData = config.data instanceof FormData || config.customContentType === "multipart/form-data";
    
    // Don't set Content-Type for FormData - let axios handle it automatically
    // Axios will set the correct Content-Type with boundary for FormData
    if (!isFormData) {
      config.headers["Content-Type"] = "application/json";
    } else {
      // Remove Content-Type header to let axios set it automatically with boundary
      delete config.headers["Content-Type"];
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
