import axios from "axios";
import queryString from "query-string";

import store from "@/store";
import i18n from "@/i18n";
import Admin from "./Admin";
import Auth from "./Auth";

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

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = store.getState().auth;

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(new Error("No refresh token"), null);
        // Redirect to login or clear auth
        store.dispatch({ type: "auth/LOGOUT" });
        return Promise.reject(error);
      }

      try {
        // Determine if it's admin or user based on the URL
        const isAdminRequest = originalRequest.url?.includes("/admin/");
        let refreshResponse;

        if (isAdminRequest) {
          refreshResponse = await Admin.refresh({ refreshToken });
        } else {
          const userInfo = store.getState().auth.userInfo;
          refreshResponse = await Auth.refresh({
            email: userInfo?.email,
            refreshToken,
          });
        }

        const { accessToken: newAccessToken } = refreshResponse.data;

        // Update store with new access token
        store.dispatch({ type: "auth/REFRESH_TOKEN", payload: newAccessToken });

        // Update the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // Refresh failed, logout user
        store.dispatch({ type: "auth/LOGOUT" });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
